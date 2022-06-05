import React from 'react';
import "../styles/App.css";
import Card from "./Card";
import { observer } from 'mobx-react';
import store from "../Store";
import { PlayerInfoProps } from '../types';

const PlayerInfo: React.FC<PlayerInfoProps> = observer(({ playerId }) => {
  const { playerList } = store.players;
  const hasGameBeenInitialized = typeof playerList !== "undefined";
  if (!hasGameBeenInitialized) return <></>;

  const playerAtThisSlot = playerList[playerId];
  const isTherePlayerAtThisSlot = typeof playerAtThisSlot !== "undefined";
  if (!isTherePlayerAtThisSlot) return <></>;

  const cards = playerAtThisSlot.cards;
  const card1 = cards[0], card2 = cards[1];

  return (
    <div className="playerDiv" >
      <div className={`playerInfo ${store.players.activePlayer === playerAtThisSlot ? "activePlayerInfo" : ""}`}>
        <div className="playerInfoText">
          {store.players.bigBlindPlayer === playerAtThisSlot && "big blind"}
          {store.players.smallBlindPlayer === playerAtThisSlot && "small blind"}
        </div>
        <div className="playerInfoBody">
          <div className="playerCards">
            {card1 && <Card cardValue={card1.cardNameSymbol} cardSuit={card1.suitSymbol} />}
            {card2 && <Card cardValue={card2.cardNameSymbol} cardSuit={card2.suitSymbol} />}
          </div>
          <div className="playerName">
            {playerAtThisSlot?.name}
          </div>
          <div className="playerMoneyLeft">{playerAtThisSlot?.moneyLeft} €</div>
        </div>
      </div>
      <div className="playerBet">{playerAtThisSlot?.sumOfPersonalBetsInThisRound} €</div>
    </div>
  )
});
export default PlayerInfo;


