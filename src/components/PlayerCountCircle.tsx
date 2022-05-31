import React, { useCallback, useState } from 'react';
import "../styles/App.css";
import { GameMenuProps, ComponentNames } from '../types';


import store from "../Store";
import { observer } from 'mobx-react';
import NavButton from "./NavButton";

interface PlayerCountCircleProps {
  amountOfPlayersToSet: number
};

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