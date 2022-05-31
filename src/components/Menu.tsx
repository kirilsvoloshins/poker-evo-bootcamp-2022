import React, { useCallback } from 'react';
import "../styles/App.css";
import { GameMenuProps, ComponentNames } from '../types';


import { observer } from 'mobx-react';
import NavButton from "./NavButton";

const GameMenu: React.FC<GameMenuProps> = observer(() => {
  const startTheGame = useCallback(() => {
    // console.log('start the game!');
  }, []);

  return (
    <div className="menuDiv">
      <NavButton btnText="play the game!" screenToOpen="Game" onPress={startTheGame} />
      <NavButton btnText="settings" screenToOpen="Settings" />
      <NavButton btnText="credits" screenToOpen="Credits" />

    </div>
  )
});
export default GameMenu