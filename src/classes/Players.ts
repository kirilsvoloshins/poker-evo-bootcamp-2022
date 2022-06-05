import { suitSymbols, humanPlayerNames, cardCosts, COMBINATIONS } from "../consts";
import { PlayersAtCombinations, PlayersConstructorArgs, StoreType, SuitSymbol, Winner } from "../types";
import { Player } from "./Player";
import { makeAutoObservable } from "mobx";
import { Card } from "./Card";

export class Players {
  /* player could have folded in this level, but will play in the next! */
  playerList: Player[]; // static list of players which entered the game (on game start we delete ones who cant participate)
  playersStillInThisRound: Player[]; // everyone who has not folded since the start of the game
  playersLeftToReact: Player[]; // everyone who has not folded and is not all in

  bigBlindPlayer: Player;
  smallBlindPlayer: Player;
  activePlayer: Player;

  constructor({ amountOfHumanPlayers, initialMoney }: PlayersConstructorArgs) {
    const totalAmountOfPlayers = amountOfHumanPlayers;
    const playerList = Array.from({ length: totalAmountOfPlayers }, (_, i) => {
      const playerName = humanPlayerNames[i];
      return new Player({
        name: playerName,
        id: i,
        moneyLeft: initialMoney,
        cards: [],
      });
    });
    this.playerList = playerList;
    this.playersStillInThisRound = playerList;
    this.playersLeftToReact = playerList;

    this.bigBlindPlayer = playerList[0];
    this.smallBlindPlayer = playerList[1];
    this.activePlayer = this.smallBlindPlayer;

    makeAutoObservable(this);
  }

  //!!! handle having players which can not react to bets
  passBlinds() {
    const { smallBlindPlayer: prevSmallBlindPlayer, playerList } = this;
    this.bigBlindPlayer = prevSmallBlindPlayer;
    const indexOfPrevSmallBlindPlayer = playerList.indexOf(prevSmallBlindPlayer);
    const newSmallBlindPlayerIndex = indexOfPrevSmallBlindPlayer === playerList.length - 1 ? 0 : indexOfPrevSmallBlindPlayer + 1;
    const newSmallBlindPlayer = playerList[newSmallBlindPlayerIndex];
    this.smallBlindPlayer = newSmallBlindPlayer;
  }

  passMove(store: StoreType) {
    this.updatePlayerAbilities(store);

    const areThereAnyPlayersToReact = this.playersLeftToReact.length > 0;
    if (!areThereAnyPlayersToReact) {
      store.startNextRound();
      return;
    }

    this.activePlayer = this.getNextActivePlayer();
    /* if there is only one player left (everyone else can not continue), he wins! */
    // if (this.playerList.length === 1) {

    // }
  }

  updatePlayerAbilities(store: StoreType) {
    // player can't continue playing in this round if: hasFolded
    this.playersStillInThisRound = this.playerList.filter(player => !player.hasFolded);
    // player can react to the bet if: !isAllIn && !hasFolded
    this.playersLeftToReact = this.playersStillInThisRound.filter(player => !player.isAllIn && !player.hasReacted);
    this.playersLeftToReact.forEach(player => {
      player.canCheck = player.sumOfPersonalBetsInThisRound === store.maxSumOfIndividualBets;
      player.canSupportBet = (player.sumOfPersonalBetsInThisRound + player.moneyLeft) >= store.maxSumOfIndividualBets
      player.canRaise = (player.sumOfPersonalBetsInThisRound + player.moneyLeft) > store.maxSumOfIndividualBets
      player.betToPayToContinue = store.maxSumOfIndividualBets - player.sumOfPersonalBetsInThisRound;
    });
  }

  getNextActivePlayer() {
    const { activePlayer, playersLeftToReact } = this;
    const consecutivePlayer = playersLeftToReact.find(({ id }) => id > activePlayer.id);
    const nextPlayer = consecutivePlayer ? consecutivePlayer : playersLeftToReact[0];
    return nextPlayer;
  }

