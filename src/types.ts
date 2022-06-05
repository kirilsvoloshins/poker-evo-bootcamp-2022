import { Card } from "./classes/Card";
import { Player } from "./classes/Player";
import StoreVal from "./Store";
import { BET_ACTION, COMBINATIONS, COMBINATION_NAMES_HUMAN } from "./utils";

export type StoreType = typeof StoreVal;
export type ComponentNames = "Menu" | "Game" | "Settings" | "Credits";
export type NavButtonProps = {
  btnText: string,
  screenToOpen: ComponentNames,
  isBackButton?: boolean,
  onPress?: () => void,
};
export type GameMenuProps = {
  name: string,
};
export type GameScreenProps = {
  name: string,
};
export type Suit = "diamonds" | "clubs" | "hearts" | "spades";
export type SuitSymbol = "♦" | "♣" | "♥" | "♠";
export type CardName = "six" | "seven" | "eight" | "nine" | "ten" | "jack" | "queen" | "king" | "ace";
export type CardNameSymbol = "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
export type CardType = {
  suit: Suit,
  suitSymbol: SuitSymbol,
  cardName: CardName,
  cardNameSymbol: CardNameSymbol,
};
export type PlayerType = {
  isAi: boolean, // human will have false here
  name: string,
  id: number,
  isPlaying: boolean, // if is not playing, show the cards!
  money: number, // amount of money left
  cards?: any[]
};
export type GameState = "";

// interface SuitSymbols {
//   [suit in keyof Suit]
// }

// export type { ComponentNames, GameMenuProps, NavButtonProps, GameScreenProps, Card, Suit, CardName, SuitSymbol, CardNameSymbol, Player, GameState };

export interface GameEvent {
  eventTime: string,
  event: string
}

export interface PlaceBetArguments {
  betAmount: number,
  store: StoreType,
  betAction: BET_ACTION
  // isSupportBet?: boolean,
  // isRaiseBet?: boolean,
  // isAllIn?: boolean,
  // isBigBlind?: boolean,
  // isSmallBlind?: boolean,
}

export type PlayerT = typeof Player;

export interface Winner {
  id: number,
  cards: Card[],
  combinationName: COMBINATIONS,
  bestCombinationCards: Card[],
  winAmount: number,
  playerName: string,
}