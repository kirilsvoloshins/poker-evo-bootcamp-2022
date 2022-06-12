import React from 'react';
import "../styles/App.css";
import { CardProps, SuitSymbol } from '../types';
import { observer } from 'mobx-react';

const Card: React.FC<CardProps> = observer(({ cardValue, cardSuit, isFaded }) => {
  const redSuits: SuitSymbol[] = ["♦", "♥"];
  const isRed = redSuits.includes(cardSuit);

  return (
    <div className={`card playerCard1 ${isRed ? "red" : "black"} ${isFaded ? "fadedCard" : ""}`} id={`${cardValue}_${cardSuit}`}>
      <div className="cardValueDiv">
        {cardValue}
      </div>
      <div className="cardSuitDiv">
        {cardSuit}
      </div>
    </div>
  )
});
export default Card;

