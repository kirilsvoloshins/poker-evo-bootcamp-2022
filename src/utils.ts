import { BET_ACTION, COMBINATIONS } from "./consts";
import { SuitSymbol } from "./types";
import { Player } from "./classes/Player";
import { Card } from "./classes/Card";

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



export function getGameEventText({ name, betAmount, betAction }: { name: string, betAmount: number, betAction: BET_ACTION }) {
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
  }
}

// export const
// STRAIGHT = "STRAIGHT",
// FLUSH = "FLUSH",
// FULL_HOUSE = "FULL_HOUSE",
// FOUR_OF_KIND = "FOUR_OF_KIND",
// STRAIGHT_FLUSH = "STRAIGHT_FLUSH",
// ROYAL_FLUSH = "ROYAL_FLUSH"

export const getPlayersDescSortedByHighestCards = ({ playersWithThisCombination, combinationName }: { playersWithThisCombination: Player[], combinationName: COMBINATIONS }): Player[] => {
  const sortedPlayersWithThisCombination = playersWithThisCombination.sort((player1, player2) => {
    const costOfHighestCardInCombination_1 = player1.cardsAtCombination[combinationName].highestCardInCombination.cardCost;
    const costOfHighestCardInCombination_2 = player2.cardsAtCombination[combinationName].highestCardInCombination.cardCost;
    const costOfHighestCardOutsideCombination_1 = player1.cardsAtCombination[combinationName].highestCardOutsideCombination.cardCost;
    const costOfHighestCardOutsideCombination_2 = player2.cardsAtCombination[combinationName].highestCardOutsideCombination.cardCost;
    const totalHighCardCost_1 = costOfHighestCardInCombination_1 * 100 + costOfHighestCardOutsideCombination_1;
    const totalHighCardCost_2 = costOfHighestCardInCombination_2 * 100 + costOfHighestCardOutsideCombination_2;
    return totalHighCardCost_2 - totalHighCardCost_1;
  });
  return sortedPlayersWithThisCombination;
}


export const getDescSortedArrayofCards = (cardA: Card, cardB: Card): any => {
  const { cardCost: cardCost_1 } = cardA;
  const { cardCost: cardCost_2 } = cardB;
  return cardCost_2 - cardCost_1;
}

export const getHighestCardOfCards = (cards: Card[]): Card => {
  if (!cards.length) {
    return { cardCost: 0 } as Card;
  }

  const descSortedArrayOfCards = cards.sort(getDescSortedArrayofCards);
  return descSortedArrayOfCards[0];
}

export const getCardsInFlushIfThereIsAny = ({ cardsToCheck, uniqueSuitSymbols }: { cardsToCheck: Card[], uniqueSuitSymbols: SuitSymbol[] }): Card[] => {
  const cardsWithFlush = uniqueSuitSymbols.map(uniqueSuitSymbol => {
    return cardsToCheck.filter(({ suitSymbol }) => suitSymbol === uniqueSuitSymbol);
  }).filter(cardsOfSameSuit => cardsOfSameSuit.length >= 5);
  if (cardsWithFlush.length) {
    return cardsWithFlush[0];
  }
  return [];
}

export const getCardsInStraightIfThereIsAny = (cardsToCheck: Card[]): Card[] => {
  let amountOfCardsInPotentialStraight = 0, previousCardCost = 0, cardsInStraight: Card[] = [];
  for (const card of cardsToCheck) {
    const areCardsConsecutive = card.cardCost === previousCardCost - 1;
    if (areCardsConsecutive) {
      amountOfCardsInPotentialStraight++;
      cardsInStraight.push(card);
    } else {
      amountOfCardsInPotentialStraight = 1;
      cardsInStraight = [card];
      // no way there is a straight from 4 cards
      if (cardsToCheck.indexOf(card) >= 3) {
        break;
      }
    }
    previousCardCost = card.cardCost;
  }
  if (amountOfCardsInPotentialStraight < 5) {
    return [];
  }
  cardsInStraight = cardsInStraight.filter((_, i) => i <= 4); // return only 5 cards (starting from the highest so as not to miss flash royale)
  return cardsInStraight;
}



