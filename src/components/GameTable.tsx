import React from 'react';
import "../styles/App.css";
import Card from "./Card";
import { suitSymbols, cardNameSymbols } from "../consts";
import store from "../Store";
import { observer } from 'mobx-react';

const GameTable: React.FC = observer(() => {
  return (
    <div className="gameTable">
      <div className="tableCardsContainer">
        {store.cardsOnTheDesk?.map(({ suit, cardName, isFaded, isHidden }) => {
          return <Card key={`${suit}_${cardName}`}
            cardValue={cardNameSymbols[cardName]}
            cardSuit={suitSymbols[suit]}
            isFaded={isFaded}
            isHidden={isHidden}
          />
        })}
        <br />
      </div>
      <div className='tableInfo'>
        {store?.sumOfBets} €
      </div>
      <div className='gameInfo'>
        <ul>
          {store?.gameInfo?.map((message) => (<li>{message}</li>))}
          {/* {store?.winners?.map(({ name, winAmount, bestCombinationName }) => {
            return (<li>{name} wins {winAmount}€ [{bestCombinationName}]</li>)
          })} */}
        </ul>
      </div>
    </div>
  )
});
export default GameTable;