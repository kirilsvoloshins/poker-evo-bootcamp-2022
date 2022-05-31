class Deck {
  cards = [] // 54 cards!

  constructor() {
    const cards = [];
    suits.forEach(suit => {
      cardNames.forEach(cardName => {
        const card = new Card({ suit, cardName });
        cards.push(card);
      });
    });
    this.cards = cards;
  }

  shuffle() {
    const cards = [...this.cards];
    const amountOfCardsLeft = cards.length;
    let unshuffledIndexes = Array.from({ length: amountOfCardsLeft }, (_, i) => i);
    const shuffledIndexes = [];
    for (let i = 0; i < amountOfCardsLeft; i++) {
      const randomCardIndex = Math.floor(Math.random() * unshuffledIndexes.length);
      shuffledIndexes.push(randomCardIndex);
      unshuffledIndexes = unshuffledIndexes.filter(id => id !== randomCardIndex);
    }
    const shuffledDeck = shuffledIndexes.map(id => cards[id]);
    console.log({ shuffledDeck });
    this.cards = shuffledDeck;
  }

  pickRandomCard() {
    const amountOfFreeCards = this.cards.length;
    const randomCardIndex = Math.floor(Math.random() * amountOfFreeCards);
    const randomCard = this.cards[randomCardIndex];
    this.cards = this.cards.filter((_, id) => id !== randomCardIndex);
    return randomCard;
  }
}