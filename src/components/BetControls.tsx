import React, { useState, useCallback, ChangeEvent, useEffect } from 'react';
import { observer } from 'mobx-react';
import store from "../Store";
import "../styles/App.css"

const BetControls: React.FC = observer(() => {
  const [minBetValue, setMinBetValue] = useState(store.minimumBet);
  const [betValue, setBetValue] = useState(store.minimumBet);
  const [sBetValue, setSBetValue] = useState(String(betValue));

  useEffect(() => {
    if (typeof store.players.activePlayer === "undefined") { return };

    const { betToPayToContinue } = store.players.activePlayer;
    const minimumBetAmount = betToPayToContinue;
    setMinBetValue(minimumBetAmount);
    setBetValue(minimumBetAmount);
    setSBetValue(String(minimumBetAmount));
  }, [store.players.activePlayer]);

  const updateBetValue = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    let sNewValue = target.value;
    let value = parseInt(sNewValue);
    if (value < 0) {
      value = 0;
      sNewValue = "0";
    }
    setBetValue(value);
    setSBetValue(sNewValue);
  }, []);

  const handleFold = useCallback(() => {
    if (!store.players.activePlayer) {
      return;
    }

    store.players.activePlayer.fold(store);
  }, [store.players.activePlayer]);

  const handleBetOrCheck = useCallback(() => {
    if (!store.players.activePlayer) {
      return;
    }

    const { canCheck, canSupportBet } = store.players.activePlayer;
    if (canCheck) {
      return store.players.activePlayer.check(store);
    }

    if (canSupportBet) {
      return store.players.activePlayer.supportBet(store);
    }
  }, [store.players.activePlayer]);

  const handleRaise = useCallback(() => {
    const { moneyLeft, betToPayToContinue } = store?.players?.activePlayer;
    if (betValue === betToPayToContinue) {
      return handleBetOrCheck();
    }

    if (betValue === moneyLeft) {
      return handleAllIn();
    }


    store.players.activePlayer.raiseBet({ store, bet: betValue });
  }, [store.players.activePlayer, betValue]);

  const handleAllIn = useCallback(() => {
    store.players.activePlayer.allIn(store);
  }, [store.players.activePlayer]);

  const handlePeakCards = useCallback(() => {
    store.players.activePlayer.cards.forEach(card => card.show());
  }, [store.players.activePlayer]);

  const handleUnpeakCards = useCallback(() => {
    store.players?.activePlayer?.cards.forEach(card => card.hide());
  }, [store.players.activePlayer]);


  return (
    store.isGameActive && <div className='betDiv noSelect'>
      <div>{store.players.activePlayer?.name}</div>
      <div className="buttonsDiv">
        <div className="bet-c-min-text">min</div>
        <div className="betAmount">
          <input type="number" id="betAmountInput" value={sBetValue} onChange={updateBetValue} />
        </div>
        <div className="bet-c-max-text">max</div>
        <div className="tac">money</div>

        <div className='sliderDiv'>
          <input type="range" min={minBetValue} max={store.players.activePlayer?.moneyLeft} value={betValue} className="slider" onChange={updateBetValue} id="betSlider" />
        </div>
        <div className="bet-active-player-name">
          {store.players.activePlayer?.moneyLeft} €
        </div>

        <div>
          <div id="foldBtn" onClick={handleFold} className='raiseBtns noSelect'>fold</div>
        </div>
        <div>
          {(store.players.activePlayer?.canSupportBet || store.players.activePlayer?.canCheck) &&
            <div id="betCheckBtn" onClick={handleBetOrCheck} className='raiseBtns noSelect'>
              {store.players.activePlayer?.canCheck ? "check" : "bet"}
              <br />
              {store.players.activePlayer?.betToPayToContinue}
            </div>
          }
        </div>
        <div>
          {(betValue > store.players?.activePlayer.betToPayToContinue && store.players?.activePlayer?.canRaise) && <div id="raiseBtn" onClick={handleRaise} className='raiseBtns noSelect'>
            raise
            <br />
            {betValue}
          </div>}
        </div>
        <div>
          {store.players?.activePlayer?.moneyLeft > 0 && <div id="allInBtn" onClick={handleAllIn} className='raiseBtns noSelect'>ALL IN</div>}
        </div>
        <div className="peakCardsBtn noSelect" onMouseDown={handlePeakCards} onMouseUp={handleUnpeakCards} onMouseLeave={handleUnpeakCards}>peak cards</div>
      </div>
    </div>
  )
});
export default BetControls;