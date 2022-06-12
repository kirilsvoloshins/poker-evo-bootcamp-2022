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
    <div className={`playerDiv ${playerAtThisSlot?.hasFolded ? "foldedPlayer" : ""}`}>
      <div className={`playerInfo ${store.players?.activePlayer === playerAtThisSlot ? "activePlayerInfo" : ""}`}>
        <div className="playerInfoText">
          {store.players?.bigBlindPlayer === playerAtThisSlot && "big blind"}
          {store.players?.smallBlindPlayer === playerAtThisSlot && "small blind"}
        </div>
        <div className="playerInfoBody">
          <div className="playerCards">
            {card1 && <Card cardValue={card1.cardNameSymbol} cardSuit={card1.suitSymbol} isFaded={card1.isFaded} />}
            {card2 && <Card cardValue={card2.cardNameSymbol} cardSuit={card2.suitSymbol} isFaded={card2.isFaded} />}
          </div>
          <div className="playerName">
            {playerAtThisSlot?.name}
          </div>
          <div className="playerMoneyLeft">{playerAtThisSlot?.moneyLeft} €</div>
        </div>
      </div>
      <div className="playerBet">{playerAtThisSlot?.sumOfPersonalBetsInThisRound} €</div>
      {/* <span>
        canCheck: {playerAtThisSlot?.canCheck === true ? "yes" : "no"}
        <br />
        canSupportBet: {playerAtThisSlot?.canSupportBet === true ? "yes" : "no"}
        <br />
        canRaise: {playerAtThisSlot?.canRaise === true ? "yes" : "no"}
      </span> */}
    </div>
  )
});
export default PlayerInfo;


