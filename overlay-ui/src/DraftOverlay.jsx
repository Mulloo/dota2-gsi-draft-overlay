import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DraftOverlay.css';
import teams from './teamInfo'; // Import team information

// Positions for hero portraits for both teams
const heroPortraitPositions = {
  team2: [ // Radiant (left to right)
    { top: 50, left: 580 },
    { top: 50, left: 640 },
    { top: 50, left: 700 },
    { top: 50, left: 760 },
    { top: 50, left: 820 },
  ],
  team3: [ // Dire (right to left)
    { top: 50, right: 770 },
    { top: 50, right: 710 },
    { top: 50, right: 650 },
    { top: 50, right: 590 },
    { top: 50, right: 530 },
  ],
};

// Experience levels required for each hero level
const experienceLevels = [
  0, 230, 600, 1080, 1660, 2260, 2980, 3730, 4510, 5320,
  6160, 7030, 7930, 8860, 9820, 10810, 11830, 12880, 13960,
  15070, 16210, 17380, 18580, 19810, 21070
];

// Calculate hero level based on XPM and game time
const calculateHeroLevel = (xpm, gameTimeMinutes) => {
  const xp = xpm * gameTimeMinutes;
  let level = 1;
  for (let i = 0; i < experienceLevels.length; i++) {
    if (xp >= experienceLevels[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  return level;
};

const arrowStyle = {
  position: 'absolute',
  width: '50px',
  height: '50px',
  zIndex: 30,
};

export default function DraftOverlay() {
  const [gameState, setGameState] = useState({});
  const [isInGame, setIsInGame] = useState(false);
  const [hidePlayerInfo, setHidePlayerInfo] = useState(false);

  useEffect(() => {
    // Fetch game state every 500ms
    const interval = setInterval(() => {
      axios.get('http://localhost:4000/gamestate')
        .then(res => {
          setGameState(res.data);
          setIsInGame(res.data.map && res.data.map.game_state === 'DOTA_GAMERULES_STATE_GAME_IN_PROGRESS');
          console.log('Game State:', res.data); // Debugging log

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
  const radiant = draft.team2 || {};
  const dire = draft.team3 || {};
  const activeTeam = draft.activeteam === 2 ? 'Radiant' : 'Dire';
  const activePickOrBan = draft.pick ? "Pick" : "Ban";

  // Get the list of picked heroes for a team
  const getTeamPicks = (team) => {
    return Object.entries(team)
      .filter(([key, value]) => key.match(/^pick\d+_class$/) && value)
      .map(([_, value]) => value.replace("npc_dota_hero_", ""));
  };

  // Get the list of banned heroes for a team
  const getTeamBans = (team) => {
    return Object.entries(team)
      .filter(([key, value]) => key.match(/^ban\d+_class$/) && value)
      .map(([_, value]) => value.replace("npc_dota_hero_", ""));
  };

  // Format time in minutes:seconds
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
  };

  // Render picked heroes
  const renderPickedHeroes = (heroes, size = '96px', totalSlots = 5) => {
    return (
      <div className="flex flex-wrap gap-2">
        {heroes.map((hero, idx) => (
          <video
            key={idx}
            autoPlay
            loop
            muted
            playsInline
            src={`https://cdn.imprint.gg/heroes/live_portraits/npc_dota_hero_${hero}.webm`}
            className="object-contain rounded-md"
            style={{ width: size, height: size, margin: '4px', display: 'block' }}
          />
        ))}
        {Array.from({ length: totalSlots - heroes.length }).map((_, idx) => (
          <div
            key={`empty-${idx}`}
            className={idx === 0 ? 'glow-effect' : ''}
            style={{ width: size, height: size, backgroundColor: '#1f2937', borderRadius: '8px', margin: '4px' }}
          />
        ))}
      </div>
    );
  };

  // Render banned heroes
  const renderBannedHeroes = (heroes, size = '80px', totalSlots = 7) => {
    return (
      <div className="flex flex-wrap gap-2">
        {heroes.map((hero, idx) => (
          <div key={idx} className="relative" style={{ width: size, height: size, margin: '4px' }}>
            <img
              src={`https://cdn.imprint.gg/heroes/rectangular_portraits/npc_dota_hero_${hero}.png`}
              alt={hero}
              className="object-cover rounded-md opacity-50"
              style={{ width: '100%', height: '100%' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-red-600">X</span>
            </div>
          </div>
        ))}
        {Array.from({ length: totalSlots - heroes.length }).map((_, idx) => (
          <div
            key={`empty-${idx}`}
            className={idx === 0 ? 'glow-effect' : ''}
            style={{ width: size, height: size, backgroundColor: '#1f2937', borderRadius: '8px', margin: '4px' }}
          />
        ))}
      </div>
    );
  };

  const players = {
    team2: gameState.player?.team2 || {},
    team3: gameState.player?.team3 || {}
  };

  const gameTimeMinutes = gameState.map ? Math.floor(gameState.map.clock_time / 60) : 0;

  const getTeamByPlayerId = (playerId) => {
    for (const teamId in teams) {
      if (teams[teamId].players.some(player => player.id === playerId)) {
        return teams[teamId];
      }
    }
    return { name: 'Unknown', logo: '', players: [] };
  };

  const radiantTeamInfo = teams.team2 || { name: 'Radiant', logo: '/radiant.webp' };
  const direTeamInfo = teams.team3 || { name: 'Dire', logo: '/dire.webp' };

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
          <div className="absolute" style={{ bottom: '270px', left: '100px' }}>
            <h1 className="text-xl font-bold text-green-400">{radiantTeamInfo.name} Picks</h1>
            <img src={radiantTeamInfo.logo} alt="Radiant Logo" className="team-logo" />
            {renderPickedHeroes(getTeamPicks(radiant))}
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
            <h1 className="text-xl font-bold text-red-400">{direTeamInfo.name} Picks</h1>
            <img src={direTeamInfo.logo} alt="Dire Logo" className="team-logo" />
            {renderPickedHeroes(getTeamPicks(dire))}
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
            <h2 className="text-2xl font-bold text-yellow-400">Draft Timer: {draft.activeteam_time_remaining || 0}s</h2>
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
            <h3 className="mt-2 text-xl font-bold text-white">{activeTeam} is selecting: {activePickOrBan}</h3>
          </div>

          {/* Radiant Bans */}
          <div className="absolute" style={{ bottom: '100px', left: '100px' }}>
            <h1 className="text-lg font-bold text-green-400">{radiantTeamInfo.name} Bans</h1>
            {renderBannedHeroes(getTeamBans(radiant))}
          </div>

          {/* Dire Bans */}
          <div className="absolute" style={{ bottom: '100px', right: '100px' }}>
            <h1 className="text-lg font-bold text-red-400">{direTeamInfo.name} Bans</h1>
            {renderBannedHeroes(getTeamBans(dire))}
          </div>
        </div>
      )}
    </div>
  );
}
