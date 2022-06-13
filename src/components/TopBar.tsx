import { observer } from 'mobx-react';
import React from 'react'
import store from "../Store";
import "../styles/App.css"

const TopBar: React.FC = observer(() => {
  const currentPage = store.getCurrentPage;
  const isGamePageOpened = currentPage === "Game";
  return (
    // <div id="topBar">{store.getCurrentPage}</div>
    <div id="topBar">{isGamePageOpened && <div className="gameName">Basically Holdem</div>}</div>
  )
});
export default TopBar;
