// components/Draft/FloatingStats.jsx
import React from 'react';
import { calculateHeroLevel } from '../../utils/utilityFunctions';


/**
 * Renders floating stats (gold + level) above player portraits for both teams.
 *
 * @param {object} props
 * @param {object} players - Object containing team2 and team3 player data.
 * @param {object} heroPortraitPositions - Positions for each player (team2/team3).
 * @param {number} gameTimeMinutes - Current game time in minutes.
 * @param {boolean} hidePlayerInfo - Whether to hide stats temporarily (e.g. after a kill).
 */
const FloatingStats = ({ players, heroPortraitPositions, gameTimeMinutes, hidePlayerInfo }) => {
  return (
    <>
      {['team2', 'team3'].map((teamKey) => {
        const teamPlayers = players[teamKey] || {};
        return Object.values(teamPlayers).map((player, idx) => {
          const pos = heroPortraitPositions[teamKey]?.[idx];
          if (!pos) return null;

          const level = calculateHeroLevel(player.xpm, gameTimeMinutes);

          return (
            <div
              key={`${teamKey}-${idx}`}
              className={`absolute text-xs text-center text-white ${hidePlayerInfo ? 'hidden' : ''}`}
              style={{
                ...pos,
                transform: 'translateX(-50%)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 'bold',
                zIndex: 20,
              }}
            >
              <div className={`hero-gold`}>
                <img className="gold-icon" src="/assets/gold.webp" alt="gold icon" /> : {player.gold}
              </div>
              <div className="hero-level">Lvl: {level}</div>
            </div>
          );
        });
      })}
    </>
  );
};

export default FloatingStats;
