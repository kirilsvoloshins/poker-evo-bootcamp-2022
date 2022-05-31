// import { ComponentNames, Card, SuitSymbol, CardNameSymbol, GameState } from "../types";
import { suits, cardNames, suitSymbols, cardNameSymbols, aiPlayerNames, humanPlayerNames, amountOfCardsInTheDeck, POKER_ROUNDS } from "../utils";
import { StoreType } from "../types";
import { Deck } from "./Deck";
import { Card } from "./Card";
import { Player } from "./Player";
import StoreVal from "../Store";
import { makeAutoObservable } from "mobx";

export class Players implements PlayersType {
  /* player could have folded in this level, but will play in the next! */
  playerList: Player[]; // static list of players which entered the game.
  playersLeftToReact: Player[]; // dynamic list of players which need to react to bets.
  playerListForThisLevel: Player[];
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
    this.playerListForThisLevel = playerList;
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
    this.activePlayer.hasReacted = true;
    this.updatePlayerAbilities(store);
    const areThereAnyPlayersToReact = this.playersLeftToReact.length > 0;
    if (!areThereAnyPlayersToReact) {
      store.startNextRound();
      return;
    }

    this.activePlayer = this.playersLeftToReact[0];
    /* if there is only one player left (everyone else can not continue), he wins! */
    // if (this.playerList.length === 1) {

    // }
  }

  getNextActivePlayer() {
    //todo: find the next consecutive player
    const lastActivePlayer = this.activePlayer;
    return lastActivePlayer;
  }

  updatePlayerAbilities(store: StoreType) {
    /* if player has no money and he did not go all in, he can not play further */
    this.playerList = this.playerList.filter(player => {
      const canPlayerStayInThisRound = !player.hasFolded && (player.isAbleToContinuePlaying(store) || player.isAllIn);
      return canPlayerStayInThisRound;
    });

    /* we need to know how many players are there left to react (to the bet or else) to end the round */
    const betToSupport = store.betToSupport;
    this.playersLeftToReact = this.playerList.filter(player => {
      if (player.isAllIn) {
        return false;
      }


      //!!! ADD HAS REACTED, BECAUSE IF EVERYONE CHECKS, THIS IF IS NOT WORKING.
      return player.hasReacted === false;
      // return player.betAmount < betToSupport;
    });

    this.playerList.forEach(player => {
      const { isAllIn, betAmount, moneyLeft } = player;
      // if player has bet all his money, no point for another choices.
      if (isAllIn) {
        player.canCheck = false;
        player.canSupportBet = false;
        return;
      }

      /* if no one bets higher than this player, he can check */
      const canCheck = betToSupport === betAmount;
      player.canCheck = canCheck;

      /* if player has money to support the current bet, he can support) */
      const betToPayToContinue = betToSupport - betAmount;
      const canSupportBet = moneyLeft >= betToPayToContinue;
      player.canSupportBet = canSupportBet;
      player.betToPayToContinue = betToPayToContinue;
    });
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