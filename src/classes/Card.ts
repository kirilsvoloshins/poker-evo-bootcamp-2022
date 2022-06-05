import { CardType, CardConstructorArgs } from "../types";
import { suits, cardNames, suitSymbols, cardNameSymbols, cardCosts } from "../consts";

export class Card implements CardType {
  suit = suits[0];
  suitSymbol = suitSymbols[this.suit];
  cardName = cardNames[0];
  cardNameSymbol = cardNameSymbols[this.cardName];
  isHidden = false;
  cardCost = 0;

  constructor({ suit, cardName }: CardConstructorArgs) {
    this.suit = suit;
    this.suitSymbol = suitSymbols[suit];
    this.cardName = cardName;
    this.cardNameSymbol = cardNameSymbols[cardName];
    this.cardCost = cardCosts[cardName];
  }
}