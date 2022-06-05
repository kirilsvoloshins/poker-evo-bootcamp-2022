import { makeAutoObservable } from "mobx";
import { ComponentNames, Winner } from "./types";
import { getDateForGameEvent } from "./utils";
import { POKER_ROUNDS, BET_ACTION, COMBINATION_NAMES_HUMAN } from "./consts";
import { Card } from "./classes/Card";
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
            <span >{x} </span>
            <br />
          </>
        )
      }
    </>);
  return formattedEventString;
}

interface StoreType {
  currentPage: ComponentNames; // the page to show
  amountOfHumanPlayers: number; // value for game init
  minimumBet: number; // players can not bet less that this
  initialDeposit: number; // value for game init

  players: Players; // ???
  isEveryoneAllIn: boolean;
  deck: Deck; // array of cards to pick from
  cardsOnTheDesk: Card[];
  gameLog: string[];
  isGameActive: boolean; // game state, set false on end and true on start
  // gameState: GameState = ""; // ???
  activeRound: POKER_ROUNDS;
  // winner: Player | null = null; // if the game ends, show the winner
  winners: Winner[];

  maxSumOfIndividualBets: number; // maxmimum amount of bets of one person in this round
  sumOfBets: number; // the sum to split between winners of the round
}

class Store implements StoreType {
  currentPage = "Game" as ComponentNames; // the page to show
  amountOfHumanPlayers = 3; // value for game init
  minimumBet = 10; // players can not bet less that this
  initialDeposit = 100; // value for game init

  players = {} as Players; // ???
  isEveryoneAllIn = true;
  deck = {} as Deck; // array of cards to pick from
  cardsOnTheDesk = [] as Card[];
  gameLog = [] as string[];

  isGameActive = false; // game state, set false on end and true on start
  // gameState: GameState = ""; // ???
  activeRound: POKER_ROUNDS;
  winners: Winner[];

  maxSumOfIndividualBets = 0; // maxmimum amount of bets of one person in this round
  sumOfBets = 0; // the sum to split between winners of the round

  constructor() {
    makeAutoObservable(this);
  }

  // resetGameSettingsBeforeStart() {
  //   this.players = {} as Players;
  //   this.deck = {} as Deck;
  //   this.cardsOnTheDesk = [];
  //   this.gameLog = [];

  //   this.isGameActive = true;
  //   this.winners = [];

  //   this.maxSumOfIndividualBets = 0;
  //   this.sumOfBets = 0;
  // }

  // very first game
  startInitialGame() {
    this.logGameEvent("<<< GAME START >>>");
    const players = new Players({
      amountOfHumanPlayers: this.amountOfHumanPlayers,
      initialMoney: this.initialDeposit
    });
    this.players = players;
    this.isEveryoneAllIn = false;
    this.players.passBlinds();

    this.deck = new Deck();
    this.cardsOnTheDesk = [];
    this.gameLog = [];

    this.isGameActive = true;
    this.winners = [];

    this.maxSumOfIndividualBets = 0;
    this.sumOfBets = 0;

    this.startRound_BlindCall();
  }

  // game being continued
  continueGame() {
    this.logGameEvent("<<< GAME START >>>");
    const { playerList } = this.players;
    playerList.forEach(player => {
      player.sumOfPersonalBetsInThisRound = 0;
      player.sumToWinIfPlayerGoesAllIn = 0;
      player.isAllIn = false;
    })

    const playersWhoCanContinuePlaying = playerList.filter(player => player.moneyLeft >= this.blinds.bigBlind);
    if (playersWhoCanContinuePlaying.length === 1) {
      const { name, moneyLeft } = playersWhoCanContinuePlaying[0];
      return alert(`${name} won with ${moneyLeft}€! Refresh to restart.`);
    }

    this.players.playerList = playersWhoCanContinuePlaying;
    this.isEveryoneAllIn = false;
    this.players.passBlinds();

    this.deck = new Deck();
    this.cardsOnTheDesk = [];
    this.gameLog = [];

    this.isGameActive = true;
    this.winners = [];

    this.maxSumOfIndividualBets = 0;
    this.sumOfBets = 0;

    this.startRound_BlindCall();
  }

