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
  hasFolded: boolean, // if is not playing, show the cards!
  moneyLeft: number, // amount of money left
  cards: [Card, Card] | Card[]
}

interface PlayerConstructorArgs {
  name: string,
  id: number,
  moneyLeft: number, // amount of money left
  cards: [Card, Card] | Card[]
}

const getSortedArrayofCards = (cardA: Card, cardB: Card): any => {
  const { cardCost: cardCost_1 } = cardA;
  const { cardCost: cardCost_2 } = cardB;
  return cardCost_2 - cardCost_1;
}


export class Player implements PlayerType {
  name = ""; // player name
  id = 0; //??? player id 
  isAllIn: boolean = false;
  moneyLeft = 0; // money left
  betAmount = 0; // money bet in this round
  betToPayToContinue = 0; // money left to bet to continue playing

  hasToReact: boolean = true;
  cards: [Card, Card] | Card[]; //! fixing:  Type '[Card, Card]' is not assignable to type 'null'.ts(2322)
  // isAbleToContinuePlaying: boolean = true;

  isAbleToContinuePlaying(store: StoreType) {
    return this.moneyLeft > store.minimumBet;
  }

  // hasActiveTurn = false; // it's turn of this player
  /* player history */
  hasChecked: boolean = false;
  hasFolded = false; // 
  hasReacted = false;
  /* player state */
  canCheck: boolean = false;
  canSupportBet: boolean = false;

  constructor({ name, id, moneyLeft, cards }: PlayerConstructorArgs) {
    this.name = name;
    this.id = id;
    this.hasFolded = false;
    this.moneyLeft = moneyLeft;
    this.cards = cards;
    this.betAmount = 0;

    makeAutoObservable(this);
  }

