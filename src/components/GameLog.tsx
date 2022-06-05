import React from 'react';
import { observer } from 'mobx-react';
import store from "../Store";
import "../styles/App.css"

const GameLog: React.FC = observer(() => {
  return (
    <div className='gameLogDiv'>
      {store.formattedGameLog}
    </div>
  )
});
export default GameLog;