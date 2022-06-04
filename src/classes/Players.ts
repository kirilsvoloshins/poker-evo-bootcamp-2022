// import { ComponentNames, Card, SuitSymbol, CardNameSymbol, GameState } from "../types";
import { suits, cardNames, suitSymbols, cardNameSymbols, aiPlayerNames, humanPlayerNames, amountOfCardsInTheDeck, POKER_ROUNDS, cardCosts } from "../utils";
import { StoreType, SuitSymbol } from "../types";
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

  getListOfCombinations(cardsOnTheDesk: Card[]) {
    const players = this.playersStillInThisRound;
    const combinations = {
      hasRoyalFlush: false,       //todo  1.combo
      hasStraightFlush: false,    //  2.combo
      hasFourOfKind: false,       //  3.combo
      hasFullHouse: false,        //!  4.combo
      hasFlush: false,            //  5.combo
      hasStraight: false,         //  6.combo
      hasThreeOfKind: false,      //  7.combo
      hasTwoPairs: false,         //  8.combo
      hasPair: false,             //  9.combo
      hasHighCard: false,         // 10.combo
    };

    //!!! quick fix
    const playerCards = this.playersStillInThisRound[0].cards;
    const cardsToCheck = [...cardsOnTheDesk, ...playerCards];
    const sortedCardsToCheck = cardsToCheck.sort(getSortedArrayofCards);
    const suitsOfCardsToCheck = cardsToCheck.map(({ suitSymbol }) => suitSymbol);
    const uniqueCardCosts = [...new Set(cardsToCheck.map(({ cardCost }) => cardCost))];
    const cardsWithPairs = uniqueCardCosts
      .map(uniqueCardCost => cardsToCheck.filter(({ cardCost }) => cardCost === uniqueCardCost))
      .filter(cardsWithMatchingCosts => cardsWithMatchingCosts.length === 2);
    const cardsWithThreeOfKinds = uniqueCardCosts
      .map(uniqueCardCost => cardsToCheck.filter(({ cardCost }) => cardCost === uniqueCardCost))
      .filter(cardsWithMatchingCosts => cardsWithMatchingCosts.length === 3);
    const cardsWithFourOfKinds = uniqueCardCosts
      .map(uniqueCardCost => cardsToCheck.filter(({ cardCost }) => cardCost === uniqueCardCost))
      .filter(cardsWithMatchingCosts => cardsWithMatchingCosts.length === 4);

    //* hasHighCard
    const highestCardOfThisPlayer = playerCards.sort(getSortedArrayofCards)[0];
    //todo: handle multiple highest cards (in all player cards)
    const highestCardOfAllPlayers = this.playersStillInThisRound
      .map(({ cards }) => cards.sort(getSortedArrayofCards)[0])
      .sort(getSortedArrayofCards)[0];
    const doesThisPlayerHaveTheHighestCard = highestCardOfAllPlayers.cardCost === highestCardOfThisPlayer.cardCost;
    combinations.hasHighCard = doesThisPlayerHaveTheHighestCard;

    //* hasPair
    const hasPair = cardsWithPairs.length === 1;
    combinations.hasPair = hasPair;

    //* hasTwoPairs
    const hasTwoPairs = cardsWithPairs.length === 2;
    combinations.hasTwoPairs = hasTwoPairs;

    //* hasThreeOfKind
    const hasThreeOfKind = cardsWithThreeOfKinds.length > 0;
    combinations.hasThreeOfKind = hasThreeOfKind;

    //* hasStraight
    const checkForStraight = (cardsToCheck: Card[]): boolean => {
      let amountOfCardsInPotentialStraight = 1, previousCardCost = 0;
      for (const { cardCost } of cardsToCheck) {
        const areCardsConsecutive = cardCost === previousCardCost - 1;
        amountOfCardsInPotentialStraight = areCardsConsecutive ? amountOfCardsInPotentialStraight + 1 : 1;
        previousCardCost = cardCost;
      }
      return amountOfCardsInPotentialStraight >= 5;
    }
    combinations.hasStraight = checkForStraight(cardsToCheck);

    //* hasFlush
    const uniqueSuitSymbols = Object.keys(suitSymbols) as SuitSymbol[];
    const hasFlush = uniqueSuitSymbols.map(uniqueSuitSymbol => {
      return cardsToCheck.filter(({ suitSymbol }) => suitSymbol === uniqueSuitSymbol).length >= 5;
    }).length > 0;
    combinations.hasFlush = hasFlush;

    //!!! hasFullHouse - we need to disable pairs and three-of-kinds if has full house
    const hasFullHouse = hasPair && hasThreeOfKind;
    combinations.hasFullHouse = hasFullHouse;

    //* hasFourOfKind
    const hasFourOfKind = cardsWithFourOfKinds.length === 1;
    combinations.hasFourOfKind = hasFourOfKind;

    //!!! todo: hasStraightFlush - we need to disable straight and flush
    const checkForStraightFlush = (cardsToCheck: Card[]): boolean => {
      let amountOfCardsInPotentialStraightFlush = 1, previousCardCost = 0, previousCardSuit = "";
      for (const { cardCost, suitSymbol } of cardsToCheck) {
        const areCardsPotentionallyInStraightFlush = cardCost === previousCardCost - 1 && suitSymbol === previousCardSuit;
        amountOfCardsInPotentialStraightFlush = areCardsPotentionallyInStraightFlush ? amountOfCardsInPotentialStraightFlush + 1 : 1;
        previousCardCost = cardCost;
      }
      return amountOfCardsInPotentialStraightFlush >= 5;
    }
    const hasStraightFlush = checkForStraightFlush(cardsToCheck);
    combinations.hasStraightFlush = hasStraightFlush;

    //* hasRoyalFlush
    const checkForRoyalFlush = (cardsToCheck: Card[]): boolean => {
      if (!combinations.hasFlush) {
        return false;
      }

      const flushSuit = uniqueSuitSymbols.filter(uniqueSuitSymbol => {
        return cardsToCheck.filter(({ suitSymbol }) => suitSymbol === uniqueSuitSymbol).length >= 5;
      })[0];

      const sortedCardsOfFlushSuit: Card[] = sortedCardsToCheck.filter(({ suitSymbol }) => suitSymbol === flushSuit);
      const isTheHighestCardAce = cardsToCheck[0].cardCost === cardCosts["ace"];
      if (!isTheHighestCardAce) {
        return false;
      }

      let amountOfCardsInPotentialRoyalFlush = 1, previousCardCost = 0, previousCardSuit = "";
      for (const { cardCost, suitSymbol } of sortedCardsOfFlushSuit) {
        const areCardsPotentionallyInRoyalFlush = cardCost === previousCardCost - 1 && suitSymbol === previousCardSuit;
        if (!areCardsPotentionallyInRoyalFlush) {
          return false;
        }

        amountOfCardsInPotentialRoyalFlush++;
        previousCardCost = cardCost;
      }
      return amountOfCardsInPotentialRoyalFlush >= 5;
    }
    const hasRoyalFlush = checkForRoyalFlush(cardsToCheck);
    combinations.hasStraightFlush = hasRoyalFlush;
  }


  getWinners(sumOfBets: number) {
    const playersAtCombinations: PlayersAtCombinations = {

    };
  }
}

const getSortedArrayofCards = (cardA: Card, cardB: Card): any => {
  const { cardCost: cardCost_1 } = cardA;
  const { cardCost: cardCost_2 } = cardB;
  return cardCost_2 - cardCost_1;
}


interface PlayersAtCombinations {
  [index: string]: Player[]
};

interface PlayersType {

};

interface PlayersConstructorArgs {
  amountOfHumanPlayers: number,
  deck: Deck,
  initialMoney: number,
}