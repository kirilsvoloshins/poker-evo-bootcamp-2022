import { ComponentNames, SuitSymbol, CardNameSymbol, PlayerType, GameState, Suit, CardName } from "../types";
import { suits, cardNames, suitSymbols, cardNameSymbols, aiPlayerNames, humanPlayerNames, amountOfCardsInTheDeck, cardCosts } from "../utils";


interface CardType {
  suit: Suit,
  suitSymbol: SuitSymbol,
  cardName: CardName,
  cardNameSymbol: CardNameSymbol,
  isHidden: boolean,
}

interface CardConstructorArgs {
  suit: Suit,
  cardName: CardName,
}

export class Card implements CardType {
  suit = suits[0];
  suitSymbol = suitSymbols[this.suit] as SuitSymbol;
  cardName = cardNames[0];
  cardNameSymbol = cardNameSymbols[this.cardName] as CardNameSymbol;
  isHidden = false;
  cardCost: number = 0;

  constructor({ suit, cardName }: CardConstructorArgs) {
    this.suit = suit;
    this.suitSymbol = suitSymbols[suit] as SuitSymbol
    this.cardName = cardName;
    this.cardNameSymbol = cardNameSymbols[cardName] as CardNameSymbol;
    this.cardCost = cardCosts[cardName];
  }
}