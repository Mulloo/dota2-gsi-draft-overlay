// hooks/useGameState.js
import { useEffect, useState } from 'react';
import axios from 'axios';

/**
 * Custom hook to fetch live game state from the backend every 500ms.
 * Also tracks whether the game is in progress and handles temporary hiding of player info.
 *
 * @returns {object} - {
 *   gameState,       // full game state object
 *   isInGame,        // boolean
 *   hidePlayerInfo   // boolean (true when kills are detected)
 * }
 */
const useGameState = (pollInterval = 500) => {
  const [gameState, setGameState] = useState({});
  const [isInGame, setIsInGame] = useState(false);
  const [hidePlayerInfo, setHidePlayerInfo] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      axios
        .get('http://localhost:4000/gamestate')
        .then((res) => {
          const state = res.data;
          setGameState(state);
          setIsInGame(state.map?.game_state === 'DOTA_GAMERULES_STATE_GAME_IN_PROGRESS');

          const players = state.player || {};
          const kills = Object.values(players).reduce((acc, player) => acc + (player.kills || 0), 0);

          if (kills > 0) {
            setHidePlayerInfo(true);
            setTimeout(() => setHidePlayerInfo(false), 3000);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch game state:', err);
        });
    }, pollInterval);

    return () => clearInterval(interval);
  }, [pollInterval]);

  return { gameState, isInGame, hidePlayerInfo };
};

export default useGameState;
