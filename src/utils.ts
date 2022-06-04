import { Suit, CardName } from "./types";

export const suits: Suit[] = ["diamonds", "clubs", "hearts", "spades"];
export const suitSymbols = {
  "diamonds": "♦",
  "clubs": "♣",
  "hearts": "♥",
  "spades": "♠",
};

export const cardNames: CardName[] = ["six", "seven", "eight", "nine", "ten", "jack", "queen", "king", "ace"];
export const cardNameSymbols = {
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
export const cardCosts = {
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
export const aiPlayerNames: string[] = ["Bot1", "Bot2", "Bot3"];
export const humanPlayerNames: string[] = ["player-1", "player-2", "player-3", "player-4"];
export const amountOfCardsInTheDeck = 36;

// export { suits, suitSymbols, cardNames, cardNameSymbols, playerNames, humanPlayerName, amountOfCardsInTheDeck };

export enum POKER_ROUNDS {
  BLIND_CALL, // 0 cards on the table
  FLOP, // 3 cards on the table
  TURN, // 4 cards on the table
  RIVER // 5 cards on the table
}


export const getDateForGameEvent = (date: Date): string => {
  const twoDigits = (val: number | string): number | string => {
    const sValLength = String(val).length;
    if (sValLength === 1) return `0${val}`;
    return val;
  }
  const HH = twoDigits(date.getHours());
  const MM = twoDigits(date.getMinutes());
  const SS = twoDigits(date.getSeconds());
  return `${HH}:${MM}:${SS}`;
}

export enum BET_ACTION {
  RAISE,
  SUPPORT,
  ALL_IN,
  BIG_BLIND,
  SMALL_BLIND
}

export function getGameEventText({ name, betAmount, betAction }: { name: string, betAmount: number, betAction: BET_ACTION }) {
  // if (isRaiseBet) {
  //   store.logGameEvent();
  // } else if (isSupportBet) {
  //   store.logGameEvent();
  // } else if (isAllIn) {
  //   store.logGameEvent(`${name}: goes all in (+${betAmount})`);
  // } else if (isBigBlind) {
  //   store.logGameEvent(`${name}: big blind (+${betAmount})`);
  // } else if (isSmallBlind) {
  //   store.logGameEvent(`${name}: small blind (+${betAmount})`);
  // } else {
  //   //???  WHEN???
  //   store.logGameEvent(`${name}: places bet (+${betAmount})`);

  switch (betAction) {
    case BET_ACTION.RAISE: {
      return `${name}: raises bet (+${betAmount})`
    }
    case BET_ACTION.SUPPORT: {
      return `${name}: supports bet (+${betAmount})`
    }
    case BET_ACTION.ALL_IN: {
      return `${name}: goes all in (+${betAmount})`
    }
    case BET_ACTION.BIG_BLIND: {
      return `${name}: big blind (+${betAmount})`
    }
    case BET_ACTION.SMALL_BLIND: {
      return `${name}: small blind (+${betAmount})`

    }


    default:
      console.error(`unsupported betAction: "${betAction}"`);
      return `unsupported betAction: "${betAction}"`;
      break;
  }


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
