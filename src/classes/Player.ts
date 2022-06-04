// import { ComponentNames, Card, SuitSymbol, CardNameSymbol, GameState } from "../types";
import { SuitSymbol, StoreType, PlaceBetArguments } from "../types";
import { suits, cardNames, suitSymbols, cardNameSymbols, aiPlayerNames, humanPlayerNames, amountOfCardsInTheDeck, cardCosts, POKER_ROUNDS, getGameEventText, BET_ACTION } from "../utils";
import { Card } from "./Card";
import { Players } from "./Players";
import StoreVal from "../Store";
import store from "../Store";
import { makeAutoObservable } from "mobx";

interface PlayerType {
  name: string,
  id: number,
  moneyLeft: number, // amount of money left
  sumOfPersonalBetsInThisRound: number, // money bet in this round
  betToPayToContinue: number, // money left to bet to continue playing
  sumToWinIfPlayerGoesAllIn: number, // if player goes all in, he gets all money in the round + his bet + equivalent bets of other players
  cards: [Card, Card] | Card[], //! fixing:  Type '[Card, Card]' is not assignable to type 'null'.ts(2322)

  hasReacted: boolean,
  isAllIn: boolean,
  hasFolded: boolean,
  /* player state */
  canSupportBet: boolean,
  canCheck: boolean,
  canRaise: boolean,
}

interface PlayerConstructorArgs {
  name: string,
  id: number,
  moneyLeft: number, // amount of money left
  cards: [Card, Card] | Card[]
}


export class Player implements PlayerType {
  name = ""; // player name
  id = 0; // player id (used in getting the next player) 
  cards: [Card, Card] | Card[];

  moneyLeft = 0; // money left
  sumOfPersonalBetsInThisRound = 0; // sum of money the player has bet in this round
  betToPayToContinue = 0; // money left to bet to continue playing
  sumToWinIfPlayerGoesAllIn = 0; // if player goes all in, he gets all money in the round + his bet + equivalent bets of other players

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
    // store.addToSumOfBets(betAmount);
    if (this.sumOfPersonalBetsInThisRound > store.maxSumOfIndividualBets) {
      store.maxSumOfIndividualBets = this.sumOfPersonalBetsInThisRound;
    }

    const gameEventText = getGameEventText({ name, betAmount, betAction });
    store.logGameEvent(gameEventText);

    store.players.passMove(store);
  }

  pickCard(cardToTake: Card) {
    this.cards.push(cardToTake);
  }
}