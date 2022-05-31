import { observer } from 'mobx-react';
import React from 'react'
import store from "../Store";
import "../styles/App.css"

const TopBar: React.FC = observer(() => {
  return (
    <div id="topBar">{store.getCurrentPage}</div>
  )
});
export default TopBar;
