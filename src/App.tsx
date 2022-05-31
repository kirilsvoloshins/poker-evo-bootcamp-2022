import React, { useCallback, useState } from 'react';
import Game from "./components/Game";
import Menu from "./components/Menu";
import Credits from "./components/Credits";
import Settings from "./components/Settings";
import Switch from "./components/Switch";
import NavButton from "./components/NavButton";
import store from "./Store";
import { observer } from 'mobx-react';
import StoreString from "./components/StoreString";
import TopBar from "./components/TopBar";
import "./styles/App.css";


export const App: React.FC = observer(() => {
  return (
    <div className="bg flex-in-col">
      <TopBar />
      {store.getCurrentPage !== "Menu" && <NavButton btnText="<- back to menu" screenToOpen="Menu" isBackButton={true} />}
      <Switch active={store.getCurrentPage} >
        <Menu name="Menu" />
        <Game name="Game" />
        <Credits name="Credits" />
        <Settings name="Settings" />
      </Switch>
      {/* <StoreString /> */}
    </div>
  )
});