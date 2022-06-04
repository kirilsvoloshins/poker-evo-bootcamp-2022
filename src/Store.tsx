import { makeAutoObservable, makeObservable } from "mobx";
import { ComponentNames, PlayerType, SuitSymbol, CardNameSymbol, CardType, GameState, GameEvent } from "./types";
import { suits, cardNames, suitSymbols, cardNameSymbols, aiPlayerNames, humanPlayerNames, amountOfCardsInTheDeck, cardCosts, POKER_ROUNDS, getDateForGameEvent, BET_ACTION } from "./utils";
import { Card } from "./classes/Card";
import { Player } from "./classes/Player";
import { Players } from "./classes/Players";
import { Deck } from "./classes/Deck";

const formatGameLog = (arrayOfGameEvents: string[]): any => {
  const amountOfLatestEventsToShow = 14;
  const latestGameEventIndex = arrayOfGameEvents.length - 1;
  const rangeOfGameEventIndexesToShow = latestGameEventIndex - amountOfLatestEventsToShow;
  const latestEventRecords = arrayOfGameEvents.filter((gameEvent, i) => {
    const doesEventNeedToBeShown = i > rangeOfGameEventIndexesToShow;
    return doesEventNeedToBeShown;
  });
  const formattedEventString = (
    <>
      {
        latestEventRecords.map(x =>
          <>
            <span>{x} </span>
            <br />
          </>
        )
      }
    </>);
  return formattedEventString;
}

// type RoundName = ""

class Store {
  currentPage: ComponentNames = "Game"; // the page to show
  amountOfHumanPlayers: number = 3; // value for game init
  minimumBet: number = 10; // players can not bet less that this
  initialDeposit: number = 500; // value for game init

  players: Players = {} as Players; // ???
  initialPlayers: Player[] = []; // ??? list of players who started playing

  deck: Deck = new Deck; // array of cards to pick from
  cardsOnTheDesk: Card[] = [];
  gameLog: string[] = [];

  isGameActive: boolean = false; // game state, set false on end and true on start
  gameState: GameState = ""; // ???
  activeRound: POKER_ROUNDS;
  winner: Player | null = null; // if the game ends, show the winner

  sumOfBets: number = 0; // the sum to split between winners of the round
  betToSupport: number = this.blinds.bigBlind;
  currentBetToMatch: number = 0; // maximum bet in this round

  constructor() {
    makeAutoObservable(this);
  }

  startGame() {
    /* reset some things */
    console.log('game start');
    this.sumOfBets = 0;
    this.gameLog = [];
    this.cardsOnTheDesk = [];

    /* if it is not the first level, delete players who do not have enough money */
    // if (this.players.playerList) {
    //   //todo: handle if player has not enough money to support the blind.
    //   this.players.playerList = this.players.playerList.filter(player => player.moneyLeft > 0);
    //   this.players.playerList.forEach(player => {
    //     player.hasFolded = false;

    //     player.canSupportBet = true;
    //     player.canCheck = true;
    //     player.canRaise = true;
    //   });
    // }

    this.logGameEvent("<<< GAME START >>>");
    this.startRound_BlindCall();
  }



  startNextRound() {
    const activeRound = this.activeRound;
    /* cleanup before the round */
    this.players.playersStillInThisRound.forEach(player => {
      player.canCheck = true;
      player.canSupportBet = true;
      player.canRaise = true;
    });

    // this.players.activePlayer = this.players.getNextActivePlayer();

    switch (activeRound) {
      case POKER_ROUNDS.BLIND_CALL: {
        return this.startRound_Flop();
      }
      case POKER_ROUNDS.FLOP: {
        return this.startRound_Turn();
      }
      case POKER_ROUNDS.TURN: {
        return this.startRound_River();
      }
      case POKER_ROUNDS.RIVER: {
        return this.determineWinners();
      }
      default: {
        console.error("Unhandled activeRound: ", activeRound);
        break;
      }
    }
  }

