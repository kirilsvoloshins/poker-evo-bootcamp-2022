import { suitSymbols, humanPlayerNames, cardCosts, COMBINATIONS, suits } from "../consts";
import { CardCost, PlayersAtCombinations, PlayersConstructorArgs, StoreType, SuitSymbol, Winner } from "../types";
import { Player } from "./Player";
import { makeAutoObservable } from "mobx";
import { getCardsInFlushIfThereIsAny, getCardsInStraightIfThereIsAny, getDescSortedArrayofCards, getHighestCardOfCards, getPlayersDescSortedByHighestCards } from "../utils";
import { Card } from "./Card";

export class Players {
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
        moneyLeft: initialMoney * (i + 1),
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

  passBlinds() {
    const { smallBlindPlayer: prevSmallBlindPlayer, playerList } = this;
    this.bigBlindPlayer = prevSmallBlindPlayer;
    const consecutivePlayer = playerList.find(({ id }) => id > prevSmallBlindPlayer.id);
    const newSmallBlindPlayer = consecutivePlayer ? consecutivePlayer : playerList[0];
    this.smallBlindPlayer = newSmallBlindPlayer;
  }

  passMove(store: StoreType) {
    const isEveryoneAllIn = this.playerList.every(player => player.isAllIn);
    store.isEveryoneAllIn = isEveryoneAllIn;
    if (isEveryoneAllIn) {
      return store.startNextRound();
    }

    this.updatePlayerAbilities(store);

    const areThereAnyPlayersToReact = this.playersLeftToReact.length > 0;
    if (!areThereAnyPlayersToReact) {
      store.startNextRound();
      return;
    }

    this.activePlayer = this.getNextActivePlayer();
  }

