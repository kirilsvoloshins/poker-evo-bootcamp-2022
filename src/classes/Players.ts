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

  getNextActivePlayer() {
    /* 
      function getNextActivePlayer() {
        // assuming it is sorted by player ids ascending
        const playersWhoCanReact = players.filter(player => player !== activePlayer && player.canReact);
        let nextPlayerId = 0;
        for (const { id } of playersWhoCanReact) {
          if (id > activePlayer.id) {
            nextPlayerId = id; //?
            break;
          }
        }
        const nextPlayer = playersWhoCanReact.find(({ id }) => id === nextPlayerId);
        return nextPlayer;
      }
    */
    //todo: find the next consecutive player
    //todo: add a canReact to player class

    const activePlayer = this.activePlayer;
    const playersWhoCanReact = this.playersLeftToReact;
    // const playersWhoCanReact = this.playerList.filter(player => player !== activePlayer && player.canReact);
    let nextPlayerId = 0;
    for (const { id } of playersWhoCanReact) {
      if (id > activePlayer.id) {
        nextPlayerId = id; //?
        break;
      }
    }
    const nextActivePlayer = playersWhoCanReact.find(({ id }) => id === nextPlayerId);
    return nextActivePlayer;
  }

  updatePlayerAbilities(store: StoreType) {
    // player can't continue playing in this round if: hasFolded
    this.playersStillInThisRound = this.playerList.filter(player => !player.hasFolded);
    // player can react to the bet if: !isAllIn && !hasFolded
    this.playersLeftToReact = this.playersStillInThisRound.filter(player => !player.isAllIn);
    this.playersLeftToReact.forEach(player => {
      const { sumOfPersonalBetsInThisRound } = player;
      player.canSupportBet
    });

    // /* if player went all in, hes does not have to react to bets anymore */
    // this.playersStillInThisRound.forEach(player=>{
    //   if(player.isAllIn){
    //     player.hasReacted = true;
    //   }
    // })

    /* if the player did not react and did not go all in, he will have to react */
    // this.playersLeftToReact = this.playersStillInThisRound; 
    // const betToSupport = store.be

    // this.playersLeftToReact = this.playersStillInThisRound.filter(player => {
    // return player.hasReacted = false && !player.isAllIn;
    // return !player.isAllIn;
    // return player.canReact; // && player.
    // return
    // });


    // this.playerList = this.playerList.filter(player => {
    //   const canPlayerStayInThisRound = !player.hasFolded && (player.isAbleToContinuePlaying(store) || player.isAllIn);
    //   return canPlayerStayInThisRound;
    // });

    /* we need to know how many players are there left to react (to the bet or else) to end the round */
    // const betToSupport = store.betToSupport;
    // this.playersLeftToReact = this.playerList.filter(player => {
    //   if (player.isAllIn) {
    //     return false;
    //   }


    //   //!!! ADD HAS REACTED, BECAUSE IF EVERYONE CHECKS, THIS IF IS NOT WORKING.
    //   return player.hasReacted === false;
    //   // return player.betAmount < betToSupport;
    // });

    // this.playersStillInThisRound.forEach(player => {
    //   const { isAllIn, betAmount, moneyLeft } = player;
    //   // if player has bet all his money, no point for another choices.
    //   if (isAllIn) {
    //     // player.canCheck = false;
    //     // player.canSupportBet = false;
    //     return;
    //   }

    //   /* if no one bets higher than this player, he can check */
    //   const canCheck = betToSupport === betAmount;
    //   player.canCheck = canCheck;

    //   /* if player has money to support the current bet, he can support) */
    //   const betToPayToContinue = betToSupport - betAmount;
    //   const canSupportBet = moneyLeft >= betToPayToContinue;
    //   player.canSupportBet = canSupportBet;
    //   player.betToPayToContinue = betToPayToContinue;
    // });

    // this.playerList.forEach(player => {
    //   const { isAllIn, betAmount, moneyLeft } = player;
    //   // if player has bet all his money, no point for another choices.
    //   if (isAllIn) {
    //     player.canCheck = false;
    //     player.canSupportBet = false;
    //     return;
    //   }

    //   /* if no one bets higher than this player, he can check */
    //   const canCheck = betToSupport === betAmount;
    //   player.canCheck = canCheck;

    //   /* if player has money to support the current bet, he can support) */
    //   const betToPayToContinue = betToSupport - betAmount;
    //   const canSupportBet = moneyLeft >= betToPayToContinue;
    //   player.canSupportBet = canSupportBet;
    //   player.betToPayToContinue = betToPayToContinue;
    // });
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