  getWinners({ sumOfBets, store }: { sumOfBets: number, store: StoreType }) {
    //todo: handle a lot of things...
    const { playersStillInThisRound } = this;

    // HIGH_CARD
    const highestCardCostAmongstAllPlayers = Math.max(...playersStillInThisRound.map(({ cards }) => cards.map(({ cardCost }) => cardCost)).flat());
    const playersWithHighestCards = playersStillInThisRound.filter(player => player.cards.map(({ cardCost }) => cardCost).includes(highestCardCostAmongstAllPlayers));

    const uniqueSuitSymbols = Object.keys(suitSymbols) as SuitSymbol[];
    const playersWithOnePair: Player[] = [], playersWithTwoPairs: Player[] = [], playersWithThreeOfKind: Player[] = [], playersWithFourOfKind: Player[] = [], playersWithFlush: Player[] = [], playersWithStraight: Player[] = [], playersWithRoyalFlush: Player[] = [], playersWithFullHouse: Player[] = [], playersWithStraightFlush: Player[] = [];
    playersStillInThisRound.forEach(player => {
      player.bestCombinationName = COMBINATIONS.HIGH_CARD;
      player.bestCombinationCards = player.cards;

      const cardsToCheckForCombinations = [...store.cardsOnTheDesk, ...player.cards].sort(getDescSortedArrayofCards);
      const cardCostsToCheckForCombinations = cardsToCheckForCombinations.map(({ cardCost }) => cardCost);
      const uniqueCardCosts = [...new Set(cardCostsToCheckForCombinations)];
      // const costsOfUniqueCardCosts = uniqueCardCosts.map(uniqueCardCost => cardCostsToCheckForCombinations.filter(cardCost => cardCost === uniqueCardCost));
      const cardsOfUniqueCardCosts = uniqueCardCosts.map(uniqueCardCost => cardsToCheckForCombinations.filter(({ cardCost }) => cardCost === uniqueCardCost));
      // const cardsWithPairs = costsOfUniqueCardCosts.filter(cardsWithMatchingCosts => cardsWithMatchingCosts.length === 2);
      const cardsWithPairs = cardsOfUniqueCardCosts.filter(cardsWithMatchingCosts => cardsWithMatchingCosts.length === 2);
      if (cardsWithPairs.length === 1) {
        // PAIR
        playersWithOnePair.push(player);
        const combinationCards = cardsWithPairs[0];
        const cardsOutsideCombination = player.cards.filter(card => !combinationCards.includes(card));
        player.cardsAtCombination[COMBINATIONS.PAIR] = {
          combinationCards,
          highestCardInCombination: getHighestCardOfCards(combinationCards),
          highestCardOutsideCombination: getHighestCardOfCards(cardsOutsideCombination),
        }
        player.bestCombinationName = COMBINATIONS.PAIR;
        player.bestCombinationCards = combinationCards;
      } else if (cardsWithPairs.length >= 2) {
        // TWO PAIRS
        playersWithTwoPairs.push(player);
        const combinationCards = [...cardsWithPairs[0], ...cardsWithPairs[1]];
        const cardsOutsideCombination = player.cards.filter(card => !combinationCards.includes(card));
        player.cardsAtCombination[COMBINATIONS.TWO_PAIRS] = {
          combinationCards,
          highestCardInCombination: getHighestCardOfCards(combinationCards),
          highestCardOutsideCombination: getHighestCardOfCards(cardsOutsideCombination),
        };
        player.bestCombinationName = COMBINATIONS.TWO_PAIRS;
        player.bestCombinationCards = combinationCards;
      }
      // THREE_OF_KIND
      const cardsWithThreeOfKinds = cardsOfUniqueCardCosts.filter(cardsWithMatchingCosts => cardsWithMatchingCosts.length === 3);

      if (cardsWithThreeOfKinds.length) {
        playersWithThreeOfKind.push(player);
        const combinationCards = cardsWithThreeOfKinds[0];
        const cardsOutsideCombination = player.cards.filter(card => !combinationCards.includes(card));
        player.cardsAtCombination[COMBINATIONS.THREE_OF_KIND] = {
          combinationCards,
          highestCardInCombination: getHighestCardOfCards(combinationCards),
          highestCardOutsideCombination: getHighestCardOfCards(cardsOutsideCombination),
        }
        player.bestCombinationName = COMBINATIONS.THREE_OF_KIND;
        player.bestCombinationCards = combinationCards;
      }
      // FOUR_OF_KIND
      const cardsWithFourOfKinds = cardsOfUniqueCardCosts.filter(cardsWithMatchingCosts => cardsWithMatchingCosts.length === 4);
      if (cardsWithFourOfKinds.length) {
        playersWithFourOfKind.push(player);
        const combinationCards = cardsWithFourOfKinds[0];
        const cardsOutsideCombination = player.cards.filter(card => !combinationCards.includes(card));
        player.cardsAtCombination[COMBINATIONS.FOUR_OF_KIND] = {
          combinationCards,
          highestCardInCombination: getHighestCardOfCards(combinationCards),
          highestCardOutsideCombination: getHighestCardOfCards(cardsOutsideCombination),
        };
        player.bestCombinationName = COMBINATIONS.FOUR_OF_KIND;
        player.bestCombinationCards = combinationCards;
      }
      // FLUSH
      const cardsWithFlush = getCardsInFlushIfThereIsAny({ cardsToCheck: cardsToCheckForCombinations, uniqueSuitSymbols });
      if (cardsWithFlush.length) {
        playersWithFlush.push(player);
        const combinationCards = cardsWithFlush;
        const cardsOutsideCombination = player.cards.filter(card => !combinationCards.includes(card));
        player.cardsAtCombination[COMBINATIONS.FLUSH] = {
          combinationCards,
          highestCardInCombination: getHighestCardOfCards(combinationCards),
          highestCardOutsideCombination: getHighestCardOfCards(cardsOutsideCombination),
        };
        player.bestCombinationName = COMBINATIONS.FLUSH;
        player.bestCombinationCards = combinationCards;
      }
      // STRAIGHT
      const cardsInStraight = getCardsInStraightIfThereIsAny(cardsToCheckForCombinations);
      if (cardsInStraight.length) {
        playersWithStraight.push(player);
        const combinationCards = cardsInStraight;
        const cardsOutsideCombination = player.cards.filter(card => !combinationCards.includes(card));
        player.cardsAtCombination[COMBINATIONS.STRAIGHT] = {
          combinationCards,
          highestCardInCombination: getHighestCardOfCards(combinationCards),
          highestCardOutsideCombination: getHighestCardOfCards(cardsOutsideCombination),
        };
        player.bestCombinationName = COMBINATIONS.STRAIGHT;
        player.bestCombinationCards = combinationCards;
      }
      // STRAIGHT_FLUSH
      const cardsInStraightFlush = getCardsInFlushIfThereIsAny({ cardsToCheck: cardsInStraight, uniqueSuitSymbols });
      if (cardsInStraightFlush.length) {
        playersWithStraightFlush.push(player);
        const combinationCards = cardsInStraight;
        const cardsOutsideCombination = player.cards.filter(card => !combinationCards.includes(card));
        player.cardsAtCombination[COMBINATIONS.STRAIGHT_FLUSH] = {
          combinationCards,
          highestCardInCombination: getHighestCardOfCards(combinationCards),
          highestCardOutsideCombination: getHighestCardOfCards(cardsOutsideCombination),
        };
        player.bestCombinationName = COMBINATIONS.STRAIGHT_FLUSH;
        player.bestCombinationCards = combinationCards;
      }

      //!!! handle ignoring a pair if there is full house
      // FULL_HOUSE
      if (cardsWithPairs.length && cardsWithThreeOfKinds.length) {
        playersWithFullHouse.push(player);
        const combinationCards = [...cardsWithPairs[0], ...cardsWithThreeOfKinds[0]];
        const cardsOutsideCombination = player.cards.filter(card => !combinationCards.includes(card));
        player.cardsAtCombination[COMBINATIONS.FULL_HOUSE] = {
          combinationCards,
          highestCardInCombination: getHighestCardOfCards(combinationCards),
          highestCardOutsideCombination: getHighestCardOfCards(cardsOutsideCombination),
        };
        player.bestCombinationName = COMBINATIONS.FULL_HOUSE;
        player.bestCombinationCards = combinationCards;
      }
      // ROYAL FLUSH
      if (cardsInStraightFlush.length) {
        if (cardsInStraightFlush[0].cardCost === cardCosts["ace"]) {
          //!!! there can only be one player with royal flash
          playersWithRoyalFlush.push(player);
          const combinationCards = cardsInStraightFlush;
          const cardsOutsideCombination = player.cards.filter(card => !combinationCards.includes(card));
          player.cardsAtCombination[COMBINATIONS.ROYAL_FLUSH] = {
            combinationCards,
            highestCardInCombination: getHighestCardOfCards(combinationCards),
            highestCardOutsideCombination: getHighestCardOfCards(cardsOutsideCombination),
          };
          player.bestCombinationName = COMBINATIONS.ROYAL_FLUSH;
          player.bestCombinationCards = combinationCards;
        }
      }
    });

    const playersAtCombination: PlayersAtCombinations = {
      [COMBINATIONS.ROYAL_FLUSH]: playersWithRoyalFlush,
      [COMBINATIONS.STRAIGHT_FLUSH]: playersWithStraightFlush,
      [COMBINATIONS.FOUR_OF_KIND]: playersWithFourOfKind,
      [COMBINATIONS.FULL_HOUSE]: playersWithFullHouse,
      [COMBINATIONS.FLUSH]: playersWithFlush,
      [COMBINATIONS.STRAIGHT]: playersWithStraight,
      [COMBINATIONS.THREE_OF_KIND]: playersWithThreeOfKind,
      [COMBINATIONS.TWO_PAIRS]: playersWithTwoPairs,
      [COMBINATIONS.PAIR]: playersWithOnePair,
      [COMBINATIONS.HIGH_CARD]: playersWithHighestCards,
    };
    console.warn(playersAtCombination);

    let winMoneyLeft = sumOfBets;
    // if there is only one player left, he is the winner
    if (playersStillInThisRound.length === 1) {
      const player = playersStillInThisRound[0];
      const winnerObject: Winner = {
        id: player.id,
        cards: player.cards,
        combinationName: player.bestCombinationName,
        bestCombinationCards: player.bestCombinationCards,
        winAmount: winMoneyLeft,
        playerName: player.name,
      };
      store.winners = [winnerObject];
      return;
    }

    // getting the winner 
    // todo: handle splitting the win if the first winner went did not bet enough to take everything
    const combinations = [COMBINATIONS.ROYAL_FLUSH, COMBINATIONS.STRAIGHT_FLUSH, COMBINATIONS.FOUR_OF_KIND, COMBINATIONS.FULL_HOUSE, COMBINATIONS.FLUSH, COMBINATIONS.STRAIGHT, COMBINATIONS.THREE_OF_KIND, COMBINATIONS.TWO_PAIRS, COMBINATIONS.PAIR, COMBINATIONS.HIGH_CARD];
    // let isThereAnyWinMoneyLeft = true;
    for (const combinationName of combinations) {
      if (!winMoneyLeft) {
        return;
      }

      const playersWithThisCombination = playersAtCombination[combinationName];
      const amountOfPlayersWithThisCombination = playersWithThisCombination.length;
      if (!amountOfPlayersWithThisCombination) {
        continue;
      }

      if (amountOfPlayersWithThisCombination === 1) {
        const player = playersWithThisCombination[0];
        const { isAllIn, sumToWinIfPlayerGoesAllIn } = player;
        if (isAllIn) {
          const moneyThePlayerWins = winMoneyLeft > sumToWinIfPlayerGoesAllIn ? sumToWinIfPlayerGoesAllIn : winMoneyLeft;
          player.moneyLeft += moneyThePlayerWins;
          winMoneyLeft -= moneyThePlayerWins;
          const winnerObject: Winner = {
            id: player.id,
            cards: player.cards,
            combinationName: player.bestCombinationName,
            bestCombinationCards: player.bestCombinationCards,
            winAmount: moneyThePlayerWins,
            playerName: player.name,
          };
          store.winners.push(winnerObject);
          continue;
        }

        //=> player is not all in => he takes it all
        player.moneyLeft += winMoneyLeft;
        const winnerObject: Winner = {
          id: player.id,
          cards: player.cards,
          combinationName: player.bestCombinationName,
          bestCombinationCards: player.bestCombinationCards,
          winAmount: winMoneyLeft,
          playerName: player.name,
        };
        store.winners = [winnerObject];
        return;
      }

      //=> there are multiple people with the same combination
      const sortedPlayersWithThisCombination = getPlayersDescSortedByHighestCards({ playersWithThisCombination, combinationName });
      const uniqueHighCardCombinations = [... new Map(sortedPlayersWithThisCombination.map(player => {
        if (typeof player.cardsAtCombination[combinationName].highestCardOutsideCombination === "undefined") {
          console.log(player.cardsAtCombination, combinationName);
        }

        return [
          player.cardsAtCombination[combinationName].highestCardInCombination.cardCost,
          player.cardsAtCombination[combinationName].highestCardOutsideCombination.cardCost
        ]
      }))];

      for (const [uniqueHighCombinationCardCost, uniqueHighOutsideCombinationCardCost] of uniqueHighCardCombinations) {
        const playersWithTheseHighCards = sortedPlayersWithThisCombination.filter(player => {
          const highCombinationCardCost = player.cardsAtCombination[combinationName].highestCardInCombination.cardCost;
          const highOutsideCombinationCardCost = player.cardsAtCombination[combinationName].highestCardOutsideCombination.cardCost;
          return highCombinationCardCost === uniqueHighCombinationCardCost && highOutsideCombinationCardCost === uniqueHighOutsideCombinationCardCost;
        });
        let amountOfPlayersLeftWithThisCombination = playersWithTheseHighCards.length;
        for (const player of playersWithTheseHighCards) {
          const approxSumToWin = Math.floor(winMoneyLeft / amountOfPlayersLeftWithThisCombination);
          const { isAllIn, sumToWinIfPlayerGoesAllIn } = player;
          if (isAllIn) {
            const moneyThePlayerWins = approxSumToWin > sumToWinIfPlayerGoesAllIn ? sumToWinIfPlayerGoesAllIn : winMoneyLeft;
            player.moneyLeft += moneyThePlayerWins;
            winMoneyLeft -= moneyThePlayerWins;
            const winnerObject: Winner = {
              id: player.id,
              cards: player.cards,
              combinationName: player.bestCombinationName,
              bestCombinationCards: player.bestCombinationCards,
              winAmount: moneyThePlayerWins,
              playerName: player.name,
            };
            store.winners.push(winnerObject);
            amountOfPlayersLeftWithThisCombination--;
            continue;
          }

          //=> player is not all in => he takes it all
          player.moneyLeft += approxSumToWin;
          const winnerObject: Winner = {
            id: player.id,
            cards: player.cards,
            combinationName: player.bestCombinationName,
            bestCombinationCards: player.bestCombinationCards,
            winAmount: approxSumToWin,
            playerName: player.name,
          };
          store.winners.push(winnerObject);
        }
      }
    }
  }
}

