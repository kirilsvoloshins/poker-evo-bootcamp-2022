import React, { useEffect, useState, useCallback, ChangeEvent } from 'react';
import { observer } from 'mobx-react';
import store from "../Store";
import "../styles/App.css"
import { Card } from '../classes/Card';
import CardComp from '../components/Card';



interface GameResultOfPlayerProps {
  cards: Card[],
  combinationName: string,
  winAmount: number,
  playerName: string;
}

const GameResults: React.FC<GameResultOfPlayerProps> = observer(({ playerName, cards, combinationName, winAmount }) => {
  return (
    <div className="gameResultOfPlayerWrapper">
      <div>{playerName}: {winAmount}€</div>
      <div className="combinationCards">
        {cards.map((card, i) => (
          <CardComp key={i} cardValue={card.cardNameSymbol} cardSuit={card.suitSymbol} />
        ))}
      </div>
      <div className="combinationName">
        {combinationName}
      </div>
    </div>
  )
});
export default GameResults;