// import { ComponentNames, Card, SuitSymbol, CardNameSymbol, GameState } from "../types";
import { suits, cardNames, suitSymbols, cardNameSymbols, aiPlayerNames, humanPlayerNames, amountOfCardsInTheDeck, POKER_ROUNDS } from "../utils";
import { StoreType } from "../types";
import { Deck } from "./Deck";
// import { Card } from "./Card";
import { Player } from "./Player";
// import StoreVal from "../Store";
import { makeAutoObservable } from "mobx";

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

  getWinners(sumOfBets: number) {
    const playersAtCombinations: PlayersAtCombinations = {

    };
  }
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