const getPlayersDescSortedByHighestCards = ({ playersWithThisCombination, combinationName }: { playersWithThisCombination: Player[], combinationName: COMBINATIONS }): Player[] => {
  const sortedPlayersWithThisCombination = playersWithThisCombination.sort((player1, player2) => {
    const costOfHighestCardInCombination_1 = player1.cardsAtCombination[combinationName].highestCardInCombination.cardCost;
    const costOfHighestCardInCombination_2 = player2.cardsAtCombination[combinationName].highestCardInCombination.cardCost;
    const costOfHighestCardOutsideCombination_1 = player1.cardsAtCombination[combinationName].highestCardOutsideCombination.cardCost;
    const costOfHighestCardOutsideCombination_2 = player2.cardsAtCombination[combinationName].highestCardOutsideCombination.cardCost;
    const totalHighCardCost_1 = costOfHighestCardInCombination_1 * 100 + costOfHighestCardOutsideCombination_1;
    const totalHighCardCost_2 = costOfHighestCardInCombination_2 * 100 + costOfHighestCardOutsideCombination_2;
    return totalHighCardCost_2 - totalHighCardCost_1;
  });
  return sortedPlayersWithThisCombination;
}


const getDescSortedArrayofCards = (cardA: Card, cardB: Card): any => {
  const { cardCost: cardCost_1 } = cardA;
  const { cardCost: cardCost_2 } = cardB;
  return cardCost_2 - cardCost_1;
}

