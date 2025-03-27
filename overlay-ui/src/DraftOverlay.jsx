import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DraftOverlay.css';
import teams from './teamInfo'; // Import team information
import heroNameMapping from './heroNameMapping'; // Import hero name mapping
import heroPortraitPositions from './heroPortraitPositions'; // Import hero portrait positions
import { calculateHeroLevel, formatTime, pickBanSequence } from './utilityFunctions'; // Import utility functions


const arrowStyle = {
  position: 'absolute',
  width: '50px',
  height: '50px',
  zIndex: 30,
};

// Format hero name
const formatHeroName = (hero) => {
  const formattedName = hero.replace(/npc_dota_hero_/, '').replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  return heroNameMapping[formattedName.toLowerCase()] || formattedName;
};

// Determine the next slot to be filled based on the pick and ban sequence
const getNextSlotIndex = (radiant, dire, sequence) => {
  for (let i = 0; i < sequence.length; i++) {
    const { team, type, index } = sequence[i];
    if (team === 'Radiant' && !radiant[`${type}${index}_class`]) {
      return { team, type, index };
    }
    if (team === 'Dire' && !dire[`${type}${index}_class`]) {
      return { team, type, index };
    }
  }
  return null;
};

// Check if the draft is complete
const isDraftComplete = (radiant, dire) => {
  const totalPicks = 5;
  const radiantPicks = Object.keys(radiant).filter(key => key.startsWith('pick') && radiant[key]).length;
  const direPicks = Object.keys(dire).filter(key => key.startsWith('pick') && dire[key]).length;
  return radiantPicks === totalPicks && direPicks === totalPicks;
};

// Gather hero names from the draft
const gatherHeroNames = (radiant, dire) => {
  const radiantHeroes = Object.keys(radiant)
    .filter(key => key.startsWith('pick') && radiant[key])
    .map(key => radiant[key].replace('npc_dota_hero_', ''));
  const direHeroes = Object.keys(dire)
    .filter(key => key.startsWith('pick') && dire[key])
    .map(key => dire[key].replace('npc_dota_hero_', ''));
  return { radiantHeroes, direHeroes };
};

// Get the list of picked heroes for a team
const getTeamPicks = (team) => {
  return Object.entries(team)
    .filter(([key, value]) => key.match(/^pick\d+_class$/) && value)
    .map(([_, value]) => value.replace('npc_dota_hero_', ''));
};

// Get the list of banned heroes for a team
const getTeamBans = (team) => {
  return Object.entries(team)
    .filter(([key, value]) => key.match(/^ban\d+_class$/) && value)
    .map(([_, value]) => value.replace("npc_dota_hero_", ""));
};


