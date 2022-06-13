import React, { useEffect } from "react";
import { GameScreenProps } from "../types";
import { observer } from "mobx-react";
import store from "../Store";
import "../styles/App.css";
import PlayerInfo from "./PlayerInfo";
import GameLog from "./GameLog";
import GameTable from "./GameTable";
import BetControls from "./BetControls";
import GameResults from "./GameResults";
// import styles from "../styles/App";

const GameScreen: React.FC<GameScreenProps> = observer(() => {
  useEffect(() => {
    store.startInitialGame();
  }, []);

  return (
    <>
      {/* <GameResults /> */}

      <div className="gameDiv">
        <div></div>
        <div className="card-container-topmid">
          <PlayerInfo playerId={2} />
        </div>
        <div className="gameLogContainer">
          <GameLog />
        </div>

        <div className="card-container-midleft">
          <PlayerInfo playerId={1} />
        </div>
        <div>
          <GameTable />
        </div>
        <div className="card-container-midright">
          <PlayerInfo playerId={3} />
        </div>

        <div></div>
        <div className="card-container-botmid">
          <PlayerInfo playerId={0} />
        </div>
        <div className="flex-in-col">
          <BetControls />
        </div>



      </div>
    </>
  )
});
export default GameScreen;