const getHighestCardOfCards = (cards: Card[]): Card => {
  const descSortedArrayOfCards = cards.sort(getDescSortedArrayofCards);
  return descSortedArrayOfCards[0];
}

const getCardsInFlushIfThereIsAny = ({ cardsToCheck, uniqueSuitSymbols }: { cardsToCheck: Card[], uniqueSuitSymbols: SuitSymbol[] }): Card[] => {
  const cardsWithFlush = uniqueSuitSymbols.map(uniqueSuitSymbol => {
    return cardsToCheck.filter(({ suitSymbol }) => suitSymbol === uniqueSuitSymbol);
  }).filter(cardsOfSameSuit => cardsOfSameSuit.length >= 5);
  if (cardsWithFlush.length) {
    return cardsWithFlush[0];
  }
  return [];
}

const getCardsInStraightIfThereIsAny = (cardsToCheck: Card[]): Card[] => {
  let amountOfCardsInPotentialStraight = 0, previousCardCost = 0, cardsInStraight: Card[] = [];
  for (const card of cardsToCheck) {
    const areCardsConsecutive = card.cardCost === previousCardCost - 1;
    if (areCardsConsecutive) {
      amountOfCardsInPotentialStraight++;
      cardsInStraight.push(card);
    } else {
      amountOfCardsInPotentialStraight = 1;
      cardsInStraight = [card];
      // no way there is a street from 4 cards
      if (cardsToCheck.indexOf(card) >= 3) {
        break;
      }
    }
    previousCardCost = card.cardCost;
  }
  if (amountOfCardsInPotentialStraight < 5) {
    return [];
  }
  cardsInStraight = cardsInStraight.filter((_, i) => i <= 4); // return only 5 cards (starting from the highest so as not to miss flash royale)
  return cardsInStraight;
}



