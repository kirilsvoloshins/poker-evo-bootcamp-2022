import React, { useCallback } from 'react';
import "../styles/App.css";
import { GameMenuProps } from '../types';
import { observer } from 'mobx-react';
import NavButton from "./NavButton";
import store from "../Store";


const GameMenu: React.FC<GameMenuProps> = observer(() => {
  const startTheGame = useCallback(() => {
    store.startInitialGame();
  }, []);

  return (
    <div className="menuDiv">
      <div className="gameName">Basically Holdem</div>
      <NavButton btnText="play some poker!" screenToOpen="Game" onPress={startTheGame} />
      <NavButton btnText="settings" screenToOpen="Settings" />
      <NavButton btnText="credits" screenToOpen="Credits" />
    </div>
  )
});
export default GameMenu