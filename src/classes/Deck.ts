import { makeAutoObservable } from "mobx";
import { ComponentNames, SuitSymbol, CardNameSymbol, PlayerType, GameState } from "../types";
import { suits, cardNames, suitSymbols, cardNameSymbols, aiPlayerNames, humanPlayerNames, amountOfCardsInTheDeck } from "../utils";
import { Card } from "./Card";

export class Deck {
  cards: Card[] // 54 cards!

  constructor() {
    const cards: Card[] = [];
    suits.forEach(suit => {
      cardNames.forEach(cardName => {
        const card = new Card({ suit, cardName });
        cards.push(card);
      });
    });
    this.cards = cards;

    makeAutoObservable(this);
  }

  pickRandomCard(): Card {
    const allCards = this.cards;
    const amountOfFreeCards = allCards.length;
    const randomCardIndex = Math.floor(Math.random() * (amountOfFreeCards - 1));
    const randomCard = allCards[randomCardIndex];
    const cardsLeft = allCards.filter((_, id) => id !== randomCardIndex);
    this.cards = cardsLeft;
    return randomCard;
  }
}