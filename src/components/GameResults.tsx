import React, { useEffect, useState, useCallback, ChangeEvent } from 'react';
import { observer } from 'mobx-react';
import store from "../Store";
import "../styles/App.css"
import GameResultOfPlayer from "./GameResultOfPlayer";

const GameResults: React.FC = observer(() => {
  return (
    <div className="gameResultWrapper">
      Winner[s]
      {store.winners?.map(winner => (<GameResultOfPlayer player={winner} />))}
      <div className="gameResultButtonsDiv">
        <div>restart</div>
        <div>continue</div>
      </div>
    </div>
  )
});
export default GameResults;