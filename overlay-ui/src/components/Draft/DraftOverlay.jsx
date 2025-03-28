/* eslint-disable no-unused-vars */
// components/Draft/DraftOverlay.jsx
import useGameState from '../../hooks/useGameState';
import useHeroStats from '../../hooks/useHeroStats';
import useActiveTeam from '../../hooks/useActiveTeam';

import PickedHeroes from './PickedHeroes';
import BannedHeroes from './BannedHeroes';
import DraftTimer from './DraftTimer';
import TeamLogo from './TeamLogo';
import FloatingStats from './FloatingStats';
import ActiveTeamArrow from './ActiveTeamArrow';

import heroPortraitPositions from '../../data/heroPortraitPositions';

import {
  getTeamPicks,
  getTeamBans,
  getNextSlotIndex,
  isDraftComplete,
  gatherHeroNames
} from '../../utils/pickBanUtils';

import { getTeamByPlayerNames } from '../../utils/teamUtils';
import { pickBanSequence } from '../../utils/utilityFunctions';
import React, { useEffect, useMemo, useState } from 'react';

import '../../styles/draftOverlay.css';

const DraftOverlay = () => {
  const { heroStats } = useHeroStats();
  const { gameState, isInGame, hidePlayerInfo } = useGameState();

  const draft = gameState.draft || {};
  const players = gameState.player || {};
  const radiant = useMemo(() => draft.team2 || {}, [draft.team2]);
  const dire = useMemo(() => draft.team3 || {}, [draft.team3]);

  const nextSlot = getNextSlotIndex(radiant, dire, pickBanSequence);
  const [draftComplete, setDraftComplete] = useState(false);

  const activeTeam = useActiveTeam(draft, nextSlot);
  const activePickOrBan = draft.pick ? 'Pick' : 'Ban';

  const radiantPlayerNames = Object.values(players.team2 || {}).map((p) => p.name);
  const direPlayerNames = Object.values(players.team3 || {}).map((p) => p.name);

  const radiantTeamInfo =
    getTeamByPlayerNames(radiantPlayerNames) || { name: 'Radiant', logo: '/radiant.webp' };
  const direTeamInfo =
    getTeamByPlayerNames(direPlayerNames) || { name: 'Dire', logo: '/dire.webp' };

  const activeTeamName = activeTeam === 'Radiant' ? radiantTeamInfo.name : direTeamInfo.name;

  const gameTimeMinutes = gameState.map ? Math.floor(gameState.map.clock_time / 60) : 0;

  useEffect(() => {
    if (isDraftComplete(radiant, dire)) {
      const { radiantHeroes, direHeroes } = gatherHeroNames(radiant, dire);
      console.log('Draft Complete');
      console.log('Radiant:', radiantHeroes);
      console.log('Dire:', direHeroes);
      setDraftComplete(true);
    }
  }, [radiant, dire]);

  return (
    <div
      className="relative text-white bg-transparent"
      style={{ width: '1920px', height: '1080px' }}
    >
      {isInGame ? (
        <FloatingStats
          players={{ team2: players.team2 || {}, team3: players.team3 || {} }}
          heroPortraitPositions={heroPortraitPositions}
          gameTimeMinutes={gameTimeMinutes}
          hidePlayerInfo={hidePlayerInfo}
        />
      ) : (
        <div className="draft-overlay">
          {/* Radiant Picks */}
          <TeamLogo
            logo={radiantTeamInfo.logo}
            teamName={radiantTeamInfo.name}
            isActive={activeTeam === 'Radiant'}
            color="green"
            style={{ position: 'absolute', top: '700px', left: '700px' }}
          />

          <div className="absolute" style={{ bottom: '270px', left: '100px' }}>
            <h1 className="text-xl font-bold text-green-400">{radiantTeamInfo.name} Picks</h1>
            <PickedHeroes
              heroes={getTeamPicks(radiant)}
              totalSlots={5}
              nextSlot={nextSlot}
              heroStats={heroStats}
              team={{ name: 'Radiant' }}
            />
          </div>
          

          {/* Dire Picks */}
          <TeamLogo
            logo={direTeamInfo.logo}
            teamName={direTeamInfo.name}
            isActive={activeTeam === 'Dire'}
            color="red"
            style={{ position: 'absolute', bottom: '270px', right: '700px' }}
          />

          <div className="absolute" style={{ bottom: '270px', right: '100px' }}>
            <h1 className="text-xl font-bold text-red-400">{direTeamInfo.name} Picks</h1>
            <PickedHeroes
              heroes={getTeamPicks(dire)}
              totalSlots={5}
              nextSlot={nextSlot}
              heroStats={heroStats}
              team={{ name: 'Dire' }}
            />
          </div>

          {/* Timer & Status */}
          <DraftTimer
            draft={draft}
            activeTeam={activeTeam}
            activeTeamName={activeTeamName}
            activePickOrBan={activePickOrBan}
          />

          {/* Radiant Bans */}
          <div className="absolute" style={{ bottom: '100px', left: '100px' }}>
            <h1 className="text-lg font-bold text-green-400">{radiantTeamInfo.name} Bans</h1>
            <BannedHeroes
              heroes={getTeamBans(radiant)}
              totalSlots={7}
              nextSlot={nextSlot}
              team={{ name: 'Radiant' }}
            />
          </div>

          {/* Dire Bans */}
          <div className="absolute" style={{ bottom: '100px', right: '100px' }}>
            <h1 className="text-lg font-bold text-red-400">{direTeamInfo.name} Bans</h1>
            <BannedHeroes
              heroes={getTeamBans(dire)}
              totalSlots={7}
              nextSlot={nextSlot}
              team={{ name: 'Dire' }}
            />
          </div>

          {/* Active Team Arrow */}
          <ActiveTeamArrow activeTeam={activeTeam} />
        </div>
      )}

      {/* Credit Badge */}
      <div
        className="absolute flex items-center gap-2"
        style={{
          bottom: '20px',
          right: '20px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '10px 15px',
          borderRadius: '8px',
        }}
      >
        <img src="/assets/logos/imprint_esports.png" alt="Imprint Logo" style={{ width: '30px', height: '30px' }} />
        <span className="text-sm font-semibold text-white">Stats by Imprint Esports</span>
      </div>
    </div>
  );
};

export default DraftOverlay;
