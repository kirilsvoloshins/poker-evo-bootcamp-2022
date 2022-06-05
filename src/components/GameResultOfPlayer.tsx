import React, { useEffect, useState, useCallback, ChangeEvent } from 'react';
import { observer } from 'mobx-react';
import store from "../Store";
import "../styles/App.css"
import { Card } from '../classes/Card';
import CardComp from '../components/Card';
import { COMBINATIONS, COMBINATION_NAMES_HUMAN } from '../utils';
import { Winner } from '../types';



interface GameResultOfPlayerProps {
  // cards: Card[],
  // combinationName: COMBINATIONS,
  // winAmount: number,
  // playerName: string;
  player: Winner
}

const GameResults: React.FC<GameResultOfPlayerProps> = observer(({ player }) => {
  const { playerName, winAmount, cards, combinationName } = player;

  return (
    <div className="gameResultOfPlayerWrapper">
      <div>{playerName}: {winAmount}€</div>
      <div className="combinationCards">
        {cards.map((card, i) => (
          <CardComp key={i} cardValue={card.cardNameSymbol} cardSuit={card.suitSymbol} />
        ))}
      </div>
      <div className="combinationName">
        {COMBINATION_NAMES_HUMAN[combinationName]}
      </div>
    </div>
  )
});
export default GameResults;