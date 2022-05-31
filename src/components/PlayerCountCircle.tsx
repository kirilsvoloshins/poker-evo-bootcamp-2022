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
  // const setAmountOfAIPlayers = useCallback(() => {
  //   store.setAmountOfAIPlayers(amountOfPlayersToSet);
  //   // console.warn({ store });
  // }, []);

  return (
    // <div className={`playerCountCircle noSelect ${store.amountOfAiPlayers === amountOfPlayersToSet ? "selectedPlayerCount" : ""}`} onClick={setAmountOfAIPlayers}>{amountOfPlayersToSet}</div>
    <></>
  )
});
export default PlayerCountCircle;