  getListOfCombinations(cardsOnTheDesk: Card[], players: Players) {
    const combinations = {
      hasRoyalFlush: false,       //todo  1.combo
      hasStraightFlush: false,    //  2.combo
      hasFourOfKind: false,       //  3.combo
      hasFullHouse: false,        //!  4.combo
      hasFlush: false,            //  5.combo
      hasStraight: false,         //  6.combo
      hasThreeOfKind: false,      //  7.combo
      hasTwoPairs: false,         //  8.combo
      hasPair: false,             //  9.combo
      hasHighCard: false,         // 10.combo
    };

    const cardsToCheck = [...cardsOnTheDesk, ...this.cards];
    const sortedCardsToCheck = cardsToCheck.sort(getSortedArrayofCards);
    const suitsOfCardsToCheck = cardsToCheck.map(({ suitSymbol }) => suitSymbol);
    const uniqueCardCosts = [...new Set(cardsToCheck.map(({ cardCost }) => cardCost))];
    const cardsWithPairs = uniqueCardCosts
      .map(uniqueCardCost => cardsToCheck.filter(({ cardCost }) => cardCost === uniqueCardCost))
      .filter(cardsWithMatchingCosts => cardsWithMatchingCosts.length === 2);
    const cardsWithThreeOfKinds = uniqueCardCosts
      .map(uniqueCardCost => cardsToCheck.filter(({ cardCost }) => cardCost === uniqueCardCost))
      .filter(cardsWithMatchingCosts => cardsWithMatchingCosts.length === 3);
    const cardsWithFourOfKinds = uniqueCardCosts
      .map(uniqueCardCost => cardsToCheck.filter(({ cardCost }) => cardCost === uniqueCardCost))
      .filter(cardsWithMatchingCosts => cardsWithMatchingCosts.length === 4);

    //* hasHighCard
    const highestCardOfThisPlayer = this.cards.sort(getSortedArrayofCards)[0];
    //todo: handle multiple highest cards (in all player cards)
    const highestCardOfAllPlayers = players.playerList
      .map(({ cards }) => cards.sort(getSortedArrayofCards)[0])
      .sort(getSortedArrayofCards)[0];
    const doesThisPlayerHaveTheHighestCard = highestCardOfAllPlayers.cardCost === highestCardOfThisPlayer.cardCost;
    combinations.hasHighCard = doesThisPlayerHaveTheHighestCard;

    //* hasPair
    const hasPair = cardsWithPairs.length === 1;
    combinations.hasPair = hasPair;

    //* hasTwoPairs
    const hasTwoPairs = cardsWithPairs.length === 2;
    combinations.hasTwoPairs = hasTwoPairs;

    //* hasThreeOfKind
    const hasThreeOfKind = cardsWithThreeOfKinds.length > 0;
    combinations.hasThreeOfKind = hasThreeOfKind;

    //* hasStraight
    const checkForStraight = (cardsToCheck: Card[]): boolean => {
      let amountOfCardsInPotentialStraight = 1, previousCardCost = 0;
      for (const { cardCost } of cardsToCheck) {
        const areCardsConsecutive = cardCost === previousCardCost - 1;
        amountOfCardsInPotentialStraight = areCardsConsecutive ? amountOfCardsInPotentialStraight + 1 : 1;
        previousCardCost = cardCost;
      }
      return amountOfCardsInPotentialStraight >= 5;
    }
    combinations.hasStraight = checkForStraight(cardsToCheck);

    //* hasFlush
    const uniqueSuitSymbols = Object.keys(suitSymbols) as SuitSymbol[];
    const hasFlush = uniqueSuitSymbols.map(uniqueSuitSymbol => {
      return cardsToCheck.filter(({ suitSymbol }) => suitSymbol === uniqueSuitSymbol).length >= 5;
    }).length > 0;
    combinations.hasFlush = hasFlush;

    //!!! hasFullHouse - we need to disable pairs and three-of-kinds if has full house
    const hasFullHouse = hasPair && hasThreeOfKind;
    combinations.hasFullHouse = hasFullHouse;

    //* hasFourOfKind
    const hasFourOfKind = cardsWithFourOfKinds.length === 1;
    combinations.hasFourOfKind = hasFourOfKind;

    //!!! todo: hasStraightFlush - we need to disable straight and flush
    const checkForStraightFlush = (cardsToCheck: Card[]): boolean => {
      let amountOfCardsInPotentialStraightFlush = 1, previousCardCost = 0, previousCardSuit = "";
      for (const { cardCost, suitSymbol } of cardsToCheck) {
        const areCardsPotentionallyInStraightFlush = cardCost === previousCardCost - 1 && suitSymbol === previousCardSuit;
        amountOfCardsInPotentialStraightFlush = areCardsPotentionallyInStraightFlush ? amountOfCardsInPotentialStraightFlush + 1 : 1;
        previousCardCost = cardCost;
      }
      return amountOfCardsInPotentialStraightFlush >= 5;
    }
    const hasStraightFlush = checkForStraightFlush(cardsToCheck);
    combinations.hasStraightFlush = hasStraightFlush;

    //* hasRoyalFlush
    const checkForRoyalFlush = (cardsToCheck: Card[]): boolean => {
      if (!combinations.hasFlush) {
        return false;
      }

      const flushSuit = uniqueSuitSymbols.filter(uniqueSuitSymbol => {
        return cardsToCheck.filter(({ suitSymbol }) => suitSymbol === uniqueSuitSymbol).length >= 5;
      })[0];

      const sortedCardsOfFlushSuit: Card[] = sortedCardsToCheck.filter(({ suitSymbol }) => suitSymbol === flushSuit);
      const isTheHighestCardAce = cardsToCheck[0].cardCost === cardCosts["ace"];
      if (!isTheHighestCardAce) {
        return false;
      }

      let amountOfCardsInPotentialRoyalFlush = 1, previousCardCost = 0, previousCardSuit = "";
      for (const { cardCost, suitSymbol } of sortedCardsOfFlushSuit) {
        const areCardsPotentionallyInRoyalFlush = cardCost === previousCardCost - 1 && suitSymbol === previousCardSuit;
        if (!areCardsPotentionallyInRoyalFlush) {
          return false;
        }

        amountOfCardsInPotentialRoyalFlush++;
        previousCardCost = cardCost;
      }
      return amountOfCardsInPotentialRoyalFlush >= 5;
    }
    const hasRoyalFlush = checkForRoyalFlush(cardsToCheck);
    combinations.hasStraightFlush = hasRoyalFlush;
  }


  /* player actions! */
  fold(store: StoreType) {
    this.hasFolded = true;
    this.canCheck = false;
    this.canSupportBet = false;
    store.logGameEvent(`${this.name}: folds`);
    store.players.passMove(store);
  }

  check(store: StoreType) {
    this.hasChecked = true;
    store.logGameEvent(`${this.name}: checks`);
    store.players.passMove(store);
  }

  supportBet(store: StoreType) {
    const { betToPayToContinue } = this;
    this.placeBet({ betAmount: betToPayToContinue, store, betAction: BET_ACTION.SUPPORT });
  }

  // isRaiseBet = false, isSupportBet = false, isAllIn = false, isBigBlind = false, isSmallBlind = false 

  placeBet({ betAmount, store, betAction }: PlaceBetArguments) {
    //todo: validate that the player can bet!
    //todo: can not bet lower than the sum to support!
    const { moneyLeft, name } = this;
    const canThePlayerBet = moneyLeft >= betAmount;
    if (!canThePlayerBet) {
      return alert(`Player "${name}" can not bet ${betAmount}!`);
    }

    store.addToSumOfBets(betAmount);
    this.betAmount += betAmount;
    this.moneyLeft -= betAmount;

    const gameEventText = getGameEventText({ name, betAmount, betAction });
    store.logGameEvent(gameEventText);

    store.players.passMove(store);
  }

  pickCard(cardToTake: Card) {
    this.cards.push(cardToTake);
  }
}