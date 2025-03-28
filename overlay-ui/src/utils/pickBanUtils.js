// pickBanUtils.js

/**
 * Get picked heroes from a team draft object.
 * @param {object} team - Draft data for a team.
 * @returns {string[]} - List of picked hero names (stripped of npc_dota_hero_ prefix).
 */
export const getTeamPicks = (team) => {
    return Object.entries(team)
      .filter(([key, value]) => /^pick\d+_class$/.test(key) && value)
      .map(([_, value]) => value.replace('npc_dota_hero_', ''));
  };
  
  /**
   * Get banned heroes from a team draft object.
   * @param {object} team - Draft data for a team.
   * @returns {string[]} - List of banned hero names (stripped of npc_dota_hero_ prefix).
   */
  export const getTeamBans = (team) => {
    return Object.entries(team)
      .filter(([key, value]) => /^ban\d+_class$/.test(key) && value)
      .map(([_, value]) => value.replace('npc_dota_hero_', ''));
  };
  
  /**
   * Determines the next draft slot (pick or ban) to be filled.
   * @param {object} radiant - Radiant team draft data.
   * @param {object} dire - Dire team draft data.
   * @param {Array} sequence - The full pick/ban sequence.
   * @returns {object|null} - Next slot { team, type, index } or null if complete.
   */
  export const getNextSlotIndex = (radiant, dire, sequence) => {
    for (let i = 0; i < sequence.length; i++) {
      const { team, type, index } = sequence[i];
      const key = `${type}${index}_class`;
      if (team === 'Radiant' && !radiant[key]) {
        return { team, type, index };
      }
      if (team === 'Dire' && !dire[key]) {
        return { team, type, index };
      }
    }
    return null;
  };
  
  /**
   * Check if the draft is complete (5 picks per team).
   * @param {object} radiant - Radiant team draft data.
   * @param {object} dire - Dire team draft data.
   * @returns {boolean} - True if both teams have 5 picks.
   */
  export const isDraftComplete = (radiant, dire) => {
    const totalPicks = 5;
    const radiantPicks = Object.keys(radiant).filter(key => key.startsWith('pick') && radiant[key]).length;
    const direPicks = Object.keys(dire).filter(key => key.startsWith('pick') && dire[key]).length;
    return radiantPicks === totalPicks && direPicks === totalPicks;
  };
  
  /**
   * Extract picked hero names from both teams.
   * @param {object} radiant - Radiant team draft data.
   * @param {object} dire - Dire team draft data.
   * @returns {object} - { radiantHeroes, direHeroes }
   */
  export const gatherHeroNames = (radiant, dire) => {
    const radiantHeroes = Object.keys(radiant)
      .filter(key => key.startsWith('pick') && radiant[key])
      .map(key => radiant[key].replace('npc_dota_hero_', ''));
  
    const direHeroes = Object.keys(dire)
      .filter(key => key.startsWith('pick') && dire[key])
      .map(key => dire[key].replace('npc_dota_hero_', ''));
  
    return { radiantHeroes, direHeroes };
  };
  