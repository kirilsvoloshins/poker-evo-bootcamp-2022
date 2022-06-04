// import { ComponentNames, Card, SuitSymbol, CardNameSymbol, GameState } from "../types";
import { suits, cardNames, suitSymbols, cardNameSymbols, aiPlayerNames, humanPlayerNames, amountOfCardsInTheDeck, POKER_ROUNDS, cardCosts, COMBINATIONS } from "../utils";
import { StoreType, SuitSymbol, Winner } from "../types";
import { Deck } from "./Deck";
// import { Card } from "./Card";
import { Player } from "./Player";
// import StoreVal from "../Store";
import { makeAutoObservable } from "mobx";
import { Card } from "./Card";

export class Players implements PlayersType {
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
    // this.activePlayer.hasReacted = true;
    this.updatePlayerAbilities(store);

    const areThereAnyPlayersToReact = this.playersLeftToReact.length > 0;
    if (!areThereAnyPlayersToReact) {
      console.log('no players to react!');
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
      console.log(player.name, player.betToPayToContinue, store.maxSumOfIndividualBets, player.sumOfPersonalBetsInThisRound);
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
    // if there is only one player left, he is the winner
    if (playersStillInThisRound.length === 1) {
      const winnerObject: Winner = {} as Winner;
      store.winners = []
      return playersStillInThisRound[0];
    }

    // HIGH_CARD
    const highestCardCostAmongstAllPlayers = Math.max(...playersStillInThisRound.map(({ cards }) => cards.map(({ cardCost }) => cardCost)).flat());
    const playersWithHighestCards = playersStillInThisRound.filter(player => player.cards.map(({ cardCost }) => cardCost).includes(highestCardCostAmongstAllPlayers));

    const uniqueSuitSymbols = Object.keys(suitSymbols) as SuitSymbol[];
    const playersWithOnePair: Player[] = [], playersWithTwoPairs: Player[] = [], playersWithThreeOfKind: Player[] = [], playersWithFourOfKind: Player[] = [], playersWithFlush: Player[] = [], playersWithStraight: Player[] = [], playersWithRoyalFlush: Player[] = [], playersWithFullHouse: Player[] = [], playersWithStraightFlush: Player[] = [];
    playersStillInThisRound.forEach(player => {
      const highestCard = player.cards.sort(getDescSortedArrayofCards)[0];
      player.highestCard = highestCard;

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
        player.cardsAtCombination[COMBINATIONS.PAIR] = cardsWithPairs[0];
      } else if (cardsWithPairs.length >= 2) {
        // TWO PAIRS
        playersWithTwoPairs.push(player);
        player.cardsAtCombination[COMBINATIONS.TWO_PAIRS] = [...cardsWithPairs[0], ...cardsWithPairs[1]];
      }
      // THREE_OF_KIND
      const cardsWithThreeOfKinds = cardsOfUniqueCardCosts.filter(cardsWithMatchingCosts => cardsWithMatchingCosts.length === 3);
      if (cardsWithThreeOfKinds.length) {
        playersWithThreeOfKind.push(player);
        player.cardsAtCombination[COMBINATIONS.THREE_OF_KIND] = cardsWithThreeOfKinds[0];
      }
      // FOUR_OF_KIND
      const cardsWithFourOfKinds = cardsOfUniqueCardCosts.filter(cardsWithMatchingCosts => cardsWithMatchingCosts.length === 4);
      if (cardsWithFourOfKinds.length) {
        playersWithFourOfKind.push(player);
        player.cardsAtCombination[COMBINATIONS.FOUR_OF_KIND] = cardsWithFourOfKinds[0];
      }
      // FLUSH
      const cardsWithFlush = getCardsInFlushIfThereIsAny({ cardsToCheck: cardsToCheckForCombinations, uniqueSuitSymbols });
      if (cardsWithFlush.length) {
        playersWithFlush.push(player);
        player.cardsAtCombination[COMBINATIONS.FLUSH] = cardsWithFlush;
      }
      // STRAIGHT
      const cardsInStraight = getCardsInStraightIfThereIsAny(cardsToCheckForCombinations);
      if (cardsInStraight.length) {
        playersWithStraight.push(player);
        player.cardsAtCombination[COMBINATIONS.STRAIGHT] = cardsInStraight;
      }
      // STRAIGHT_FLUSH
      const cardsInStraightFlush = getCardsInFlushIfThereIsAny({ cardsToCheck: cardsInStraight, uniqueSuitSymbols });
      if (cardsInStraightFlush.length) {
        playersWithStraightFlush.push(player);
        player.cardsAtCombination[COMBINATIONS.STRAIGHT_FLUSH] = cardsInStraightFlush;
      }

      //!!! handle ignoring a pair if there is full house
      // FULL_HOUSE
      if (cardsWithPairs.length && cardsWithThreeOfKinds.length) {
        playersWithFullHouse.push(player);
        player.cardsAtCombination[COMBINATIONS.FULL_HOUSE] = [...cardsWithPairs[0], ...cardsWithThreeOfKinds[0]];
      }
      // ROYAL FLUSH
      if (cardsInStraightFlush.length) {
        if (cardsInStraightFlush[0].cardCost === cardCosts["ace"]) {
          //!!! there can only be one player with royal flash
          playersWithRoyalFlush.push(player);
          player.cardsAtCombination[COMBINATIONS.STRAIGHT_FLUSH] = cardsInStraightFlush;
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

    // getting the winner 
    // todo: handle splitting the win if the first winner went did not bet enough to take everything
    const combinations = [COMBINATIONS.ROYAL_FLUSH, COMBINATIONS.STRAIGHT_FLUSH, COMBINATIONS.FOUR_OF_KIND, COMBINATIONS.FULL_HOUSE, COMBINATIONS.FLUSH, COMBINATIONS.STRAIGHT, COMBINATIONS.THREE_OF_KIND, COMBINATIONS.TWO_PAIRS, COMBINATIONS.PAIR, COMBINATIONS.HIGH_CARD];
    let winMoneyLeft = sumOfBets;
    // let isThereAnyWinMoneyLeft = true;
    for (const combinationName of combinations) {
      const playersWithThisCombination = playersAtCombination[combinationName];
      const amountOfPlayersWithThisCombination = playersWithThisCombination.length;
      if (amountOfPlayersWithThisCombination) {
        if (amountOfPlayersWithThisCombination === 1) {
          const player = playersWithThisCombination[0];
          if (player.isAllIn) {

          }
        }
      }
    }
  }
}

const getDescSortedArrayofCards = (cardA: Card, cardB: Card): any => {
  const { cardCost: cardCost_1 } = cardA;
  const { cardCost: cardCost_2 } = cardB;
  return cardCost_2 - cardCost_1;
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
  let amountOfCardsInPotentialStraight = 1, previousCardCost = 0, cardsInStraight: Card[] = [cardsToCheck[0]];
  // for (const [cardIndex, card] of Object.entries(cardsToCheck)) {
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
    // amountOfCardsInPotentialStraight = areCardsConsecutive ? amountOfCardsInPotentialStraight + 1 : 1;
    previousCardCost = card.cardCost;
  }
  if (amountOfCardsInPotentialStraight < 5) {
    return [];
  }
  cardsInStraight = cardsInStraight.filter((_, i) => i <= 4); // return only 5 cards (starting from the highest so as not to miss flash royale)
  return cardsInStraight;
}



type PlayersAtCombinations = Partial<Record<COMBINATIONS, any>>;

interface PlayersType {

};

interface PlayersConstructorArgs {
  amountOfHumanPlayers: number,
  deck: Deck,
  initialMoney: number,
}