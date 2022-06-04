const defaultPlayerData = {
  hasChecked: false,
  hasFolded: false,
  hasReacted: false,
  canCheck: false,
  canSupportBet: false,
  canReact: true, // cant react if you folded or broke
};


const players = [
  {
    id: 0,
    ...defaultPlayerData,
    name: "player 0"
  },
  {
    // active
    id: 1,
    ...defaultPlayerData,
    name: "player 1",
  },
  {
    // 
    id: 2,
    ...defaultPlayerData,
    name: "player 2",
    hasFolded: true,
    canReact: false,
  },
  {
    id: 3,
    ...defaultPlayerData,
    name: "player 3"
  },
  {
    id: 4,
    ...defaultPlayerData,
    name: "player 4"
  },
]

let activePlayer = players[4];
/* 
  [5 players] -> [3 players = 5 - 1 this - 1 cantReact] =>  0. => 0.[next]
  1. => 1.
  2. => 2.
*/

function getNextActivePlayer() {
  // const indexOfActivePlayer = players.indexOf(activePlayer);
  /* assuming it is sorted by player ids ascending */
  const playersWhoCanReact = players.filter(player => player !== activePlayer && player.canReact);
  let nextPlayerId = 0;
  for (const { id } of playersWhoCanReact) {
    if (id > activePlayer.id) {
      nextPlayerId = id; //?
      break;
    }
  }
  const nextPlayer = playersWhoCanReact.find(({ id }) => id === nextPlayerId);
  return nextPlayer;
}

getNextActivePlayer(); //?