// hooks/useHeroStats.js
import { useEffect, useState } from 'react';
import axios from 'axios';

/**
 * Custom hook to fetch hero statistics from the backend.
 * @param {number} leagueId - Optional league ID to fetch specific stats (default: 17417)
 * @returns {object} - heroStats: { hero_statistics: { heroes: [...] } }
 */
const useHeroStats = (leagueId = 17417) => {
  const [heroStats, setHeroStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHeroStats = async () => {
      try {
        const response = await axios.post('http://localhost:4000/league/heroes', {
          league_id: leagueId,
        });
        setHeroStats(response.data);
      } catch (err) {
        console.error('Failed to fetch hero stats:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroStats();
  }, [leagueId]);

  return { heroStats, loading, error };
};

export default useHeroStats;

const HeroMatchCount = ({ heroName }) => {
  const { heroStats, loading, error } = useHeroStats();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading hero stats</p>;

  // Find the hero data in hero_statistics.heroes
  const heroData = heroStats.hero_statistics?.heroes?.find(
    (hero) => hero.name === heroName
  );

  // Get the match count
  const matchCount = heroData?.match_count || 0;

  return <p>{heroName} has {matchCount} matches.</p>;
};

export { HeroMatchCount };

const HeroAverageImprintRating = ({ heroName }) => {
  const { heroStats, loading, error } = useHeroStats();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading hero stats</p>;

  // Find the hero data in hero_statistics.heroes
  const heroData = heroStats.hero_statistics?.heroes?.find(
    (hero) => hero.name === heroName
  );

  // Get the average imprint rating
  const averageImprintRating = heroData?.average_imprint_rating || 0;

  return <p>{heroName} has an average imprint rating of {averageImprintRating}.</p>;
};

export { HeroAverageImprintRating };


