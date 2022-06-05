import originalStore from "../Store";
type StoreType = typeof originalStore;
import { Card } from "../classes/Card";
import { Players } from "../classes/Players";
import { COMBINATIONS } from "../consts";

describe("players", () => {
  describe("player initialisation", () => {
    it("should create a player", () => {
      const initialMoney = 100;
      const players = new Players({ amountOfHumanPlayers: 1, initialMoney });
      expect(players.playerList).toEqual([
        {
          ...players.playerList[0],
          name: "player-1",
          id: 0,
          moneyLeft: initialMoney,
          cards: [],
        }]);
    });
  });




  describe("combinations", () => {
    it("2 players have the same pair - one player with highest card wins", () => {
      const store = {
        cardsOnTheDesk: [
          new Card({ suit: "spades", cardName: "jack" }),
          new Card({ suit: "clubs", cardName: "eight" }),
          new Card({ suit: "clubs", cardName: "ace" }),
          new Card({ suit: "hearts", cardName: "seven" }),
          new Card({ suit: "hearts", cardName: "nine" }),
        ],
        winners: [],
      } as StoreType;
      const players = new Players({ amountOfHumanPlayers: 3, initialMoney: 1000 });
      // player-1
      players.playerList[0].cards = [
        new Card({ suit: "hearts", cardName: "eight" }),
        new Card({ suit: "spades", cardName: "six" })
      ];
      // player-2
      players.playerList[1].cards = [
        new Card({ suit: "spades", cardName: "eight" }),
        new Card({ suit: "hearts", cardName: "queen" })
      ];
      // player-3
      players.playerList[2].cards = [
        new Card({ suit: "diamonds", cardName: "six" }),
        new Card({ suit: "clubs", cardName: "six" })
      ];

      const sumOfBets = 300;
      players.getWinners({ sumOfBets, store });
      const { winners } = store;
      console.log(winners[0]);
      expect(winners).toHaveLength(1);
      expect(winners).toEqual([
        {
          ...winners[0],
          playerName: "player-2",
          combinationName: COMBINATIONS.PAIR,
          winAmount: sumOfBets
        }
      ]);
    });
    it("2 players have the same pair - both players win", () => {
      const store = {
        cardsOnTheDesk: [
          new Card({ suit: "spades", cardName: "jack" }),
          new Card({ suit: "clubs", cardName: "eight" }),
          new Card({ suit: "clubs", cardName: "ace" }),
          new Card({ suit: "hearts", cardName: "king" }),
          new Card({ suit: "hearts", cardName: "nine" }),
        ],
        winners: [],
      } as StoreType;
      const players = new Players({ amountOfHumanPlayers: 3, initialMoney: 1000 });
      // player-1
      players.playerList[0].cards = [
        new Card({ suit: "hearts", cardName: "seven" }),
        new Card({ suit: "spades", cardName: "seven" })
      ];
      // player-2
      players.playerList[1].cards = [
        new Card({ suit: "spades", cardName: "six" }),
        new Card({ suit: "hearts", cardName: "queen" })
      ];
      // player-3
      players.playerList[2].cards = [
        new Card({ suit: "diamonds", cardName: "seven" }),
        new Card({ suit: "clubs", cardName: "seven" })
      ];

      const sumOfBets = 300;
      players.getWinners({ sumOfBets, store });
      const player = players.playerList[0];
      // console.log(player.bestCombinationName);
      // console.log(player.cardsAtCombination["PAIR"].highestCardInCombination);
      // console.log(player.cardsAtCombination["PAIR"].highestCardOutsideCombination.cardCost);
      const { winners } = store;
      expect(winners).toHaveLength(2);
      expect(winners).toEqual([
        {
          ...winners[0],
          playerName: "player-1",
          combinationName: COMBINATIONS.PAIR,
          winAmount: sumOfBets / 2
        },
        {
          ...winners[1],
          playerName: "player-3",
          combinationName: COMBINATIONS.PAIR,
          winAmount: sumOfBets / 2
        }
      ]);
    });


    it("one straight - one player wins", () => {
      const store = {
        cardsOnTheDesk: [
          new Card({ suit: "spades", cardName: "jack" }),
          new Card({ suit: "clubs", cardName: "eight" }),
          new Card({ suit: "clubs", cardName: "ace" }),
          new Card({ suit: "hearts", cardName: "seven" }),
          new Card({ suit: "hearts", cardName: "nine" }),
        ],
        winners: [],
      } as StoreType;
      const players = new Players({ amountOfHumanPlayers: 3, initialMoney: 1000 });
      // player-1
      players.playerList[0].cards = [
        new Card({ suit: "hearts", cardName: "ace" }),
        new Card({ suit: "spades", cardName: "six" })
      ];
      // player-2
      players.playerList[1].cards = [
        new Card({ suit: "hearts", cardName: "ten" }),
        new Card({ suit: "hearts", cardName: "queen" })
      ];
      // player-3
      players.playerList[2].cards = [
        new Card({ suit: "diamonds", cardName: "six" }),
        new Card({ suit: "clubs", cardName: "six" })
      ];

      const sumOfBets = 300;
      players.getWinners({ sumOfBets, store });
      const { winners } = store;
      expect(winners).toHaveLength(1);
      expect(winners).toEqual([
        {
          ...winners[0],
          playerName: "player-2",
          combinationName: COMBINATIONS.STRAIGHT,
          winAmount: sumOfBets
        }
      ]);
    });

    // it("if five card combination is on the table, everyone is a winner", () => {
    //   const store = {
    //     cardsOnTheDesk: [
    //       new Card({ suit: "spades", cardName: "queen" }),
    //       new Card({ suit: "hearts", cardName: "ten" }),
    //       new Card({ suit: "hearts", cardName: "ace" }),
    //       new Card({ suit: "diamonds", cardName: "jack" }),
    //       new Card({ suit: "diamonds", cardName: "king" }),
    //     ],
    //     winners: [],
    //   } as StoreType;
    //   const players = new Players({ amountOfHumanPlayers: 3, initialMoney: 1000 });
    //   players.playerList[0].cards = [
    //     new Card({ suit: "hearts", cardName: "nine" }),
    //     new Card({ suit: "spades", cardName: "king" })
    //   ];
    //   players.playerList[1].cards = [
    //     new Card({ suit: "hearts", cardName: "king" }),
    //     new Card({ suit: "hearts", cardName: "jack" })
    //   ];
    //   players.playerList[2].cards = [
    //     new Card({ suit: "spades", cardName: "six" }),
    //     new Card({ suit: "hearts", cardName: "eight" })
    //   ];

    //   const sumOfBets = 300, winOfEveryone = sumOfBets / 3;
    //   players.getWinners({ sumOfBets, store });
    //   const { winners } = store;
    //   expect(winners).toHaveLength(3);
    //   expect(winners).toEqual([
    //     {
    //       ...winners[0],
    //       winAmount: winOfEveryone
    //     },
    //     {
    //       ...winners[1],
    //       winAmount: winOfEveryone
    //     },
    //     {
    //       ...winners[2],
    //       winAmount: winOfEveryone
    //     },
    //   ]);
    // });
  });

});