import React from 'react';
import { observer } from 'mobx-react';
import "../styles/App.css"
import CardComp from '../components/Card';
import { COMBINATION_NAMES_HUMAN } from '../consts';
import { GameResultOfPlayerProps } from '../types';

const GameResults: React.FC<GameResultOfPlayerProps> = observer(({ player }) => {
  const { playerName, winAmount, cards, combinationName } = player;

  return (
    <div className="gameResultOfPlayerWrapper">
      <div>{playerName}: {winAmount}€</div>
      <div className="combinationCards">
        {cards.map((card, i) => {
          return (
            <CardComp key={i} cardValue={card.cardNameSymbol} cardSuit={card.suitSymbol} />
          )
        })}
      </div>
      <div className="combinationName">
        {COMBINATION_NAMES_HUMAN[combinationName]}
      </div>
    </div>
  )
});
export default GameResults;