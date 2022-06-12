import { makeAutoObservable } from "mobx";
import { suits, cardNames } from "../consts";
import { DeckType } from "../types";
import { Card } from "./Card";

export class Deck implements DeckType {
  cards = [] as Card[];

  constructor() {
    const cards = suits.map(suit => {
      return cardNames.map(cardName => {
        return new Card({ suit, cardName });
      });
    }).flat();
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
    // randomCard.isHidden = true;
    return randomCard;
  }
}