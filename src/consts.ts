import { Suit, CardName, SuitSymbol, CardNameSymbol, CardCost } from "./types";


export const suits: Suit[] = ["diamonds", "clubs", "hearts", "spades"];
export const suitSymbols: Partial<Record<Suit, SuitSymbol>> = {
  "diamonds": "♦",
  "clubs": "♣",
  "hearts": "♥",
  "spades": "♠",
};

export const cardNames: CardName[] = ["six", "seven", "eight", "nine", "ten", "jack", "queen", "king", "ace"];
export const cardNameSymbols: Partial<Record<CardName, CardNameSymbol>> = {
  "six": "6",
  "seven": "7",
  "eight": "8",
  "nine": "9",
  "ten": "10",
  "jack": "J",
  "queen": "Q",
  "king": "K",
  "ace": "A",
};
export const cardCosts: Partial<Record<CardName, CardCost>> = {
  "six": 6,
  "seven": 7,
  "eight": 8,
  "nine": 9,
  "ten": 10,
  "jack": 11,
  "queen": 12,
  "king": 13,
  "ace": 14
}
export const humanPlayerNames: string[] = ["player-1", "player-2", "player-3", "player-4"];
export const amountOfCardsInTheDeck = 36;

export enum POKER_ROUNDS {
  BLIND_CALL, // 0 cards on the table
  FLOP, // 3 cards on the table
  TURN, // 4 cards on the table
  RIVER // 5 cards on the table
}

export enum BET_ACTION {
  RAISE,
  SUPPORT,
  ALL_IN,
  BIG_BLIND,
  SMALL_BLIND
}

export enum COMBINATIONS {
  HIGH_CARD = "HIGH_CARD",
  PAIR = "PAIR",
  TWO_PAIRS = "TWO_PAIRS",
  THREE_OF_KIND = "THREE_OF_KIND",
  STRAIGHT = "STRAIGHT",
  FLUSH = "FLUSH",
  FULL_HOUSE = "FULL_HOUSE",
  FOUR_OF_KIND = "FOUR_OF_KIND",
  STRAIGHT_FLUSH = "STRAIGHT_FLUSH",
  ROYAL_FLUSH = "ROYAL_FLUSH"
}

export enum COMBINATION_NAMES_HUMAN {
  HIGH_CARD = "high card",
  PAIR = "pair",
  TWO_PAIRS = "two pairs",
  THREE_OF_KIND = "three of kind",
  STRAIGHT = "straight",
  FLUSH = "flush",
  FULL_HOUSE = "full house",
  FOUR_OF_KIND = "four of kind",
  STRAIGHT_FLUSH = "straight flush",
  ROYAL_FLUSH = "royal flush",
}