const DraftOverlay = () => {
  const [heroStats, setHeroStats] = useState({});
  const [gameState, setGameState] = useState({});
  const [isInGame, setIsInGame] = useState(false);
  const [hidePlayerInfo, setHidePlayerInfo] = useState(false);
  const [draftComplete, setDraftComplete] = useState(false);

  useEffect(() => {
    const fixedLeagueId = 17417; // 🔧 your static league ID
  
    axios.post('http://localhost:4000/league/heroes', { league_id: fixedLeagueId })
      .then((res) => {
        setHeroStats(res.data);
      })
      .catch((err) => console.error('Failed to fetch league hero data:', err));
  }, []);

  useEffect(() => {
    // Fetch game state every 500ms
    const interval = setInterval(() => {
      axios.get('http://localhost:4000/gamestate')
        .then(res => {
          setGameState(res.data);
          setIsInGame(res.data.map && res.data.map.game_state === 'DOTA_GAMERULES_STATE_GAME_IN_PROGRESS');

          // Detect kills and hide player info for 3 seconds if any kills are detected
          const players = res.data.player || {};
          const kills = Object.values(players).reduce((acc, player) => acc + (player.kills || 0), 0);
          if (kills > 0) {
            setHidePlayerInfo(true);
            setTimeout(() => setHidePlayerInfo(false), 3000); // Hide for 3 seconds
          }
        })
        .catch(err => console.error(err));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const draft = gameState.draft || {};
  const radiant = React.useMemo(() => draft.team2 || {}, [draft.team2]);
  const dire = React.useMemo(() => draft.team3 || {}, [draft.team3]);
  const activeTeam = draft.activeteam === 2 ? 'Radiant' : 'Dire';
  const activePickOrBan = draft.pick ? "Pick" : "Ban";

  const nextSlot = getNextSlotIndex(radiant, dire, pickBanSequence);

  // Check if the draft is complete and gather hero names
  useEffect(() => {
    if (isDraftComplete(radiant, dire)) {
      const { radiantHeroes, direHeroes } = gatherHeroNames(radiant, dire);
      console.log('Radiant Heroes:', radiantHeroes);
      console.log('Dire Heroes:', direHeroes);
      setDraftComplete(true);
    }
  }, [radiant, dire]);

  // Render picked heroes
  const renderPickedHeroes = (heroes, size = '100px', totalSlots = 5, nextSlot, team) => {
    return (
      <div className="flex flex-wrap gap-2">
        {heroes.map((hero, idx) => {
          const heroData = heroStats.hero_statistics?.heroes.find(
            (h) => h.raw_name === `npc_dota_hero_${hero}`
          );
          const winRate = heroData?.winrate ? `${heroData.winrate}%` : 'N/A';

          return (
            <div key={idx} className="relative" style={{ width: size, height: size, margin: '4px' }}>
              {hero ? (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  src={`https://cdn.imprint.gg/heroes/live_portraits/npc_dota_hero_${hero}.webm`}
                  className="object-contain rounded-md"
                  style={{ width: '100%', height: '100%' }}
                />
              ) : null}
              <div className="absolute bottom-0 left-0 right-0 text-xs text-center text-white bg-black bg-opacity-50">
                {formatHeroName(hero)}
              </div>
              {hero && (
                <div className="absolute left-0 right-0 mt-1 text-xs text-center text-yellow-400 top-full">
                  Win Rate: {winRate}
                </div>
              )}
            </div>
          );
        })}
        {Array.from({ length: totalSlots - heroes.length }).map((_, idx) => {
          const absoluteIndex = heroes.length + idx;
          const shouldShowLoading =
            nextSlot &&
            nextSlot.type === 'pick' &&
            nextSlot.index === absoluteIndex &&
            ((nextSlot.team === 'Radiant' && team === radiant) ||
              (nextSlot.team === 'Dire' && team === dire));

          return (
            <div
              key={`empty-${idx}`}
              className={shouldShowLoading ? 'next-slot' : ''}
              style={{
                width: size,
                height: size,
                backgroundColor: '#1f2937',
                borderRadius: '8px',
                margin: '4px',
              }}
            >
              {shouldShowLoading && (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  src="/loading.webm"
                  className="object-contain rounded-md"
                  style={{ width: '100%', height: '100%' }}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render banned heroes
  const renderBannedHeroes = (heroes, size = '80px', totalSlots = 7, nextSlot, team) => {
    return (
      <div className="flex flex-wrap gap-2 red-tint">
        {heroes.map((hero, idx) => (
          <div key={idx} className="relative" style={{ width: size, height: size, margin: '4px' }}>
            {hero ? (
              <img
                src={`https://cdn.imprint.gg/heroes/rectangular_portraits/npc_dota_hero_${hero}.png`}
                alt={hero}
                className="object-cover rounded-md opacity-50"
                style={{ width: '100%', height: '100%' }}
              />
            ) : null}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-bold text-red-600 text-7xl">X</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 text-xs text-center text-white bg-black bg-opacity-50">
              {formatHeroName(hero)}
            </div>
          </div>
        ))}
        {Array.from({ length: totalSlots - heroes.length }).map((_, idx) => {
          const absoluteIndex = heroes.length + idx;
          const shouldShowLoading =
            nextSlot &&
            nextSlot.type === 'ban' &&
            nextSlot.index === absoluteIndex &&
            ((nextSlot.team === 'Radiant' && team === radiant) ||
             (nextSlot.team === 'Dire' && team === dire));

          return (
            <div
              key={`empty-${idx}`}
              className={shouldShowLoading ? 'next-slot' : ''}
              style={{
                width: size,
                height: size,
                backgroundColor: '#1f2937',
                borderRadius: '8px',
                margin: '4px',
              }}
            >
              {shouldShowLoading && (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  src="/loading.webm"
                  className="object-contain rounded-md"
                  style={{ width: '100%', height: '100%' }}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const players = {
    team2: gameState.player?.team2 || {},
    team3: gameState.player?.team3 || {}
  };

  const gameTimeMinutes = gameState.map ? Math.floor(gameState.map.clock_time / 60) : 0;

  const getTeamByPlayerNames = (playerNames) => {
    for (const teamId in teams) {
      const teamPlayers = teams[teamId].players.map(player => player.name);
      const matchingPlayers = playerNames.filter(name => teamPlayers.includes(name));
      if (matchingPlayers.length > 0) {
        return teams[teamId];
      }
    }
    return { name: 'Unknown', logo: '', players: [] };
  };

  // Gather all player names for each team
  const radiantPlayerNames = Object.values(players.team2).map(player => player.name);
  const direPlayerNames = Object.values(players.team3).map(player => player.name);

  const radiantTeamInfo = getTeamByPlayerNames(radiantPlayerNames) || { name: 'Radiant', logo: '/radiant.webp' };
  const direTeamInfo = getTeamByPlayerNames(direPlayerNames) || { name: 'Dire', logo: '/dire.webp' };

  const activeTeamName = activeTeam === 'Radiant' ? radiantTeamInfo.name : direTeamInfo.name;

  return (
    <div className="relative text-white bg-transparent" style={{ width: '1920px', height: '1080px' }}>
      {isInGame ? (
        <>
          {/* Floating Gold + Level Labels */}
          {['team2', 'team3'].map((teamKey) => {
            const teamPlayers = players[teamKey];
            return Object.values(teamPlayers).map((player, idx) => {
              const pos = heroPortraitPositions[teamKey][idx];
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
                  <div class="hero-gold"> <img class="gold-icon" src="gold.webp" alt="gold icon" />:{player.gold}</div>
                  <div class="hero-level">Lvl: {level}</div>
                </div>
              );
            });
          })}
        </>
      ) : (
        <div className="draft-overlay">
          {/* Radiant Picks */}
          <img src={radiantTeamInfo.logo} alt="Radiant Logo" className={`team-logo ${activeTeam === 'Radiant' ? 'active-team green' : ''}`}
            style={{
              position: 'absolute',
              top: '700px',
              left: '700px',
              width: '100px',
              height: '100px',
            }} />
          <div className="absolute" style={{ bottom: '270px', left: '100px' }}>
            <h1 className="text-xl font-bold text-green-400">{radiantTeamInfo.name} Picks</h1>
            {renderPickedHeroes(getTeamPicks(radiant), '100px', 5, nextSlot, radiant)}
            {activeTeam === 'Radiant' && (
              <img
                src="/arrow.png"
                alt="Arrow"
                className={`arrow-fade-out ${activeTeam === 'Radiant' ? 'arrow-fade-in-radiant' : ''}`}
                style={{ ...arrowStyle, left: '835px', bottom: '20px' }}
              />
            )}
          </div>

          {/* Dire Picks */}
          <div className="absolute" style={{ bottom: '270px', right: '100px' }}>
            <img src={direTeamInfo.logo} alt="Dire Logo" className={`team-logo ${activeTeam === 'Dire' ? 'active-team red' : ''}`}
              style={{
                position: 'absolute',
                top: '32px',
                right: '650px',
                width: '100px',
                height: '100px',
              }} />
            <h1 className="text-xl font-bold text-red-400">{direTeamInfo.name} Picks</h1>
            {renderPickedHeroes(getTeamPicks(dire), '100px', 5, nextSlot, dire)}
            {activeTeam === 'Dire' && (
              <img
                src="/arrow.png"
                alt="Arrow"
                className={`arrow-fade-out ${activeTeam === 'Dire' ? 'arrow-fade-in-dire' : ''}`}
                style={{ ...arrowStyle, right: '835px', bottom: '20px' }}
              />
            )}
          </div>

          {/* Draft Timer and Active Selection */}
          <div className="absolute text-center" style={{ bottom: '150px', left: '50%', transform: 'translateX(-50%)' }}>
            <h2 className="text-2xl font-bold text-yellow-400">
              Draft Timer: {draft.activeteam_time_remaining || 0}s
              {activeTeam === 'Radiant' && draft.activeteam_time_remaining === 0 && draft.radiant_bonus_time > 0 && (
                <span className="text-green-400 reserve-time-active"> (Reserve Time: {formatTime(draft.radiant_bonus_time || 0)}s)</span>
              )}
              {activeTeam === 'Dire' && draft.activeteam_time_remaining === 0 && draft.dire_bonus_time > 0 && (
                <span className="text-red-400 reserve-time-active"> (Reserve Time: {formatTime(draft.dire_bonus_time || 0)}s)</span>
              )}
            </h2>
            <p className="font-semibold text-gray-300 text-md">
              Radiant Reserve :
              <span className={`${activeTeam === 'Radiant' && draft.activeteam_time_remaining === 0 && draft.radiant_bonus_time > 0 ? 'text-green-400 glow-effect' : 'text-green-400'}`}>
                {formatTime(draft.radiant_bonus_time || 0)}s
              </span> |
              Dire Reserve :
              <span className={`${activeTeam === 'Dire' && draft.activeteam_time_remaining === 0 && draft.dire_bonus_time > 0 ? 'text-red-400 glow-effect' : 'text-red-400'}`}>
                {formatTime(draft.dire_bonus_time || 0)}s
              </span>
            </p>
            <h3 className="mt-2 text-xl font-bold text-white">{activeTeamName} is selecting: {activePickOrBan}</h3>
          </div>

          {/* Radiant Bans */}
          <div className="absolute" style={{ bottom: '100px', left: '100px' }}>
            <h1 className="text-lg font-bold text-green-400">{radiantTeamInfo.name} Bans</h1>
            {renderBannedHeroes(getTeamBans(radiant), '80px', 7, nextSlot, radiant)}
          </div>

          {/* Dire Bans */}
          <div className="absolute" style={{ bottom: '100px', right: '100px' }}>
            <h1 className="text-lg font-bold text-red-400">{direTeamInfo.name} Bans</h1>
            {renderBannedHeroes(getTeamBans(dire), '80px', 7, nextSlot, dire)}
          </div>
        </div>
      )}
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
  <img
    src="/teamlogos/imprint_esports.png"
    alt="Imprint Logo"
    style={{ width: '30px', height: '30px' }}
  />
  <span className="text-sm font-semibold text-white">Stats by Imprint Esports</span>
</div>
     </div>
  );
};

export default DraftOverlay;