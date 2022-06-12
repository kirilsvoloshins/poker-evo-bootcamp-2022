import { StoreType, PlaceBetArguments, PlayerConstructorArgs, PlayerType, RaiseBetArguments } from "../types";
import { BET_ACTION, COMBINATIONS } from "../consts";
import { getGameEventText } from "../utils";
import { Card } from "./Card";
import { makeAutoObservable } from "mobx";

export class Player implements PlayerType {
  name = "";
  id = 0;
  cards = [] as Card[];
  bestCombinationName = COMBINATIONS.HIGH_CARD;
  bestCombinationCards = [] as Card[];
  winAmount = 0;

  cardsAtCombination = {
    [COMBINATIONS.ROYAL_FLUSH]: {
      combinationCards: [] as Card[],
      highestCardInCombination: {} as Card,
      highestCardOutsideCombination: {} as Card,
    },
    [COMBINATIONS.STRAIGHT_FLUSH]: {
      combinationCards: [] as Card[],
      highestCardInCombination: {} as Card,
      highestCardOutsideCombination: {} as Card,
    },
    [COMBINATIONS.FOUR_OF_KIND]: {
      combinationCards: [] as Card[],
      highestCardInCombination: {} as Card,
      highestCardOutsideCombination: {} as Card,
    },
    [COMBINATIONS.FULL_HOUSE]: {
      combinationCards: [] as Card[],
      highestCardInCombination: {} as Card,
      highestCardOutsideCombination: {} as Card,
    },
    [COMBINATIONS.FLUSH]: {
      combinationCards: [] as Card[],
      highestCardInCombination: {} as Card,
      highestCardOutsideCombination: {} as Card,
    },
    [COMBINATIONS.STRAIGHT]: {
      combinationCards: [] as Card[],
      highestCardInCombination: {} as Card,
      highestCardOutsideCombination: {} as Card,
    },
    [COMBINATIONS.THREE_OF_KIND]: {
      combinationCards: [] as Card[],
      highestCardInCombination: {} as Card,
      highestCardOutsideCombination: {} as Card,
    },
    [COMBINATIONS.TWO_PAIRS]: {
      combinationCards: [] as Card[],
      highestCardInCombination: {} as Card,
      highestCardOutsideCombination: {} as Card,
    },
    [COMBINATIONS.PAIR]: {
      combinationCards: [] as Card[],
      highestCardInCombination: {} as Card,
      highestCardOutsideCombination: {} as Card,
    },
    [COMBINATIONS.HIGH_CARD]: {
      combinationCards: [] as Card[],
      highestCardInCombination: {} as Card,
      highestCardOutsideCombination: {} as Card,
    },
  };

  moneyLeft = 0;
  sumOfPersonalBetsInThisRound = 0; // sum of money the player has bet in this round
  betToPayToContinue = 0; // money left to bet to continue playing
  sumToWinIfPlayerGoesAllIn = 0; // if player goes all in, he gets all money in the round + his bet + equivalent bets of other players
  allInSum = 0;

  hasReacted = false;
  isAllIn = false;
  hasFolded = false;
  /* player state */
  canCheck = false;
  canSupportBet = false;
  canRaise = false;
  canGoAllIn = false;

  constructor({ name, id, moneyLeft }: PlayerConstructorArgs) {
    this.name = name;
    this.id = id;

    this.moneyLeft = moneyLeft;
    this.sumOfPersonalBetsInThisRound = 0;
    this.betToPayToContinue = 0;
    this.sumToWinIfPlayerGoesAllIn = 0;
    this.allInSum = 0;

    this.hasReacted = false;
    this.isAllIn = false;
    this.hasFolded = false;

    this.canCheck = false;
    this.canSupportBet = false;
    this.canRaise = false;

    makeAutoObservable(this);
  }

  /* player actions! */
  fold(store: StoreType) {
    this.hasFolded = true;
    store.logGameEvent(`${this.name}: folds`);
    store.players.passMove(store);
  }

  check(store: StoreType) {
    this.hasReacted = true;
    store.logGameEvent(`${this.name}: checks`);
    store.players.passMove(store);
  }

  supportBet(store: StoreType) {
    this.hasReacted = true;
    const { betToPayToContinue } = this;
    this.placeBet({ betAmount: betToPayToContinue, store, betAction: BET_ACTION.SUPPORT });
  }

  raiseBet({ store, bet }: RaiseBetArguments) {
    store.players.playersLeftToReact.filter(player => player !== this && !player.isAllIn && player.moneyLeft > 0).forEach(player => {
      // everyone still playing has to react to the bet raise
      player.hasReacted = false;
    });
    this.placeBet({ betAmount: bet, store, betAction: BET_ACTION.RAISE });
  }

  allIn(store: StoreType) {
    const { moneyLeft } = this;
    store.players.playersLeftToReact.filter(player => player !== this && !player.isAllIn && player.moneyLeft > 0).forEach(player => {
      // everyone still playing has to react to the bet raise
      player.hasReacted = false;
    });
    this.isAllIn = true;
    this.allInSum = moneyLeft;
    this.sumToWinIfPlayerGoesAllIn = store.sumOfBets + moneyLeft;
    this.placeBet({ betAmount: moneyLeft, store, betAction: BET_ACTION.ALL_IN });
  }

  placeBet({ betAmount, store, betAction }: PlaceBetArguments) {
    const { moneyLeft, name } = this;
    const canThePlayerBet = moneyLeft >= betAmount;
    if (!canThePlayerBet) {
      debugger;
      return alert(`Player "${name}" can not bet ${betAmount}! ${betAction}`);
    }

    if (![BET_ACTION.SMALL_BLIND, BET_ACTION.BIG_BLIND].includes(betAction)) {
      this.hasReacted = true;
    }
    this.moneyLeft -= betAmount;
    this.sumOfPersonalBetsInThisRound += betAmount;
    store.sumOfBets += betAmount;
    if (this.sumOfPersonalBetsInThisRound > store.maxSumOfIndividualBets) {
      store.maxSumOfIndividualBets = this.sumOfPersonalBetsInThisRound;
    }

    const playersAllInInThisRound = store.players.playersStillInThisRound.filter(player => player.isAllIn && player !== this);
    if (playersAllInInThisRound.length) {
      playersAllInInThisRound.forEach(player => {
        const { allInSum } = player;
        player.sumToWinIfPlayerGoesAllIn += allInSum;
      });
    }

    const gameEventText = getGameEventText({ name, betAmount, betAction });
    store.logGameEvent(gameEventText);

    store.players.passMove(store);
  }

  pickCard(cardToTake: Card) {
    cardToTake.isHidden = true;
    this.cards.push(cardToTake);
  }

  dropCards() {
    this.cards = [];
  }

  showCards() {
    this.cards.forEach(card => card.show());
  }

  hideCards() {
    this.cards.forEach(card => card.hide());
  }
}