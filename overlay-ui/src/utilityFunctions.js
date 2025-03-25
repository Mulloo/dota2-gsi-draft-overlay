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