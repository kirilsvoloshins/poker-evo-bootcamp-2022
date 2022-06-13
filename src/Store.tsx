import { makeAutoObservable } from "mobx";
import { ComponentNames } from "./types";
import { formatGameLog, getDateForGameEvent } from "./utils";
import { POKER_ROUNDS, BET_ACTION, COMBINATION_NAMES_HUMAN, COMBINATIONS } from "./consts";
import { Card } from "./classes/Card";
import { Players } from "./classes/Players";
import { Deck } from "./classes/Deck";
import { Player } from "./classes/Player";
import { StoreType } from "./types";

class Store implements StoreType {
  currentPage = "Game" as ComponentNames; // the page to show
  amountOfHumanPlayers = 3; // value for game init
  minimumBet = 10; // players can not bet less that this
  initialDeposit = 100; // value for game init

  players = {} as Players;
  isEveryoneAllIn = true;
  deck = {} as Deck; // array of cards to pick from
  cardsOnTheDesk = [] as Card[];
  gameLog = [] as string[];

  isGameActive = false; // game state, set false on end and true on start
  // gameState: GameState = ""; // ???
  activeRound: POKER_ROUNDS;
  winners: Player[];
  gameInfo: string[];

  maxSumOfIndividualBets = 0; // maxmimum amount of bets of one person in this round
  sumOfBets = 0; // the sum to split between winners of the round

  constructor() {
    makeAutoObservable(this);
  }

  performInititalGameReset() {
    this.players = new Players({
      amountOfHumanPlayers: this.amountOfHumanPlayers,
      initialMoney: this.initialDeposit
    });
    const { playerList } = this.players;
    playerList.forEach(player => {
      player.canGoAllIn = playerList.filter(ePlayer => ePlayer !== player).every(ePlayer => ePlayer.moneyLeft >= player.moneyLeft);
    })
    this.isEveryoneAllIn = false;

    this.deck = new Deck();
    this.cardsOnTheDesk = [];
    this.gameLog = [];

    this.isGameActive = true;
    this.winners = [];
    this.gameInfo = [];

    this.maxSumOfIndividualBets = 0;
    this.sumOfBets = 0;

    this.players.passBlinds();
  }

  performContinuingGameReset() {
    const { playerList } = this.players;
    playerList.forEach(player => {
      player.cards = [];
      player.bestCombinationName = COMBINATIONS.HIGH_CARD;
      player.bestCombinationCards = [];
      player.winAmount = 0;

      (Object.keys(player.cardsAtCombination) as COMBINATIONS[]).forEach(combination => {
        const comboInfo = player.cardsAtCombination[combination];
        comboInfo.combinationCards = [];
        comboInfo.highestCardInCombination = {} as Card;
        comboInfo.highestCardOutsideCombination = {} as Card;
      });

      player.sumOfPersonalBetsInThisRound = 0;
      player.sumToWinIfPlayerGoesAllIn = 0;
      player.betToPayToContinue = 0;
      player.sumToWinIfPlayerGoesAllIn = 0;
      player.allInSum = 0;

      player.hasReacted = false;
      player.isAllIn = false;
      player.hasFolded = false;
      player.canCheck = false;
      player.canSupportBet = false;
      player.canRaise = false;
      player.canGoAllIn = playerList.filter(ePlayer => ePlayer !== player).every(ePlayer => ePlayer.moneyLeft >= player.moneyLeft);
    });

    /* GAME MUST END HERE */
    const playersWhoCanContinuePlaying = playerList.filter(player => player.moneyLeft >= this.blinds.bigBlind);

    this.players.playerList = playersWhoCanContinuePlaying;
    this.isEveryoneAllIn = false;

    this.deck = new Deck();
    this.cardsOnTheDesk = [];
    // this.gameLog = [];

    this.isGameActive = true;
    this.winners = [];
    this.gameInfo = [];

    this.maxSumOfIndividualBets = 0;
    this.sumOfBets = 0;

    this.players.passBlinds();
  }



  // very first game
  startInitialGame() {
    this.performInititalGameReset();
    this.logGameEvent("<<< GAME START >>>");
    this.startRound_BlindCall();
  }

  // game being continued
  continueGame() {
    this.performContinuingGameReset();
    this.logGameEvent("<<< GAME START >>>");
    this.startRound_BlindCall();
  }

  startNextRound(): any {
    /* cleanup before the round */
    if (!this.isEveryoneAllIn) {
      this.players.playersStillInThisRound.forEach(player => {
        player.canCheck = true;
        player.canSupportBet = true;
        player.canRaise = true;
        player.hasReacted = false;
        // player.isAllIn = false;
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

  startRound_Flop() {
    this.activeRound = POKER_ROUNDS.FLOP;
    this.logGameEvent("< FLOP >");
    this.players.updatePlayerAbilities(this);

    for (let i = 1; i <= 3; i++) {
      const randomCard = this.deck.pickRandomCard();
      this.cardsOnTheDesk.push(randomCard);
    }

    /* if everyone is allIn, just go to the next round */
    if (this.players.playersStillInThisRound.filter(player => !player.isAllIn).length <= 1) {
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
    if (this.players.playersStillInThisRound.filter(player => !player.isAllIn).length <= 1) {
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
    if (this.players.playersStillInThisRound.filter(player => !player.isAllIn).length <= 1) {
      return this.startNextRound();
    }

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

  private payWinners() {
    this.winners.forEach(winner => {
      winner.moneyLeft += winner.winAmount;
      winner.winAmount = 0;
    });
  }

  get allPlayerCards() {
    return this.players.playerList.map(player => player.cards).flat();
  }

  get allCards() {
    const cardsOnTheDesk = this.cardsOnTheDesk;
    return [...this.allPlayerCards, ...cardsOnTheDesk];
  }

  private hideAllPlayerCards() {
    this.allPlayerCards.forEach(card => card.hide());
  }

  private fadeAllCards() {
    this.allCards.forEach(card => card.fade());
  }

  private unfadeAllCards() {
    this.allCards.forEach(card => card.unfade());
  }

  private logWinners() {
    this.winners.forEach(winner => {
      const { name, winAmount, bestCombinationName } = winner;
      const message = `${name} wins ${winAmount}€ [${COMBINATION_NAMES_HUMAN[bestCombinationName]}]`;
      this.logGameEvent(message);
      this.gameInfo.push(message);
    });
  }

  private showGameResults() {
    this.players.showAllCards();
    this.players.getWinners({ sumOfBets: this.sumOfBets, store: this });
    console.log(this.winners);

    this.winners = this.winners.filter(player => player.winAmount);
    this.logWinners();
    const { winners } = this;

    for (const winner of winners) {
      this.fadeAllCards();
      winner.bestCombinationCards.forEach(card => card.isFaded = false);
      break;
    }
  }

  get mustGameBeRestarted() {
    const playersWhoCanContinuePlaying = this.players.playerList.filter(player => player.moneyLeft >= this.blinds.bigBlind);
    return playersWhoCanContinuePlaying.length === 1;
  }

  endGame() {
    this.showGameResults();
    setTimeout(() => {
      this.unfadeAllCards();
      this.payWinners();
      console.warn(this.winners);

      if (this.mustGameBeRestarted) {
        console.log('game must be restarted!');
        this.gameInfo.push(`Game over. Automatic restart incoming.`);
        return setTimeout(() => {
          return this.startInitialGame();
        }, 2000);
      }

      console.warn("continuing!");
      this.continueGame();
    }, 3000)
  }
}

const store = new Store();
export default store;