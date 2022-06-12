import { CardType, CardConstructorArgs, CardCost } from "../types";
import { suits, cardNames, suitSymbols, cardNameSymbols, cardCosts } from "../consts";
import { makeAutoObservable } from "mobx";

export class Card implements CardType {
  suit = suits[0];
  suitSymbol = suitSymbols[this.suit];
  cardName = cardNames[0];
  cardNameSymbol = cardNameSymbols[this.cardName];
  isHidden = false;
  cardCost = 0 as CardCost;
  isFaded = false;

  constructor({ suit, cardName }: CardConstructorArgs) {
    this.suit = suit;
    this.suitSymbol = suitSymbols[suit];
    this.cardName = cardName;
    this.cardNameSymbol = cardNameSymbols[cardName];
    this.cardCost = cardCosts[cardName];
    makeAutoObservable(this);
  }
}