  startNextRound() {
    /* cleanup before the round */
    if (!this.isEveryoneAllIn) {
      this.players.playersStillInThisRound.forEach(player => {
        player.canCheck = true;
        player.canSupportBet = true;
        player.canRaise = true;
        player.hasReacted = false;
        player.isAllIn = false;
        player.allInSum = 0;
      });
    }

    // this.players.activePlayer = this.players.getNextActivePlayer();
    const activeRound = this.activeRound;
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
        this.isGameActive = false;
        return this.endGame();
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

    /* big and small blinds */
    const { smallBlind, bigBlind } = this.blinds;
    const { smallBlindPlayer, bigBlindPlayer } = this.players;
    bigBlindPlayer.placeBet({ betAmount: bigBlind, store: this, betAction: BET_ACTION.BIG_BLIND });
    smallBlindPlayer.placeBet({ betAmount: smallBlind, store: this, betAction: BET_ACTION.SMALL_BLIND });

    /* give cards to players */
    const playerList = this.players.playerList;
    for (const player of playerList) {
      for (let i = 0; i <= 1; i++) {
        const randomCard = this.deck.pickRandomCard();
        player.pickCard(randomCard);
      }
    }

    /* players decide whether to continue playing with these cards or fold (starting from the small blind player) */
    this.players.updatePlayerAbilities(this);
    this.players.activePlayer = this.players.smallBlindPlayer;
  }

  startRound_Flop(): any {
    this.activeRound = POKER_ROUNDS.FLOP;
    this.logGameEvent("< FLOP >");
    //todo: make sure it is the right time to update data...
    this.players.updatePlayerAbilities(this);

    for (let i = 1; i <= 3; i++) {
      const randomCard = this.deck.pickRandomCard();
      this.cardsOnTheDesk.push(randomCard);
    }

    /* if everyone is allIn, just go to the next round */
    if (this.players.playersStillInThisRound.every(player => player.isAllIn)) {
      return this.startNextRound();
    }


    const nextActivePlayer = this.players.getNextActivePlayer();
    this.players.activePlayer = nextActivePlayer;
  }

  startRound_Turn(): any {
    this.activeRound = POKER_ROUNDS.TURN;
    this.logGameEvent("< TURN >");
    this.players.updatePlayerAbilities(this);

    const randomCard = this.deck.pickRandomCard();
    this.cardsOnTheDesk.push(randomCard);

    /* if everyone is allIn, just go to the next round */
    if (this.players.playersStillInThisRound.every(player => player.isAllIn)) {
      return this.startNextRound();
    }


    const nextActivePlayer = this.players.getNextActivePlayer();
    this.players.activePlayer = nextActivePlayer;
  }

  startRound_River(): any {
    this.activeRound = POKER_ROUNDS.RIVER;
    this.logGameEvent("< RIVER >");
    this.players.updatePlayerAbilities(this);

    const randomCard = this.deck.pickRandomCard();
    this.cardsOnTheDesk.push(randomCard);

    /* if everyone is allIn, just go to the next round */
    if (this.players.playersStillInThisRound.every(player => player.isAllIn)) {
      return this.startNextRound();
    }

    const nextActivePlayer = this.players.getNextActivePlayer();
    this.players.activePlayer = nextActivePlayer;
  }
  endGame() {
    this.showGameResults();

    // setTimeout(() => {
    //   this.continueGame();
    // }, 3000)
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
  private showGameResults() {
    this.players.getWinners({ sumOfBets: this.sumOfBets, store: this });


    console.warn(this.winners);

  }
}

const store = new Store();
export default store;