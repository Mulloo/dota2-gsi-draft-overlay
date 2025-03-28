// components/Draft/DraftTimer.jsx
import React from 'react';
import { formatTime } from '../../utils/utilityFunctions';


/**
 * Renders the draft timer, reserve time, and current pick/ban team info.
 *
 * @param {object} props
 * @param {object} draft - Draft data from gameState.draft
 * @param {string} activeTeam - "Radiant" or "Dire"
 * @param {string} activeTeamName - Display name of the active team
 * @param {string} activePickOrBan - Either "Pick" or "Ban"
 */
const DraftTimer = ({ draft, activeTeam, activeTeamName, activePickOrBan }) => {
  const mainTimer = draft.activeteam_time_remaining || 0;
  const radiantReserve = formatTime(draft.radiant_bonus_time || 0);
  const direReserve = formatTime(draft.dire_bonus_time || 0);

  const usingRadiantReserve = activeTeam === 'Radiant' && mainTimer === 0 && draft.radiant_bonus_time > 0;
  const usingDireReserve = activeTeam === 'Dire' && mainTimer === 0 && draft.dire_bonus_time > 0;

  return (
    <div
      className="absolute text-center"
      style={{ bottom: '150px', left: '50%', transform: 'translateX(-50%)' }}
    >
      <h2 className="text-2xl font-bold text-yellow-400">
        Draft Timer: {mainTimer}s
        {usingRadiantReserve && (
          <span className="text-green-400 reserve-time-active"> (Reserve Time: {radiantReserve}s)</span>
        )}
        {usingDireReserve && (
          <span className="text-red-400 reserve-time-active"> (Reserve Time: {direReserve}s)</span>
        )}
      </h2>

      <p className="font-semibold text-gray-300 text-md">
        Radiant Reserve:{" "}
        <span className={usingRadiantReserve ? 'text-green-400 reserve-time-active' : 'text-green-400'}>
          {radiantReserve}s
        </span>{" "}
        | Dire Reserve:{" "}
        <span className={usingDireReserve ? 'text-red-400 reserve-time-active' : 'text-red-400'}>
          {direReserve}s
        </span>
      </p>

      <h3 className="mt-2 text-xl font-bold text-white">
        {activeTeamName} is selecting: {activePickOrBan}
      </h3>
    </div>
  );
};

export default DraftTimer;
