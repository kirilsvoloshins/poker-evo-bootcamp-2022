import { StoreType, PlaceBetArguments, PlayerConstructorArgs, PlayerType } from "../types";
import { BET_ACTION, COMBINATIONS } from "../consts";
import { getGameEventText } from "../utils";
import { Card } from "./Card";
import { makeAutoObservable } from "mobx";

export class Player implements PlayerType {
  name = ""; // player name
  id = 0; // player id (used in getting the next player) 
  cards: [Card, Card] | Card[];
  bestCombinationName = COMBINATIONS.HIGH_CARD;
  bestCombinationCards = [] as Card[];

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

  moneyLeft = 0; // money left
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

  constructor({ name, id, moneyLeft, cards }: PlayerConstructorArgs) {
    this.name = name;
    this.id = id;
    this.cards = cards;

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
    // this.hasChecked = true;
    this.hasReacted = true;
    store.logGameEvent(`${this.name}: checks`);
    store.players.passMove(store);
  }

  supportBet(store: StoreType) {
    this.hasReacted = true;
    const { betToPayToContinue } = this;
    this.placeBet({ betAmount: betToPayToContinue, store, betAction: BET_ACTION.SUPPORT });
  }

  raise({ store, bet }: { store: StoreType, bet: number }) {
    this.placeBet({ betAmount: bet, store, betAction: BET_ACTION.RAISE });
    store.players.playersLeftToReact.filter(player => player !== this).forEach(player => {
      // everyone still playing has to react to the bet raise
      player.hasReacted = false;
    });
  }

  allIn(store: StoreType) {
    const { moneyLeft } = this;
    this.isAllIn = true;
    this.allInSum = moneyLeft;
    this.sumToWinIfPlayerGoesAllIn = store.sumOfBets + moneyLeft;
    this.placeBet({ betAmount: moneyLeft, store, betAction: BET_ACTION.ALL_IN });
  }

  placeBet({ betAmount, store, betAction }: PlaceBetArguments) {
    //todo: validate that the player can bet!
    //todo: can not bet lower than the sum to support!
    const { moneyLeft, name } = this;
    const canThePlayerBet = moneyLeft >= betAmount;
    if (!canThePlayerBet) {
      return alert(`Player "${name}" can not bet ${betAmount}!`);
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
    this.cards.push(cardToTake);
  }
}