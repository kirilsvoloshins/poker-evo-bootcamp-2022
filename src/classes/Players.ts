import { suitSymbols, humanPlayerNames, cardCosts, COMBINATIONS, suits, cardNameSymbols } from "../consts";
import { CardCost, GetWinnersArguments, PlayersAtCombinations, PlayersConstructorArgs, StoreType, SuitSymbol } from "../types";
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
        moneyLeft: initialMoney,
        // moneyLeft: initialMoney * (i + 1),
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
    const getNextPlayer = (id: number, accessiblePlayers: Player[]) => {
      // const accessiblePlayerIds = accessiblePlayers.map(({ id }) => id);
      const potentialNextPlayerId = id + 1;
      const potentialNextPlayer = accessiblePlayers.find(player => player.id === potentialNextPlayerId);
      if (potentialNextPlayer) {
        return potentialNextPlayer;
      }
      return accessiblePlayers[0];
    }

    /* breaks if the player leaves game */
    const { bigBlindPlayer: prevBigBlindPlayer, playerList: accessiblePlayers } = this;
    const bigBlindPlayer = getNextPlayer(prevBigBlindPlayer.id, accessiblePlayers);
    this.bigBlindPlayer = bigBlindPlayer;
    let smallBlindPlayer = getNextPlayer(bigBlindPlayer.id, accessiblePlayers);
    if (smallBlindPlayer === bigBlindPlayer) {
      smallBlindPlayer = getNextPlayer(bigBlindPlayer.id + 1, accessiblePlayers);
    }
    this.smallBlindPlayer = smallBlindPlayer;
  }

  passMove(store: StoreType) {
    const isEveryoneAllIn = this.playerList.every(player => player.isAllIn);
    store.isEveryoneAllIn = isEveryoneAllIn;
    if (isEveryoneAllIn) {
      this.showAllCards();
      return store.startNextRound();
    }

    this.updatePlayerAbilities(store);

    // const isEveryoneElseAllIn = this.playerList.filter(player => !player.isAllIn).length === 1;
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
    this.playersLeftToReact = this.playersStillInThisRound.filter(player => !player.isAllIn).filter(player => !player.hasReacted || player.hasReacted && player.sumOfPersonalBetsInThisRound < store.maxSumOfIndividualBets);
    this.playersLeftToReact.forEach(player => {
      player.hasReacted = false;
      player.canCheck = player.sumOfPersonalBetsInThisRound === store.maxSumOfIndividualBets;
      player.canSupportBet = (player.sumOfPersonalBetsInThisRound + player.moneyLeft) >= store.maxSumOfIndividualBets;
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

  showAllCards() {
    this.playerList.forEach(player => player.showCards());
  }

  getWinners({ sumOfBets, store }: GetWinnersArguments) {
    const { playersStillInThisRound } = this;

    // HIGH_CARD
    const highestCardCostAmongstAllPlayers = Math.max(...playersStillInThisRound.map(({ cards }) => cards.map(({ cardCost }) => cardCost)).flat()) as CardCost;
    const playersWithHighestCards = playersStillInThisRound.filter(player => player.cards.map(({ cardCost }) => cardCost).includes(highestCardCostAmongstAllPlayers));

    const uniqueSuitSymbols = suits.map(suit => suitSymbols[suit]);
    const playersWithOnePair: Player[] = [], playersWithTwoPairs: Player[] = [], playersWithThreeOfKind: Player[] = [], playersWithFourOfKind: Player[] = [], playersWithFullHouse: Player[] = [], playersWithRoyalFlush: Player[] = [], playersWithStraightFlush: Player[] = [];
    let playersWithFlush: Player[] = [], playersWithStraight: Player[] = [];
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
      if (cardsWithFlush.length) {
        playersWithFlush.push(player);
        const combinationCards = cardsWithFlush;
        player.cardsAtCombination[COMBINATIONS.FLUSH] = {
          combinationCards,
          highestCardInCombination: getHighestCardOfCards(combinationCards),
          highestCardOutsideCombination: { cardCost: 0 } as Card
        };
        player.bestCombinationName = COMBINATIONS.FLUSH;
        player.bestCombinationCards = combinationCards;
      }
      // STRAIGHT
      const cardsInStraight = getCardsInStraightIfThereIsAny(cardsToCheckForCombinations);
      if (cardsInStraight.length) {
        playersWithStraight.push(player);
        const combinationCards = cardsInStraight;
        player.cardsAtCombination[COMBINATIONS.STRAIGHT] = {
          combinationCards,
          highestCardInCombination: getHighestCardOfCards(combinationCards),
          highestCardOutsideCombination: { cardCost: 0 } as Card,
        };
        player.bestCombinationName = COMBINATIONS.STRAIGHT;
        player.bestCombinationCards = combinationCards;
      }
      // STRAIGHT_FLUSH
      const cardsInStraightFlush = getCardsInStraightIfThereIsAny(cardsWithFlush);
      if (cardsInStraightFlush.length) {
        // ROYAL FLUSH
        if (cardsInStraightFlush[0].cardCost === cardCosts["ace"]) {
          playersWithRoyalFlush.push(player);
          playersWithFlush = playersWithFlush.filter(ePlayer => ePlayer !== player);
          playersWithStraight = playersWithStraight.filter(ePlayer => ePlayer !== player);
          const combinationCards = cardsInStraightFlush;
          player.cardsAtCombination[COMBINATIONS.ROYAL_FLUSH] = {
            combinationCards,
            highestCardInCombination: getHighestCardOfCards(combinationCards),
            highestCardOutsideCombination: { cardCost: 0 } as Card
          };
          player.bestCombinationName = COMBINATIONS.ROYAL_FLUSH;
          player.bestCombinationCards = combinationCards;
        } else {
          playersWithStraightFlush.push(player);
          playersWithFlush = playersWithFlush.filter(ePlayer => ePlayer !== player);
          playersWithStraight = playersWithStraight.filter(ePlayer => ePlayer !== player);

          const combinationCards = cardsInStraight;
          player.cardsAtCombination[COMBINATIONS.STRAIGHT_FLUSH] = {
            combinationCards,
            highestCardInCombination: getHighestCardOfCards(combinationCards),
            highestCardOutsideCombination: { cardCost: 0 } as Card
          };
          player.bestCombinationName = COMBINATIONS.STRAIGHT_FLUSH;
          player.bestCombinationCards = combinationCards;
        }
      }

      // FULL_HOUSE
      if (cardsWithPairs.length && cardsWithThreeOfKinds.length) {
        playersWithFullHouse.push(player);
        const combinationCards = [...cardsWithPairs[0], ...cardsWithThreeOfKinds[0]];
        player.cardsAtCombination[COMBINATIONS.FULL_HOUSE] = {
          combinationCards,
          highestCardInCombination: getHighestCardOfCards(cardsWithThreeOfKinds[0]),
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


    let winMoneyLeft = sumOfBets;
    // if there is only one player left, he is the winner
    if (playersStillInThisRound.length === 1) {
      const player = playersStillInThisRound[0];
      player.winAmount = winMoneyLeft;
      store.winners = [player];
      return;
    }

    // getting the winner 
    const combinations = [COMBINATIONS.ROYAL_FLUSH, COMBINATIONS.STRAIGHT_FLUSH, COMBINATIONS.FOUR_OF_KIND, COMBINATIONS.FULL_HOUSE, COMBINATIONS.FLUSH, COMBINATIONS.STRAIGHT, COMBINATIONS.THREE_OF_KIND, COMBINATIONS.TWO_PAIRS, COMBINATIONS.PAIR, COMBINATIONS.HIGH_CARD];
    for (const combinationName of combinations) {
      if (winMoneyLeft < store.minimumBet) {
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
          winMoneyLeft -= moneyThePlayerWins;
          player.winAmount = moneyThePlayerWins;
          store.winners.push(player);
          continue;
        }

        //=> player is not all in => he takes it all
        player.winAmount = winMoneyLeft;
        store.winners.push(player);
        return;
      }

      //=> there are multiple people with the same combination
      const isFiveCardCombination = [COMBINATIONS.STRAIGHT, COMBINATIONS.FLUSH, COMBINATIONS.FULL_HOUSE, COMBINATIONS.STRAIGHT_FLUSH, COMBINATIONS.ROYAL_FLUSH].includes(combinationName);
      if (isFiveCardCombination) {
        playersWithThisCombination.forEach(player => {
          player.cardsAtCombination[combinationName].highestCardOutsideCombination.cardCost = 0;
          // player.cardsAtCombination[combinationName].highestCardOutsideCombination = { ...player.cardsAtCombination[combinationName].highestCardOutsideCombination, cardCost: 0 };
        });
      }
      const sortedPlayersWithThisCombination = getPlayersDescSortedByHighestCards({ playersWithThisCombination, combinationName });
      const uniqueHighCardCombinations: number[][] = [];
      sortedPlayersWithThisCombination.forEach(player => {
        const highestCardCostInCombination = player.cardsAtCombination[combinationName].highestCardInCombination.cardCost;
        const highestCardCostOutsideCombination = isFiveCardCombination ? 0 : player.cardsAtCombination[combinationName].highestCardOutsideCombination.cardCost;
        if (!uniqueHighCardCombinations.filter(([comboHighCardCost, outsideComboHighCardCost]) => comboHighCardCost === highestCardCostInCombination && outsideComboHighCardCost === highestCardCostOutsideCombination).length) {
          uniqueHighCardCombinations.push([highestCardCostInCombination, highestCardCostOutsideCombination])
        }
      });

      for (const [uniqueHighCombinationCardCost, uniqueHighOutsideCombinationCardCost] of uniqueHighCardCombinations) {
        const playersWithTheseHighCards = sortedPlayersWithThisCombination.filter(player => {
          const highCombinationCardCost = player.cardsAtCombination[combinationName].highestCardInCombination.cardCost;
          const highOutsideCombinationCardCost = player.cardsAtCombination[combinationName].highestCardOutsideCombination.cardCost;

          return highCombinationCardCost === uniqueHighCombinationCardCost && highOutsideCombinationCardCost === uniqueHighOutsideCombinationCardCost;
        });
        let amountOfPlayersLeftWithThisCombination = playersWithTheseHighCards.length;
        for (const player of playersWithTheseHighCards) {
          /* since we rounded the sum which is split between multiple winners, we can not give the rest out */
          if (winMoneyLeft < 2) {
            return
          }

          const approxSumToWin = Math.floor(winMoneyLeft / amountOfPlayersLeftWithThisCombination);
          const { isAllIn, sumToWinIfPlayerGoesAllIn } = player;
          if (isAllIn) {
            const moneyThePlayerWins = approxSumToWin > sumToWinIfPlayerGoesAllIn ? sumToWinIfPlayerGoesAllIn : winMoneyLeft;
            winMoneyLeft -= moneyThePlayerWins;
            player.winAmount = moneyThePlayerWins;
            store.winners.push(player);
            amountOfPlayersLeftWithThisCombination--;
            continue;
          }

          //=> player is not all in => he takes it all
          winMoneyLeft -= approxSumToWin;
          player.winAmount = approxSumToWin;
          store.winners.push(player);
          amountOfPlayersLeftWithThisCombination--;
        }
      }
    }
  }
}