  startRound_BlindCall() {
    this.activeRound = POKER_ROUNDS.BLIND_CALL;
    this.logGameEvent("< BLIND CALL >");

    const deck = new Deck();
    this.deck = deck;

    const players = new Players({
      amountOfHumanPlayers: this.amountOfHumanPlayers,
      deck: deck,
      initialMoney: this.initialDeposit
    });
    this.players = players;

    /* big and small blinds */
    this.players.passBlinds();
    const { smallBlind, bigBlind } = this.blinds;
    const { smallBlindPlayer, bigBlindPlayer } = players;
    bigBlindPlayer.placeBet({ betAmount: bigBlind, store: this, betAction: BET_ACTION.BIG_BLIND });
    smallBlindPlayer.placeBet({ betAmount: smallBlind, store: this, betAction: BET_ACTION.SMALL_BLIND });

    /* give cards to players */
    const playerList = this.players.playerList;
    for (const player of playerList) {
      for (let i = 0; i <= 1; i++) {
        const randomCard = deck.pickRandomCard();
        player.pickCard(randomCard);
      }
    }

    /* players decide whether to continue playing with these cards or fold (starting from the small blind player) */
    this.betToSupport = bigBlind;
    this.players.updatePlayerAbilities(this);
    this.players.activePlayer = players.smallBlindPlayer;
  }

  startRound_Flop() {
    this.activeRound = POKER_ROUNDS.FLOP;
    this.logGameEvent("< FLOP >");
    //todo: make sure it is the right time to update data...
    this.players.updatePlayerAbilities(this);

    for (let i = 1; i <= 3; i++) {
      const randomCard = this.deck.pickRandomCard();
      this.cardsOnTheDesk.push(randomCard);
    }

    const nextActivePlayer = this.players.getNextActivePlayer();
    this.players.activePlayer = nextActivePlayer;
  }

  startRound_Turn() {
    this.activeRound = POKER_ROUNDS.TURN;
    this.logGameEvent("< TURN >");

    const randomCard = this.deck.pickRandomCard();
    this.cardsOnTheDesk.push(randomCard);

    const nextActivePlayer = this.players.getNextActivePlayer();
    this.players.activePlayer = nextActivePlayer;
  }

  startRound_River() {
    this.activeRound = POKER_ROUNDS.RIVER;
    this.logGameEvent("< RIVER >");

    const randomCard = this.deck.pickRandomCard();
    this.cardsOnTheDesk.push(randomCard);

    const nextActivePlayer = this.players.getNextActivePlayer();
    this.players.activePlayer = nextActivePlayer;
  }





  /* pages */
  get getCurrentPage() {
    return this.currentPage;
  }
  setCurrentPage(pageToShow: ComponentNames) {
    this.currentPage = pageToShow;
  }
  /* game settings */
  setInitialDeposit(initialDeposit: number) {
    this.initialDeposit = initialDeposit;
  }
  setMinimumBet(minimumBet: number) {
    this.minimumBet = minimumBet;
  }
  addToSumOfBets(amountToAdd: number) {
    this.sumOfBets += amountToAdd;
  }
  get blinds() {
    return {
      smallBlind: this.minimumBet,
      bigBlind: this.minimumBet * 2,
    }
  }
  logGameEvent(event: string) {
    const eventTime = getDateForGameEvent(new Date());
    const gameEvent = `${eventTime}: ${event}`;
    this.gameLog.push(gameEvent);
  }
  get formattedGameLog() {
    return formatGameLog(this.gameLog);
  }
  setAmountOfHumanPlayers(amountOfPlayersToSet: number) {
    this.amountOfHumanPlayers = amountOfPlayersToSet;
  }
  showEndGameDialog() {

  }

  determineWinners() {
    // const playerList = this.players.playerList;
    // if (playerList.length === 1) {
    //   /* there is only one player left, so he is the winner :) */
    //   this.winner = playerList[0];
    //   this.winner.moneyLeft += this.sumOfBets;
    //   this.logGameEvent(`< WINNER: ${this.winner.name} gets ${this.sumOfBets} >`);
    //   this.showEndGameDialog();
    //   return;
    // }


  }
}

const store = new Store();
export default store;