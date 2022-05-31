import React, { useCallback } from 'react';
import "../styles/App.css";
import { GameMenuProps, ComponentNames } from '../types';
import Card from "./Card";
import { suitSymbols, cardNameSymbols } from "../utils";
import { CardNameSymbol, SuitSymbol } from '../types';
import store from "../Store";
import { observer } from 'mobx-react';

const GameTable: React.FC = observer(() => {

  return (
    <div className="gameTable">
      <div className="tableCardsContainer">

        {store.cardsOnTheDesk?.map(({ suit, cardName }) => {
          return <Card key={`${suit}_${cardName}`}
            cardValue={cardNameSymbols[cardName] as CardNameSymbol}
            cardSuit={suitSymbols[suit] as SuitSymbol}
          />
        })}
        <br />
      </div>
      <div className='tableSumOfBets'>
        {store?.sumOfBets} €
      </div>
    </div>
  )
});
export default GameTable;