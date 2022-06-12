import React from 'react';
import "../styles/App.css";
import { CardProps, SuitSymbol } from '../types';
import { observer } from 'mobx-react';

const Card: React.FC<CardProps> = observer(({ cardValue, cardSuit, isFaded, isHidden }) => {
  const redSuits: SuitSymbol[] = ["♦", "♥"];
  const isRed = redSuits.includes(cardSuit);
  const shownCardClassNames = `card playerCard1 ${isRed ? "red" : "black"} ${isFaded ? "fadedCard" : ""}`;
  const hiddenCardClassNames = `card playerCard1 cardOutside`;

  if (isHidden) {
    return <div className={hiddenCardClassNames}></div>
  }
  // <div className={cardClassNames} >
  return (
    <div className={shownCardClassNames} >
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

