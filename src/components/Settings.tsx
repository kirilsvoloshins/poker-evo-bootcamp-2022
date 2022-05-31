import React, { useCallback, useState, ChangeEvent } from 'react';
import "../styles/App.css";
import { GameMenuProps, ComponentNames } from '../types';
import PlayerCountCircle from "./PlayerCountCircle";

import store from "../Store";
import { observer } from 'mobx-react';
import NavButton from "./NavButton";

const Settings: React.FC<GameMenuProps> = observer(() => {
  const [areSettingsValid, setAreSettingsValid] = useState(true);
  const [settingsInfo, setSettingsInfo] = useState("good to go!");
  const [startingMoney, setStartingMoney] = useState(String(store.initialDeposit));

  const updateStartingMoney = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const sNewValue = target.value;
    setStartingMoney(sNewValue);
    const newValue = parseInt(sNewValue);
    const isNewMoneySettingValid = newValue >= store.minimumBet * 2;
    setAreSettingsValid(isNewMoneySettingValid);
    setSettingsInfo(isNewMoneySettingValid ? "good to go!" : "place a bigger starting money!");
    if (isNewMoneySettingValid) {
      store.setInitialDeposit(newValue);
    }
  }, []);

  return (
    <div className="settingsPage">
      <div className="settingsDiv">
        <div className="settingsTable">
          <div>AI player count:</div>
          <div className='playerCountSelector'>
            <PlayerCountCircle amountOfPlayersToSet={1} />
            <PlayerCountCircle amountOfPlayersToSet={2} />
            <PlayerCountCircle amountOfPlayersToSet={3} />
          </div>
          <div>Starting money:</div>
          <div>
            <input type="number" id="startingMoneyInput" value={startingMoney} onChange={updateStartingMoney} /> €
          </div>
        </div>
        {settingsInfo}
        {areSettingsValid ? <NavButton btnText="play the game!" screenToOpen="Game" /> : ""}

      </div>
    </div>
  )
});
export default Settings