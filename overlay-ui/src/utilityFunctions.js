import experienceLevels from './experienceLevels';

// Calculate hero level based on XPM and game time
export const calculateHeroLevel = (xpm, gameTimeMinutes) => {
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

// Format time in minutes:seconds
export const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
};

// Pick Ban Sequence 
export const pickBanSequence = [
  { team: 'Radiant', type: 'ban', index: 0 },
  { team: 'Dire',    type: 'ban', index: 0 },
  { team: 'Dire',    type: 'ban', index: 1 },
  { team: 'Radiant', type: 'ban', index: 1 },
  { team: 'Dire',    type: 'ban', index: 2 },
  { team: 'Dire',    type: 'ban', index: 3 },
  { team: 'Radiant', type: 'ban', index: 2 },
  { team: 'Radiant', type: 'pick', index: 0 },
  { team: 'Dire',    type: 'pick', index: 0 },
  { team: 'Radiant', type: 'ban', index: 3 },
  { team: 'Radiant', type: 'ban', index: 4 },
  { team: 'Dire',    type: 'ban', index: 4 },
  { team: 'Dire',    type: 'pick', index: 1 },
  { team: 'Radiant', type: 'pick', index: 1 },
  { team: 'Radiant', type: 'pick', index: 2 },
  { team: 'Dire',    type: 'pick', index: 2 },
  { team: 'Dire',    type: 'pick', index: 3 },
  { team: 'Radiant', type: 'pick', index: 3 },
  { team: 'Radiant', type: 'ban', index: 5 },
  { team: 'Dire',    type: 'ban', index: 5 },
  { team: 'Dire',    type: 'ban', index: 6 },
  { team: 'Radiant', type: 'ban', index: 6 },
  { team: 'Radiant', type: 'pick', index: 4 },
  { team: 'Dire',    type: 'pick', index: 4 },
];