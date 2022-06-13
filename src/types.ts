import { Card } from "./classes/Card";
import { Player } from "./classes/Player";
import Store from "./Store";
import { BET_ACTION, COMBINATIONS, POKER_ROUNDS } from "./consts";

export type ComponentNames = "Menu" | "Game" | "Settings" | "Credits";
export type Suit = "diamonds" | "clubs" | "hearts" | "spades";
export type SuitSymbol = "♦" | "♣" | "♥" | "♠";
export type CardName = "two" | "three" | "four" | "five" | "six" | "seven" | "eight" | "nine" | "ten" | "jack" | "queen" | "king" | "ace";
export type CardNameSymbol = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K" | "A";
export type CardCost = 0 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;
export type GameState = "";

export interface GameEvent {
  eventTime: string,
  event: string,
}

export type StoreType = typeof Store;

export interface PlaceBetArguments {
  betAmount: number,
  store: StoreType,
  betAction: BET_ACTION,
}
export interface RaiseBetArguments {
  store: StoreType,
  bet: number,
}


export interface PlayerConstructorArgs {
  name: string,
  id: number,
  moneyLeft: number,
}

export interface GetWinnersArguments {
  sumOfBets: number,
  store: StoreType,
}

export interface PlayerType {
  name: string;
  id: number;
  cards: Card[],
  bestCombinationName: COMBINATIONS;
  bestCombinationCards: Card[];
  winAmount: number;

  cardsAtCombination: Partial<Record<COMBINATIONS, {
    combinationCards: Card[],
    highestCardInCombination: Card,
    highestCardOutsideCombination: Card,
  }>>;

  moneyLeft: number;
  sumOfPersonalBetsInThisRound: number;
  betToPayToContinue: number;
  sumToWinIfPlayerGoesAllIn: number; // if player goes all in, he gets all money in the round + his bet + equivalent bets of other players
  allInSum: number;

  hasReacted: boolean;
  isAllIn: boolean;
  hasFolded: boolean;
  /* player state */
  canCheck: boolean;
  canSupportBet: boolean;
  canRaise: boolean;
  canGoAllIn: boolean;

  fold: (store: StoreType) => void;
  check: (store: StoreType) => void;
  supportBet: (store: StoreType) => void;
  raiseBet: ({ store, bet }: RaiseBetArguments) => void;
  allIn: (store: StoreType) => void;
  placeBet: ({ betAmount, store, betAction }: PlaceBetArguments) => void;
  pickCard: (cardToTake: Card) => void;
  dropCards: () => void;
}


export interface PlayersConstructorArgs {
  amountOfHumanPlayers: number,
  initialMoney: number,
}
export interface PlayersType {
  playerList: Player[]; // static list of players which entered the game (on game start we delete ones who cant participate)
  playersStillInThisRound: Player[]; // everyone who has not folded since the start of the game
  playersLeftToReact: Player[]; // everyone who has not folded and is not all in

  bigBlindPlayer: Player;
  smallBlindPlayer: Player;
  activePlayer: Player;

  passBlinds: () => void;
  passMove: (store: StoreType) => void;
  updatePlayerAbilities: (store: StoreType) => void;
  getNextActivePlayer: () => void;
  getWinners: ({ sumOfBets, store }: GetWinnersArguments) => void;
}


export interface CardConstructorArgs {
  suit: Suit,
  cardName: CardName,
}
export interface CardType {
  suit: Suit,
  suitSymbol: SuitSymbol,
  cardName: CardName,
  cardNameSymbol: CardNameSymbol,
  isHidden: boolean,
  cardCost: CardCost,
  isFaded: boolean;

  fade: () => any,
  unfade: () => any,
}

export interface DeckType {
  cards: Card[],
  pickRandomCard: () => Card;
}

export type PlayersAtCombinations = Partial<Record<COMBINATIONS, Player[]>>;

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
  cardSuit: SuitSymbol,
  isFaded: boolean,
  isHidden: boolean,
}
export interface PlayerCountCircleProps {
  amountOfPlayersToSet: number
};
export interface PlayerInfoProps {
  playerId: 0 | 1 | 2 | 3,
}
export interface SwitchProps {
  active: string,
  children: JSX.Element[],
}