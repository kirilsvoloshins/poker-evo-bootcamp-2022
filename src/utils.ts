import { BET_ACTION } from "./consts";

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