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
  for (const card of cardsToCheck) {
    const areCardsConsecutive = card.cardCost === previousCardCost - 1;
    if (areCardsConsecutive) {
      amountOfCardsInPotentialStraight++;
      cardsInStraight.push(card);
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
  { suit: "spades", cardName: "nine", cardCost: 9 },
  { suit: "clubs", cardName: "ten", cardCost: 10 },
  { suit: "clubs", cardName: "jack", cardCost: 11 },
  { suit: "hearts", cardName: "queen", cardCost: 12 },
  { suit: "hearts", cardName: "king", cardCost: 13 },
], ...[
  // { suit: "hearts", cardName: "king", cardCost: 13 },
  // { suit: "spades", cardName: "six", cardCost: 6 }
  { suit: "hearts", cardName: "ten", cardCost: 10 },
  { suit: "spades", cardName: "queen", cardCost: 12 }
]].sort(getDescSortedArrayofCards);

getCardsInStraightIfThereIsAny(cardsToCheckForCombinations); //?




