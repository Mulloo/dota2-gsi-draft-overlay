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
      {/* Render banners for both teams */}
      {['team2', 'team3'].map((teamKey, teamIdx) => {
        const teamPlayers = players[teamKey] || {};
        const positions = heroPortraitPositions[teamKey] || [];

        // Render the black banner for the team
        return (
          <React.Fragment key={teamKey}>
            <div
              className="absolute"
              style={{
                top: positions[0]?.top - 0 || 0, // Adjust the banner's position slightly above the stats
                left: teamKey === 'team2' ? positions[0]?.left + 125 : undefined, // Start position for Radiant
                right: teamKey === 'team3' ? positions[0]?.right - 390 : undefined, // Start position for Dire
                width: '320px', // Adjust width to span all 5 players
                height: '20px', // Height of the banner
                background: 'rgba(0, 0, 0, 0.7)', // Semi-transparent black background
                borderRadius: '20px',
                zIndex: 10,
                transform: 'translateX(-50%)',
              }}
            ></div>

            {/* Render stats for each player */}
            {Object.values(teamPlayers).map((player, idx) => {
              const pos = positions[idx];
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
                  <div className="hero-gold" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <img
                      className="gold-icon"
                      src="/assets/gold.webp"
                      alt="gold icon"
                      style={{ width: '12px', height: '12px' }}
                    />
                    : {player.gold}
                  </div>
                  <div className="hero-level">Lvl: {level}</div>
                </div>
              );
            })}
          </React.Fragment>
        );
      })}
    </>
  );
};

export default FloatingStats;
