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

const GameScreen: React.FC<GameScreenProps> = observer(() => {
  useEffect(() => {
    store.startInitialGame();
  }, []);

  return (
    <>
      {/* <GameResults /> */}

      <div className="gameDiv">
        <div></div>
        <div style={{ margin: "auto", marginBottom: 0, zIndex: 9999, }}>
          <PlayerInfo playerId={2} />
        </div>
        <div className="gameLogContainer">
          <GameLog />
        </div>

        <div style={{ margin: "auto", marginRight: 0 }}>
          <PlayerInfo playerId={1} />
        </div>
        <div>
          <GameTable />
        </div>
        <div style={{ margin: "auto", marginLeft: 0 }}>
          <PlayerInfo playerId={3} />
        </div>

        <div></div>
        <div style={{ margin: "auto", marginTop: 0 }}>
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