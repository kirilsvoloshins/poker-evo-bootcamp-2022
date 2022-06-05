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
    describe("high card", () => {
      it("player with high card wins", () => {
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
        const players = new Players({ amountOfHumanPlayers: 2, initialMoney: 1000 });
        // player-1
        const player1 = players.playerList[0];
        player1.cards = [
          new Card({ suit: "hearts", cardName: "six" }),
          new Card({ suit: "spades", cardName: "queen" })
        ];
        // player-2
        const player2 = players.playerList[1];
        player2.cards = [
          new Card({ suit: "spades", cardName: "six" }),
          new Card({ suit: "hearts", cardName: "king" })
        ];

        const sumOfBets = 300;
        players.getWinners({ sumOfBets, store });
        const { winners } = store;
        expect(winners).toHaveLength(1);
        expect(winners).toEqual([
          {
            ...winners[0],
            playerName: "player-2",
            combinationName: COMBINATIONS.HIGH_CARD,
            winAmount: sumOfBets
          }
        ]);
      });
    });

    describe("pair", () => {
      it("2 players have the different pair - one player with highest card pair wins", () => {
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
        const player1 = players.playerList[0];
        player1.cards = [
          new Card({ suit: "hearts", cardName: "jack" }),
          new Card({ suit: "spades", cardName: "six" })
        ];
        // player-2
        const player2 = players.playerList[1];
        player2.cards = [
          new Card({ suit: "spades", cardName: "ace" }),
          new Card({ suit: "hearts", cardName: "six" })
        ];

        const sumOfBets = 300;
        players.getWinners({ sumOfBets, store });
        const { winners } = store;
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

      it("2 players have the different pair - two players win, because the one with highest card pair is all in", () => {
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
        const player1 = players.playerList[0];
        player1.cards = [
          new Card({ suit: "hearts", cardName: "ace" }),
          new Card({ suit: "spades", cardName: "six" })
        ];
        player1.isAllIn = true;
        const sumToWinIfPlayerGoesAllIn_1 = 100;
        player1.sumToWinIfPlayerGoesAllIn = sumToWinIfPlayerGoesAllIn_1;
        // player-2
        const player2 = players.playerList[1];
        player2.cards = [
          new Card({ suit: "spades", cardName: "jack" }),
          new Card({ suit: "hearts", cardName: "six" })
        ];

        const sumOfBets = 300;
        players.getWinners({ sumOfBets, store });
        const { winners } = store;
        console.log(winners)
        expect(winners).toHaveLength(2);
        expect(winners).toEqual([
          {
            ...winners[0],
            playerName: "player-1",
            combinationName: COMBINATIONS.PAIR,
            winAmount: sumToWinIfPlayerGoesAllIn_1
          },
          {
            ...winners[1],
            playerName: "player-2",
            combinationName: COMBINATIONS.PAIR,
            winAmount: sumOfBets - sumToWinIfPlayerGoesAllIn_1
          },
        ]);
      });

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
        const player1 = players.playerList[0];
        player1.cards = [
          new Card({ suit: "hearts", cardName: "eight" }),
          new Card({ suit: "spades", cardName: "six" })
        ];
        // player-2
        const player2 = players.playerList[1];
        player2.cards = [
          new Card({ suit: "spades", cardName: "eight" }),
          new Card({ suit: "hearts", cardName: "queen" })
        ];
        // player-3
        const player3 = players.playerList[2];
        player3.cards = [
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
        const player1 = players.playerList[0];
        player1.cards = [
          new Card({ suit: "hearts", cardName: "seven" }),
          new Card({ suit: "spades", cardName: "seven" })
        ];
        // player-2
        const player2 = players.playerList[1];
        player2.cards = [
          new Card({ suit: "spades", cardName: "six" }),
          new Card({ suit: "hearts", cardName: "queen" })
        ];
        // player-3
        const player3 = players.playerList[2];
        player3.cards = [
          new Card({ suit: "diamonds", cardName: "seven" }),
          new Card({ suit: "clubs", cardName: "seven" })
        ];

        const sumOfBets = 300;
        players.getWinners({ sumOfBets, store });
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
      it("2 players have the same pair - both players win, but player-1 gets less money since he is all in", () => {
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
        const player1 = players.playerList[0];
        player1.cards = [
          new Card({ suit: "hearts", cardName: "seven" }),
          new Card({ suit: "spades", cardName: "seven" })
        ];
        player1.isAllIn = true;
        const sumToWinIfPlayerGoesAllIn_1 = 100;
        player1.sumToWinIfPlayerGoesAllIn = sumToWinIfPlayerGoesAllIn_1;

        // player-2
        const player2 = players.playerList[1];
        player2.cards = [
          new Card({ suit: "spades", cardName: "six" }),
          new Card({ suit: "hearts", cardName: "queen" })
        ];
        // player-3
        const player3 = players.playerList[2];
        player3.cards = [
          new Card({ suit: "diamonds", cardName: "seven" }),
          new Card({ suit: "clubs", cardName: "seven" })
        ];

        const sumOfBets = 300;
        players.getWinners({ sumOfBets, store });
        const { winners } = store;
        expect(winners).toHaveLength(2);
        expect(winners).toEqual([
          {
            ...winners[0],
            playerName: "player-1",
            combinationName: COMBINATIONS.PAIR,
            winAmount: sumToWinIfPlayerGoesAllIn_1
          },
          {
            ...winners[1],
            playerName: "player-3",
            combinationName: COMBINATIONS.PAIR,
            winAmount: sumOfBets - sumToWinIfPlayerGoesAllIn_1
          }
        ]);
      });
    });

    describe("two pairs", () => {
      it("2 players have two pairs - one player with highest card wins", () => {
        const store = {
          cardsOnTheDesk: [
            new Card({ suit: "spades", cardName: "eight" }),
            new Card({ suit: "clubs", cardName: "eight" }),
            new Card({ suit: "clubs", cardName: "ace" }),
            new Card({ suit: "hearts", cardName: "seven" }),
            new Card({ suit: "hearts", cardName: "nine" }),
          ],
          winners: [],
        } as StoreType;
        const players = new Players({ amountOfHumanPlayers: 3, initialMoney: 1000 });
        // player-1
        const player1 = players.playerList[0];
        player1.cards = [
          new Card({ suit: "spades", cardName: "seven" }),
          new Card({ suit: "hearts", cardName: "jack" }),
        ];
        // player-2
        const player2 = players.playerList[1];
        player2.cards = [
          new Card({ suit: "diamonds", cardName: "seven" }),
          new Card({ suit: "hearts", cardName: "queen" })
        ];
        // player-3
        const player3 = players.playerList[2];
        player3.cards = [
          new Card({ suit: "diamonds", cardName: "six" }),
          new Card({ suit: "clubs", cardName: "king" })
        ];

        const sumOfBets = 300;
        players.getWinners({ sumOfBets, store });
        const { winners } = store;
        expect(winners).toHaveLength(1);
        expect(winners).toEqual([
          {
            ...winners[0],
            playerName: "player-2",
            combinationName: COMBINATIONS.TWO_PAIRS,
            winAmount: sumOfBets
          }
        ]);
      });
      it("2 players have the same two pairs - both players win", () => {
        const store = {
          cardsOnTheDesk: [
            new Card({ suit: "spades", cardName: "eight" }),
            new Card({ suit: "clubs", cardName: "eight" }),
            new Card({ suit: "clubs", cardName: "ace" }),
            new Card({ suit: "hearts", cardName: "seven" }),
            new Card({ suit: "hearts", cardName: "nine" }),
          ],
          winners: [],
        } as StoreType;
        const players = new Players({ amountOfHumanPlayers: 3, initialMoney: 1000 });
        // player-1
        const player1 = players.playerList[0];
        player1.cards = [
          new Card({ suit: "spades", cardName: "seven" }),
          new Card({ suit: "hearts", cardName: "queen" }),
        ];
        // player-2
        const player2 = players.playerList[1];
        player2.cards = [
          new Card({ suit: "diamonds", cardName: "seven" }),
          new Card({ suit: "hearts", cardName: "queen" })
        ];
        // player-3
        const player3 = players.playerList[2];
        player3.cards = [
          new Card({ suit: "diamonds", cardName: "six" }),
          new Card({ suit: "clubs", cardName: "king" })
        ];

        const sumOfBets = 300;
        players.getWinners({ sumOfBets, store });
        const { winners } = store;
        expect(winners).toHaveLength(2);
        expect(winners).toEqual([
          {
            ...winners[0],
            playerName: "player-1",
            combinationName: COMBINATIONS.TWO_PAIRS,
            winAmount: sumOfBets / 2
          },
          {
            ...winners[1],
            playerName: "player-2",
            combinationName: COMBINATIONS.TWO_PAIRS,
            winAmount: sumOfBets / 2
          }
        ]);
      });

      it("2 players have the same two pairs - both players win, but player-1 gets less money since he is all in", () => {
        const store = {
          cardsOnTheDesk: [
            new Card({ suit: "spades", cardName: "eight" }),
            new Card({ suit: "clubs", cardName: "eight" }),
            new Card({ suit: "clubs", cardName: "ace" }),
            new Card({ suit: "hearts", cardName: "seven" }),
            new Card({ suit: "hearts", cardName: "nine" }),
          ],
          winners: [],
        } as StoreType;
        const players = new Players({ amountOfHumanPlayers: 3, initialMoney: 1000 });
        // player-1
        const player1 = players.playerList[0];
        player1.cards = [
          new Card({ suit: "spades", cardName: "seven" }),
          new Card({ suit: "hearts", cardName: "jack" }),
        ];
        player1.isAllIn = true;
        const sumToWinIfPlayerGoesAllIn_1 = 100;
        player1.sumToWinIfPlayerGoesAllIn = sumToWinIfPlayerGoesAllIn_1;
        // player-2
        const player2 = players.playerList[1];
        player2.cards = [
          new Card({ suit: "diamonds", cardName: "seven" }),
          new Card({ suit: "spades", cardName: "jack" })
        ];
        // player-3
        const player3 = players.playerList[2];
        player3.cards = [
          new Card({ suit: "diamonds", cardName: "six" }),
          new Card({ suit: "clubs", cardName: "king" })
        ];

        const sumOfBets = 300;
        players.getWinners({ sumOfBets, store });
        const { winners } = store;
        expect(winners).toHaveLength(2);
        expect(winners).toEqual([
          {
            ...winners[0],
            playerName: "player-1",
            combinationName: COMBINATIONS.TWO_PAIRS,
            winAmount: sumToWinIfPlayerGoesAllIn_1
          },
          {
            ...winners[1],
            playerName: "player-2",
            combinationName: COMBINATIONS.TWO_PAIRS,
            winAmount: sumOfBets - sumToWinIfPlayerGoesAllIn_1
          }
        ]);
      });
    });

    describe("three of kind", () => {
      it("1 player wins with three of kind", () => {
        const store = {
          cardsOnTheDesk: [
            new Card({ suit: "spades", cardName: "eight" }),
            new Card({ suit: "clubs", cardName: "eight" }),
            new Card({ suit: "clubs", cardName: "ace" }),
            new Card({ suit: "hearts", cardName: "seven" }),
            new Card({ suit: "hearts", cardName: "nine" }),
          ],
          winners: [],
        } as StoreType;
        const players = new Players({ amountOfHumanPlayers: 3, initialMoney: 1000 });
        // player-1
        const player1 = players.playerList[0];
        player1.cards = [
          new Card({ suit: "spades", cardName: "seven" }),
          new Card({ suit: "hearts", cardName: "jack" }),
        ];
        // player-2
        const player2 = players.playerList[1];
        player2.cards = [
          new Card({ suit: "diamonds", cardName: "eight" }),
          new Card({ suit: "hearts", cardName: "queen" })
        ];
        // player-3
        const player3 = players.playerList[2];
        player3.cards = [
          new Card({ suit: "diamonds", cardName: "six" }),
          new Card({ suit: "clubs", cardName: "king" })
        ];

        const sumOfBets = 300;
        players.getWinners({ sumOfBets, store });
        const { winners } = store;
        expect(winners).toHaveLength(1);
        expect(winners).toEqual([
          {
            ...winners[0],
            playerName: "player-2",
            combinationName: COMBINATIONS.THREE_OF_KIND,
            winAmount: sumOfBets
          }
        ]);
      });

      it("2 players have the same three of kind - both players win", () => {
        const store = {
          cardsOnTheDesk: [
            new Card({ suit: "spades", cardName: "eight" }),
            new Card({ suit: "clubs", cardName: "eight" }),
            new Card({ suit: "clubs", cardName: "ace" }),
            new Card({ suit: "hearts", cardName: "seven" }),
            new Card({ suit: "hearts", cardName: "nine" }),
          ],
          winners: [],
        } as StoreType;
        const players = new Players({ amountOfHumanPlayers: 3, initialMoney: 1000 });
        // player-1
        const player1 = players.playerList[0];
        player1.cards = [
          new Card({ suit: "hearts", cardName: "eight" }),
          new Card({ suit: "hearts", cardName: "queen" }),
        ];
        // player-2
        const player2 = players.playerList[1];
        player2.cards = [
          new Card({ suit: "diamonds", cardName: "eight" }),
          new Card({ suit: "hearts", cardName: "queen" })
        ];
        // player-3
        const player3 = players.playerList[2];
        player3.cards = [
          new Card({ suit: "diamonds", cardName: "six" }),
          new Card({ suit: "clubs", cardName: "king" })
        ];

        const sumOfBets = 300;
        players.getWinners({ sumOfBets, store });
        const { winners } = store;
        expect(winners).toHaveLength(2);
        expect(winners).toEqual([
          {
            ...winners[0],
            playerName: "player-1",
            combinationName: COMBINATIONS.THREE_OF_KIND,
            winAmount: sumOfBets / 2
          },
          {
            ...winners[1],
            playerName: "player-2",
            combinationName: COMBINATIONS.THREE_OF_KIND,
            winAmount: sumOfBets / 2
          }
        ]);
      });

      it("2 players have the same three of kind - player with highest card wins", () => {
        const store = {
          cardsOnTheDesk: [
            new Card({ suit: "spades", cardName: "eight" }),
            new Card({ suit: "clubs", cardName: "eight" }),
            new Card({ suit: "clubs", cardName: "ace" }),
            new Card({ suit: "hearts", cardName: "seven" }),
            new Card({ suit: "hearts", cardName: "nine" }),
          ],
          winners: [],
        } as StoreType;
        const players = new Players({ amountOfHumanPlayers: 3, initialMoney: 1000 });
        // player-1
        const player1 = players.playerList[0];
        player1.cards = [
          new Card({ suit: "hearts", cardName: "eight" }),
          new Card({ suit: "hearts", cardName: "queen" }),
        ];
        // player-2
        const player2 = players.playerList[1];
        player2.cards = [
          new Card({ suit: "diamonds", cardName: "eight" }),
          new Card({ suit: "hearts", cardName: "king" })
        ];

        const sumOfBets = 300;
        players.getWinners({ sumOfBets, store });
        const { winners } = store;
        expect(winners).toHaveLength(1);
        expect(winners).toEqual([
          {
            ...winners[0],
            playerName: "player-2",
            combinationName: COMBINATIONS.THREE_OF_KIND,
            winAmount: sumOfBets
          }
        ]);
      });

      it("2 players have different three of kinds - the one with the highest wins", () => {
        const store = {
          cardsOnTheDesk: [
            new Card({ suit: "spades", cardName: "eight" }),
            new Card({ suit: "clubs", cardName: "nine" }),
            new Card({ suit: "clubs", cardName: "ace" }),
            new Card({ suit: "hearts", cardName: "king" }),
            new Card({ suit: "hearts", cardName: "queen" }),
          ],
          winners: [],
        } as StoreType;
        const players = new Players({ amountOfHumanPlayers: 3, initialMoney: 1000 });
        // player-1
        const player1 = players.playerList[0];
        player1.cards = [
          new Card({ suit: "hearts", cardName: "eight" }),
          new Card({ suit: "diamonds", cardName: "eight" }),
        ];
        // player-2
        const player2 = players.playerList[1];
        player2.cards = [
          new Card({ suit: "diamonds", cardName: "ace" }),
          new Card({ suit: "hearts", cardName: "ace" })
        ];

        const sumOfBets = 300;
        players.getWinners({ sumOfBets, store });
        const { winners } = store;
        expect(winners).toHaveLength(1);
        expect(winners).toEqual([
          {
            ...winners[0],
            playerName: "player-2",
            combinationName: COMBINATIONS.THREE_OF_KIND,
            winAmount: sumOfBets
          },
        ]);
      });
    });


    describe("straight", () => {
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
        const player1 = players.playerList[0];
        player1.cards = [
          new Card({ suit: "hearts", cardName: "ace" }),
          new Card({ suit: "spades", cardName: "six" })
        ];
        // player-2
        const player2 = players.playerList[1];
        player2.cards = [
          new Card({ suit: "hearts", cardName: "ten" }),
          new Card({ suit: "hearts", cardName: "queen" })
        ];
        // player-3
        const player3 = players.playerList[2];
        player3.cards = [
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

      it("two straights - player with highest wins", () => {
        const store = {
          cardsOnTheDesk: [
            new Card({ suit: "hearts", cardName: "seven" }),
            new Card({ suit: "clubs", cardName: "eight" }),
            new Card({ suit: "hearts", cardName: "nine" }),
            new Card({ suit: "spades", cardName: "ten" }),
            new Card({ suit: "clubs", cardName: "ace" }),
          ],
          winners: [],
        } as StoreType;
        const players = new Players({ amountOfHumanPlayers: 3, initialMoney: 1000 });
        // player-1
        const player1 = players.playerList[0];
        player1.cards = [
          new Card({ suit: "spades", cardName: "six" }),
          new Card({ suit: "hearts", cardName: "king" }),
        ];
        // player-2
        const player2 = players.playerList[1];
        player2.cards = [
          new Card({ suit: "hearts", cardName: "jack" }),
          new Card({ suit: "hearts", cardName: "king" })
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

      it("two equal straights - both players win", () => {
        const store = {
          cardsOnTheDesk: [
            new Card({ suit: "hearts", cardName: "seven" }),
            new Card({ suit: "clubs", cardName: "eight" }),
            new Card({ suit: "hearts", cardName: "nine" }),
            new Card({ suit: "spades", cardName: "ten" }),
            new Card({ suit: "clubs", cardName: "ace" }),
          ],
          winners: [],
        } as StoreType;
        const players = new Players({ amountOfHumanPlayers: 3, initialMoney: 1000 });
        // player-1
        const player1 = players.playerList[0];
        player1.cards = [
          new Card({ suit: "spades", cardName: "six" }),
          new Card({ suit: "hearts", cardName: "king" }),
        ];
        // player-2
        const player2 = players.playerList[1];
        player2.cards = [
          new Card({ suit: "hearts", cardName: "six" }),
          new Card({ suit: "hearts", cardName: "king" })
        ];

        const sumOfBets = 300;
        players.getWinners({ sumOfBets, store });
        const { winners } = store;
        expect(winners).toHaveLength(2);

        expect(winners).toEqual([
          {
            ...winners[0],
            playerName: "player-1",
            combinationName: COMBINATIONS.STRAIGHT,
            winAmount: sumOfBets / 2
          },
          {
            ...winners[1],
            playerName: "player-2",
            combinationName: COMBINATIONS.STRAIGHT,
            winAmount: sumOfBets / 2
          }
        ]);
      });
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