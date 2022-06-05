import store from "../Store";
import { Card } from "../classes/Card";
// import Player from "../classes/Player";
import { Players } from "../classes/Players";

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
    it("should create a player", () => {
      const store = {
        winners: [],
      };
      const players = new Players({ amountOfHumanPlayers: 3, initialMoney: 1000 });


      expect(players.playerList).toEqual([
      ]);
    });
  });

});