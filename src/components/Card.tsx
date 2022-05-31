import React, { useCallback } from 'react';
import "../styles/App.css";
import { CardNameSymbol, SuitSymbol } from '../types';
import { observer } from 'mobx-react';

interface CardProps {
  cardValue: CardNameSymbol,
  cardSuit: SuitSymbol
}

const Card: React.FC<CardProps> = observer(({ cardValue, cardSuit }) => {
  const redSuits: SuitSymbol[] = ["♦", "♥"];
  const isRed = redSuits.includes(cardSuit);

  return (
    <div className={`card playerCard1 ${isRed ? "red" : "black"}`}>
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