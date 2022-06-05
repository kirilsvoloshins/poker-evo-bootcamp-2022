import { Card } from "./classes/Card";
import { Player } from "./classes/Player";

import StoreVal from "./Store";
import { BET_ACTION, COMBINATIONS } from "./consts";

export type StoreType = typeof StoreVal;
export type ComponentNames = "Menu" | "Game" | "Settings" | "Credits";
export type Suit = "diamonds" | "clubs" | "hearts" | "spades";
export type SuitSymbol = "♦" | "♣" | "♥" | "♠";
export type CardName = "six" | "seven" | "eight" | "nine" | "ten" | "jack" | "queen" | "king" | "ace";
export type CardNameSymbol = "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
export type CardCost = 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;
export type GameState = "";

export interface GameEvent {
  eventTime: string,
  event: string
}

export interface PlaceBetArguments {
  betAmount: number,
  store: StoreType,
  betAction: BET_ACTION
}

export interface Winner {
  id: number,
  cards: Card[],
  combinationName: COMBINATIONS,
  bestCombinationCards: Card[],
  winAmount: number,
  playerName: string,
}

export interface PlayerConstructorArgs {
  name: string,
  id: number,
  moneyLeft: number, // amount of money left
  cards: [Card, Card] | Card[]
}

export interface PlayerType {
  name: string,
  id: number,
  cards: [Card, Card] | Card[], //! fixing:  Type '[Card, Card]' is not assignable to type 'null'.ts(2322)
  cardsAtCombination: Partial<Record<COMBINATIONS, {
    combinationCards: Card[],
    highestCardInCombination: Card,
    highestCardOutsideCombination: Card,
  }>>;
  bestCombinationName: COMBINATIONS;
  bestCombinationCards: Card[];

  moneyLeft: number, // amount of money left
  sumOfPersonalBetsInThisRound: number, // money bet in this round
  betToPayToContinue: number, // money left to bet to continue playing
  sumToWinIfPlayerGoesAllIn: number, // if player goes all in, he gets all money in the round + his bet + equivalent bets of other players
  allInSum: number;

  hasReacted: boolean,
  isAllIn: boolean,
  hasFolded: boolean,
  /* player state */
  canSupportBet: boolean,
  canCheck: boolean,
  canRaise: boolean,
}

export interface CardType {
  suit: Suit,
  suitSymbol: SuitSymbol,
  cardName: CardName,
  cardNameSymbol: CardNameSymbol,
  isHidden: boolean,
}

export interface CardConstructorArgs {
  suit: Suit,
  cardName: CardName,
}

export type PlayersAtCombinations = Partial<Record<COMBINATIONS, Player[]>>;

// --- constructorArgs
export interface PlayersConstructorArgs {
  amountOfHumanPlayers: number,
  initialMoney: number
}

// --- props ---
export interface NavButtonProps {
  btnText: string,
  screenToOpen: ComponentNames,
  isBackButton?: boolean,
  onPress?: () => void,
};
export interface GameMenuProps {
  name: string,
};
export interface GameScreenProps {
  name: string,
};
export interface CardProps {
  cardValue: CardNameSymbol,
  cardSuit: SuitSymbol
}
export interface GameResultOfPlayerProps {
  player: Winner
}
export interface PlayerCountCircleProps {
  amountOfPlayersToSet: number
};
export interface PlayerInfoProps {
  playerId: 0 | 1 | 2 | 3
}
export interface SwitchProps {
  active: string,
  children: JSX.Element[],
}