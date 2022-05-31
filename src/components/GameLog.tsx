import React, { useEffect, useState, useCallback, ChangeEvent } from 'react';
import { GameScreenProps, GameEvent } from '../types';
import { observer } from 'mobx-react';
import store from "../Store";
import "../styles/App.css"

const GameLog: React.FC = observer(() => {
  // const [gameLog, setGameLog] = useState(store.formattedGameLog);
  // useEffect(() => {
  //   setGameLog(store.formattedGameLog);
  // }, [store.formattedGameLog]);

  return (
    <div className='gameLogDiv'>
      {store.formattedGameLog}
      {/* {gameLog} */}
    </div>
  )
});
export default GameLog;