import React, { useEffect, useState, useCallback, ChangeEvent } from 'react';
import { GameScreenProps, PlayerT } from '../types';
import { observer } from 'mobx-react';
import store from "../Store";
import "../styles/App.css"
import { BET_ACTION } from '../utils';
// import PlayerT from "../classes/Player";

const BetControls: React.FC = observer(() => {
  // console.log(store.players.activePlayer);


  const [betValue, setBetValue] = useState(store.minimumBet);
  const [sBetValue, setSBetValue] = useState(String(betValue));

  const updateBetValue = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const sNewValue = target.value;
    const value = parseInt(sNewValue);
    setBetValue(value);
    setSBetValue(sNewValue);
  }, []);

  const [activePlayer, setActivePlayer] = useState(null);
  useEffect(() => {
    console.error(store.players.activePlayer);

    if (store.players.activePlayer) {
      setActivePlayer(store.players.activePlayer);
      console.warn("NEW ACTIVE PLAYER: ", store.players.activePlayer.name)
    }
  }, [store.players.activePlayer]);

  const handleFold = useCallback(() => {
    activePlayer.fold(store);
  }, [activePlayer]);

  const handleBetOrCheck = useCallback(() => {
    // const { canCheck, canSupportBet } = activePlayer;
    // if (canCheck) {
    //   activePlayer.check(store);
    //   return;
    // }

    // if (canSupportBet) {
    //   activePlayer.supportBet(store);
    // }
  }, [activePlayer]);

  const handleRaise = useCallback(() => {
    const { moneyLeft } = activePlayer;
    if (betValue === moneyLeft) {
      /* it is basically all in! */
      handleAllIn();
      return;
    }


    // activePlayer.placeBet(betValue, store);
  }, [activePlayer]);

  const handleAllIn = useCallback(() => {
    const { moneyLeft } = activePlayer;
    activePlayer.placeBet({ betAmount: moneyLeft, store, betAction: BET_ACTION.ALL_IN });
  }, [activePlayer]);


  return (
    <div className='betDiv'>
      <div>{store.players.activePlayer?.name}</div>
      <div className="buttonsDiv">
        <div style={{ textAlign: "left", fontSize: "0.8em" }}>min</div>
        <div className="betAmount">
          <input type="number" id="betAmountInput" value={sBetValue} onChange={updateBetValue} />
        </div>
        <div style={{ textAlign: "right", fontSize: "0.8em" }}>max</div>
        <div style={{ textAlign: "center" }}>money</div>

        <div className='sliderDiv'>
          <input type="range" min={store.minimumBet} max={activePlayer?.moneyLeft} value={betValue} className="slider" onChange={updateBetValue} id="betSlider" />
        </div>
        <div style={{ textAlign: "center", fontWeight: 600 }}>
          {activePlayer?.moneyLeft} €
        </div>

        <div>
          <div id="foldBtn" onClick={handleFold} className='raiseBtns noSelect'>fold</div>
        </div>
        <div>
          {(store.players.activePlayer?.canSupportBet || store.players.activePlayer?.canCheck) &&
            <div id="betCheckBtn" onClick={handleBetOrCheck} className='raiseBtns noSelect'>
              {activePlayer?.canCheck ? "check" : "bet"}
              <br />
              {activePlayer?.betToPayToContinue}
            </div>
          }
        </div>
        <div>
          <div id="raiseBtn" onClick={handleRaise} className='raiseBtns noSelect'>
            raise
            <br />
            {betValue}
          </div>
        </div>
        <div>
          <div id="allInBtn" onClick={handleAllIn} className='raiseBtns noSelect'>ALL IN</div>
        </div>
      </div>
    </div>
  )
});
export default BetControls;