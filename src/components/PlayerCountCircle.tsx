import React, { useCallback } from 'react';
import "../styles/App.css";
import { PlayerCountCircleProps } from '../types';
import store from "../Store";
import { observer } from 'mobx-react';

const PlayerCountCircle: React.FC<PlayerCountCircleProps> = observer(({ amountOfPlayersToSet }) => {
  const setAmountOfHumanPlayers = useCallback(() => {
    store.setAmountOfHumanPlayers(amountOfPlayersToSet);
  }, []);

  return (
    <>
      <div className={`playerCountCircle noSelect ${store.amountOfHumanPlayers === amountOfPlayersToSet ? "selectedPlayerCount" : ""}`} onClick={setAmountOfHumanPlayers}>{amountOfPlayersToSet}</div>
    </>
  )
});
export default PlayerCountCircle;