  updatePlayerAbilities(store: StoreType) {
    // player can't continue playing in this round if: hasFolded
    this.playersStillInThisRound = this.playerList.filter(player => !player.hasFolded);
    // if everyone else folds, the last player wins
    if (this.playersStillInThisRound.length === 1) {
      return store.endGame();
    }

    // player can react to the bet if: !isAllIn && !hasFolded
    this.playersLeftToReact = this.playersStillInThisRound.filter(player => !player.isAllIn && !player.hasReacted);
    this.playersLeftToReact.forEach(player => {
      player.canCheck = player.sumOfPersonalBetsInThisRound === store.maxSumOfIndividualBets;
      player.canSupportBet = (player.sumOfPersonalBetsInThisRound + player.moneyLeft) >= store.maxSumOfIndividualBets;
      const otherPlayersLeftInThisRound = this.playersLeftToReact.filter(otherPlayer => otherPlayer !== player);
      // const canPlayerRaise = (player.sumOfPersonalBetsInThisRound + player.moneyLeft) > store.maxSumOfIndividualBets && !otherPlayersLeftInThisRound.every(otherPlayer => otherPlayer.moneyLeft === 0);
      const canPlayerRaise = (player.sumOfPersonalBetsInThisRound + player.moneyLeft) > store.maxSumOfIndividualBets;

      player.canRaise = canPlayerRaise;
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
    const { playersStillInThisRound } = this;

    // HIGH_CARD
    const highestCardCostAmongstAllPlayers = Math.max(...playersStillInThisRound.map(({ cards }) => cards.map(({ cardCost }) => cardCost)).flat()) as CardCost;
    const playersWithHighestCards = playersStillInThisRound.filter(player => player.cards.map(({ cardCost }) => cardCost).includes(highestCardCostAmongstAllPlayers));

    const uniqueSuitSymbols = suits.map(suit => suitSymbols[suit]);
    const playersWithOnePair: Player[] = [], playersWithTwoPairs: Player[] = [], playersWithThreeOfKind: Player[] = [], playersWithFourOfKind: Player[] = [], playersWithFlush: Player[] = [], playersWithStraight: Player[] = [], playersWithRoyalFlush: Player[] = [], playersWithFullHouse: Player[] = [];
    let playersWithStraightFlush: Player[] = [];
    playersStillInThisRound.forEach(player => {
      player.bestCombinationName = COMBINATIONS.HIGH_CARD;
      player.bestCombinationCards = player.cards;

      const cardsToCheckForCombinations = [...store.cardsOnTheDesk, ...player.cards].sort(getDescSortedArrayofCards);
      const cardCostsToCheckForCombinations = cardsToCheckForCombinations.map(({ cardCost }) => cardCost);

      const uniqueCardCosts = [...new Set(cardCostsToCheckForCombinations)];
      const cardsOfUniqueCardCosts = uniqueCardCosts.map(uniqueCardCost => cardsToCheckForCombinations.filter(({ cardCost }) => cardCost === uniqueCardCost));
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
      // console.log({ cardsWithFlush });
      if (cardsWithFlush.length) {
        playersWithFlush.push(player);
        const combinationCards = cardsWithFlush;
        const highestCombinationCardInHand = combinationCards.filter(combinationCard => player.cards.includes(combinationCard)).sort(getDescSortedArrayofCards)[0];
        const cardsOutsideCombination = player.cards.filter(card => combinationCards.includes(card));
        player.cardsAtCombination[COMBINATIONS.FLUSH] = {
          combinationCards,
          // highestCardInCombination: highestCombinationCardInHand,
          highestCardInCombination: getHighestCardOfCards(combinationCards),
          // highestCardInCombination: highestCombinationCardInHand,
          // highestCardOutsideCombination: getHighestCardOfCards(cardsOutsideCombination),
          highestCardOutsideCombination: { cardCost: 0 } as Card
        };
        player.bestCombinationName = COMBINATIONS.FLUSH;
        player.bestCombinationCards = combinationCards;
      }
      // STRAIGHT
      // console.log(cardsToCheckForCombinations.map(({ cardName }) => cardName));
      const cardsInStraight = getCardsInStraightIfThereIsAny(cardsToCheckForCombinations);
      // if (cardsInStraight.length) {
      //   console.warn(cardsInStraight);
      // }
      if (cardsInStraight.length) {
        playersWithStraight.push(player);
        const combinationCards = cardsInStraight;
        const cardsOutsideCombination = player.cards.filter(card => !combinationCards.includes(card));
        player.cardsAtCombination[COMBINATIONS.STRAIGHT] = {
          combinationCards,
          highestCardInCombination: getHighestCardOfCards(combinationCards),
          // highestCardOutsideCombination: getHighestCardOfCards(cardsOutsideCombination),
          highestCardOutsideCombination: { cardCost: 0 } as Card,
        };
        player.bestCombinationName = COMBINATIONS.STRAIGHT;
        player.bestCombinationCards = combinationCards;
      }
      // STRAIGHT_FLUSH
      // console.warn(cardsInStraight);
      const cardsInStraightFlush = getCardsInStraightIfThereIsAny(cardsWithFlush);
      // console.warn(cardsInStraightFlush);
      if (cardsInStraightFlush.length) {
        // ROYAL FLUSH
        if (cardsInStraightFlush[0].cardCost === cardCosts["ace"]) {
          //!!! there can only be one player with royal flash
          playersWithRoyalFlush.push(player);
          // playersWithStraightFlush = playersWithStraightFlush.filter(existingPlayer => existingPlayer !== player);
          console.log(playersWithStraightFlush);
          const combinationCards = cardsInStraightFlush;
          const cardsOutsideCombination = player.cards.filter(card => !combinationCards.includes(card));
          player.cardsAtCombination[COMBINATIONS.ROYAL_FLUSH] = {
            combinationCards,
            highestCardInCombination: getHighestCardOfCards(combinationCards),
            // highestCardOutsideCombination: getHighestCardOfCards(cardsOutsideCombination),
            highestCardOutsideCombination: { cardCost: 0 } as Card
          };
          player.bestCombinationName = COMBINATIONS.ROYAL_FLUSH;
          player.bestCombinationCards = combinationCards;
        } else {
          // console.log({ cardsInStraightFlush });
          playersWithStraightFlush.push(player);
          const combinationCards = cardsInStraight;
          const cardsOutsideCombination = player.cards.filter(card => !combinationCards.includes(card));
          player.cardsAtCombination[COMBINATIONS.STRAIGHT_FLUSH] = {
            combinationCards,
            highestCardInCombination: getHighestCardOfCards(combinationCards),
            // highestCardOutsideCombination: getHighestCardOfCards(cardsOutsideCombination),
            highestCardOutsideCombination: { cardCost: 0 } as Card
          };
          player.bestCombinationName = COMBINATIONS.STRAIGHT_FLUSH;
          player.bestCombinationCards = combinationCards;
        }



      }

      //!!! handle ignoring a pair if there is full house
      // FULL_HOUSE
      if (cardsWithPairs.length && cardsWithThreeOfKinds.length) {
        playersWithFullHouse.push(player);
        const combinationCards = [...cardsWithPairs[0], ...cardsWithThreeOfKinds[0]];
        const cardsOutsideCombination = player.cards.filter(card => !combinationCards.includes(card));
        player.cardsAtCombination[COMBINATIONS.FULL_HOUSE] = {
          combinationCards,
          highestCardInCombination: getHighestCardOfCards(cardsWithThreeOfKinds[0]),
          // highestCardOutsideCombination: getHighestCardOfCards(cardsOutsideCombination),
          highestCardOutsideCombination: { cardCost: 0 } as Card
        };
        player.bestCombinationName = COMBINATIONS.FULL_HOUSE;
        player.bestCombinationCards = combinationCards;
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
    console.warn(playersWithRoyalFlush.map(p => p.name));
    // console.warn(playersAtCombination[COMBINATIONS.STRAIGHT].map(({ name }) => name));

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
    // console.warn(playersAtCombination[COMBINATIONS.FLUSH].map(player => player.name));
    for (const combinationName of combinations) {
      if (winMoneyLeft < store.minimumBet) {
        return;
      }

      const playersWithThisCombination = playersAtCombination[combinationName];
      console.warn(combinationName, playersWithThisCombination.map(o => o.name));
      // if (combinationName === COMBINATIONS.STRAIGHT_FLUSH) {
      //   console.warn(playersWithThisCombination.map(player => player.cards));
      // }
      const amountOfPlayersWithThisCombination = playersWithThisCombination.length;
      // if (combinationName === COMBINATIONS.STRAIGHT_FLUSH) {
      //   console.warn({ amountOfPlayersWithThisCombination });
      // }
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
        store.winners.push(winnerObject);
        return;
      }

      //=> there are multiple people with the same combination
      const isFiveCardCombination = [COMBINATIONS.STRAIGHT, COMBINATIONS.FLUSH, COMBINATIONS.FULL_HOUSE, COMBINATIONS.STRAIGHT_FLUSH, COMBINATIONS.ROYAL_FLUSH].includes(combinationName);
      if (isFiveCardCombination) {
        playersWithThisCombination.forEach(player => {
          // if (combinationName === COMBINATIONS.FULL_HOUSE) {
          //   player.cardsAtCombination[combinationName].highestCardInCombination = player.cardsAtCombination[COMBINATIONS.THREE_OF_KIND].highestCardInCombination;
          // }
          // player.cardsAtCombination[combinationName].highestCardOutsideCombination.cardCost = 0;
          player.cardsAtCombination[combinationName].highestCardOutsideCombination = { ...player.cardsAtCombination[combinationName].highestCardOutsideCombination, cardCost: 0 };
        });
      }
      const sortedPlayersWithThisCombination = getPlayersDescSortedByHighestCards({ playersWithThisCombination, combinationName });
      // if (combinationName === COMBINATIONS.STRAIGHT_FLUSH) {
      //   console.warn(sortedPlayersWithThisCombination.map(player => player.name));
      // }
      // if (combinationName === COMBINATIONS.FULL_HOUSE) {
      //   // console.warn(sortedPlayersWithThisCombination.map(player => player.cardsAtCombination[COMBINATIONS.FULL_HOUSE].combinationCards));
      //   // console.warn(sortedPlayersWithThisCombination.map(player => player.cardsAtCombination[COMBINATIONS.FULL_HOUSE].highestCardInCombination));
      //   console.warn(sortedPlayersWithThisCombination.map(player => player.name));
      // }
      const uniqueHighCardCombinations: number[][] = [];
      sortedPlayersWithThisCombination.forEach(player => {
        const highestCardCostInCombination = player.cardsAtCombination[combinationName].highestCardInCombination.cardCost;
        const highestCardCostOutsideCombination = isFiveCardCombination ? 0 : player.cardsAtCombination[combinationName].highestCardOutsideCombination.cardCost;
        // if (combinationName === COMBINATIONS.FULL_HOUSE) {
        //   console.warn(player.name, highestCardCostOutsideCombination);
        // }



        if (!uniqueHighCardCombinations.filter(([comboHighCardCost, outsideComboHighCardCost]) => comboHighCardCost === highestCardCostInCombination && outsideComboHighCardCost === highestCardCostOutsideCombination).length) {
          uniqueHighCardCombinations.push([highestCardCostInCombination, highestCardCostOutsideCombination])
        }
      });
      // if (combinationName === COMBINATIONS.ROYAL_FLUSH) {
      //   console.warn(uniqueHighCardCombinations);
      // }

      // if (combinationName === COMBINATIONS.STRAIGHT_FLUSH) {
      //   console.warn('test')
      // }
      for (const [uniqueHighCombinationCardCost, uniqueHighOutsideCombinationCardCost] of uniqueHighCardCombinations) {
        // console.warn('test')

        const playersWithTheseHighCards = sortedPlayersWithThisCombination.filter(player => {
          const highCombinationCardCost = player.cardsAtCombination[combinationName].highestCardInCombination.cardCost;
          const highOutsideCombinationCardCost = player.cardsAtCombination[combinationName].highestCardOutsideCombination.cardCost;

          return highCombinationCardCost === uniqueHighCombinationCardCost && highOutsideCombinationCardCost === uniqueHighOutsideCombinationCardCost;
        });
        // if (combinationName === COMBINATIONS.ROYAL_FLUSH) {
        //   console.warn(playersWithTheseHighCards.map(x => x.name));
        // }

        // if (combinationName === COMBINATIONS.ROYAL_FLUSH) {
        //   console.warn(sortedPlayersWithThisCombination.map(p => p.name));
        //   // console.warn(playersWithTheseHighCards);
        // }

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
          winMoneyLeft -= approxSumToWin;
          amountOfPlayersLeftWithThisCombination -= 1;
          const winnerObject: Winner = {
            id: player.id,
            cards: player.cards,
            combinationName: player.bestCombinationName,
            bestCombinationCards: player.bestCombinationCards,
            winAmount: approxSumToWin,
            playerName: player.name,
          };
          store.winners.push(winnerObject);
          /* since we rounded the sum which is split between multiple winners, we can not give the rest out */
          if (winMoneyLeft < 2) {
            return
          }
        }
      }
    }
  }
}
