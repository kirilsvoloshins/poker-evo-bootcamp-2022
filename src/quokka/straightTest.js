const getCardsInStraightIfThereIsAny = (rawCardsToCheck) => {
  const cardCostsAlreadyChecked = [], cardsToCheck = [];
  rawCardsToCheck.forEach(card => {
    const { cardCost } = card;
    if (!cardCostsAlreadyChecked.includes(cardCost)) {
      cardCostsAlreadyChecked.push(cardCost);
      cardsToCheck.push(card);
    }
  });
  // const cardsToCheck = [... new Set(rawCardsToCheck.map())];
  let amountOfCardsInPotentialStraight = 0, previousCardCost = 0, cardsInStraight = [];
  const isAceBetweenCards = !!rawCardsToCheck.filter(({ cardCost }) => cardCost === 14).length;
  for (const card of cardsToCheck) {
    const areCardsConsecutive = card.cardCost === previousCardCost - 1;
    if (areCardsConsecutive) {
      amountOfCardsInPotentialStraight++;
      cardsInStraight.push(card);
      const doCardsLookLikeBabyStraight = isAceBetweenCards && cardsInStraight[0].cardCost === 5 && cardsInStraight.length === 4;
      if (doCardsLookLikeBabyStraight) {
        const aceCard = rawCardsToCheck.find(card => card.cardCost === 14);
        return [...cardsInStraight, aceCard];
      }
    } else {
      amountOfCardsInPotentialStraight = 1;
      cardsInStraight = [card];
    }
    previousCardCost = card.cardCost;
    if (cardsInStraight.length === 5) {
      return cardsInStraight;
    }
  }
  if (amountOfCardsInPotentialStraight < 5) {
    return [];
  }
  // cardsInStraight = cardsInStraight.filter((_, i) => i <= 4); // return only 5 cards (starting from the highest so as not to miss flash royale)
  return cardsInStraight;
}
export const getDescSortedArrayofCards = (cardA, cardB) => {
  const { cardCost: cardCost_1 } = cardA;
  const { cardCost: cardCost_2 } = cardB;
  return cardCost_2 - cardCost_1;
}
const cardsToCheckForCombinations = [...[
  { suit: "spades", cardName: "two", cardCost: 2 },
  { suit: "clubs", cardName: "three", cardCost: 3 },
  { suit: "clubs", cardName: "four", cardCost: 4 },
  { suit: "hearts", cardName: "five", cardCost: 5 },
  { suit: "hearts", cardName: "king", cardCost: 13 },
], ...[
  { suit: "hearts", cardName: "ace", cardCost: 14 },
  { suit: "spades", cardName: "queen", cardCost: 12 }
]].sort(getDescSortedArrayofCards);

getCardsInStraightIfThereIsAny(cardsToCheckForCombinations); //?




