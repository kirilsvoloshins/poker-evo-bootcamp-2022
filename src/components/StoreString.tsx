import { observer } from 'mobx-react';
import React from 'react'
import store from "../Store";
import "../styles/App.css"

const StoreString: React.FC = observer(() => {
  return (
    <div id="storeString">{JSON.stringify(store)}</div>
  )
});
export default StoreString;
