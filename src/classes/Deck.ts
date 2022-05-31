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
  }

  shuffle() {
    const { cards } = this;
    const amountOfCardsLeft = cards.length;
    let unshuffledIndexes = Array.from({ length: amountOfCardsLeft }, (_, i) => i);
    const shuffledIndexes = [];
    for (let i = 0; i < amountOfCardsLeft; i++) {
      const randomCardIndex = Math.floor(Math.random() * unshuffledIndexes.length);
      shuffledIndexes.push(randomCardIndex);
      unshuffledIndexes = unshuffledIndexes.filter(id => id !== randomCardIndex);
    }
    const shuffledDeck = shuffledIndexes.map(id => cards[id]);
    // console.log({ shuffledDeck });
    this.cards = shuffledDeck;
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