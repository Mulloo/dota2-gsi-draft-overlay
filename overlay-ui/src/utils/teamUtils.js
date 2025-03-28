// teamUtils.js
import teams from '../data/teamInfo';// Adjust path if needed

/**
 * Match a list of player names to their team from predefined team data.
 * @param {string[]} playerNames - List of player names in-game.
 * @returns {object} - Matched team info or default unknown team.
 */
export const getTeamByPlayerNames = (playerNames) => {
  for (const teamId in teams) {
    const team = teams[teamId];
    const teamPlayers = team.players.map((player) => player.name);
    const matchingPlayers = playerNames.filter((name) =>
      teamPlayers.includes(name)
    );
    if (matchingPlayers.length > 0) {
      return team;
    }
  }

  return {
    name: 'Unknown',
    logo: '',
    players: [],
  };
};
