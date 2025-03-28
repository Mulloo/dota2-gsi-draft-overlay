// formatHeroName.js
import heroNameMapping from '../data/heroNameMapping'; // Adjust the path as needed

/**
 * Converts an internal hero ID to a human-readable, properly capitalized name.
 * Example: npc_dota_hero_dragon_knight → Dragon Knight
 *
 * @param {string} heroId - Internal Dota 2 hero ID (e.g., npc_dota_hero_axe)
 * @returns {string} - Formatted and mapped hero name
 */
export const formatHeroName = (heroId) => {
  if (!heroId || typeof heroId !== 'string') return 'Unknown Hero';

  const raw = heroId.replace(/npc_dota_hero_/, '');
  const spaced = raw.replace(/_/g, ' ');
  const capitalized = spaced.replace(/\b\w/g, char => char.toUpperCase());

  const lowerKey = raw.toLowerCase();

  return heroNameMapping[lowerKey] || capitalized;
};
