/* eslint-disable no-unused-vars */
// components/Draft/PickedHeroes.jsx
import React from 'react';
import { formatHeroName } from '../../utils/formatHeroName';
import { HeroMatchCount, HeroAverageImprintRating } from '../../hooks/useHeroStats';

/**
 * Renders picked heroes for a team, including win rates and the next pick slot.
 *
 * @param {object} props
 * @param {string[]} props.heroes - List of picked hero IDs (stripped, e.g. "axe").
 * @param {number} props.totalSlots - Total number of picks allowed (usually 5).
 * @param {object} props.nextSlot - Info about the upcoming pick { team, type, index }.
 * @param {object} props.heroStats - Full hero stats object (should contain .hero_statistics.heroes).
 * @param {object} props.team - The full team draft object (used to compare to `nextSlot.team`).
 * @param {string} props.size - Width/height size of each hero (e.g., "100px").
 * @param {string} props.activeTeam - The currently active team ("Radiant" or "Dire").
 */
const PickedHeroes = ({ heroes, totalSlots = 5, nextSlot, heroStats, team, size = '100px', activeTeam }) => {
  const arrowStyle = {
    position: 'absolute',
    width: '50px',
    height: '50px',
    zIndex: 30,
  };

  return (
    <div className="flex flex-wrap gap-2">
      {heroes.map((hero, idx) => {
        const heroData = heroStats.hero_statistics?.heroes.find(
          (h) => h.raw_name === `npc_dota_hero_${hero}`
        );
        const winRate = heroData?.winrate ? `${heroData.winrate}%` : 'N/A';
        const matchCount = heroData?.match_count || 0;
        const averageImprintRating = heroData?.average_imprint_rating || 'N/A';

        return (
          <div
            key={idx}
            className="relative"
            style={{ width: size, height: size, margin: '4px' }}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              src={`https://cdn.imprint.gg/heroes/live_portraits/npc_dota_hero_${hero}.webm`}
              className="object-contain rounded-md"
              style={{ width: '100%', height: '100%' }}
            />
            <div className="absolute bottom-0 left-0 right-0 text-xs text-center text-white bg-black bg-opacity-50">
              {formatHeroName(hero)}
            </div>
            <div className="absolute left-0 right-0 p-1 mt-1 text-xs text-center text-yellow-400 bg-gray-900 top-full bg-opacity-80 rounded-b-md">
              <div className="flex flex-col items-center space-y-1">
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-white">Win Rate:</span>
                  <span>{winRate}</span>
                </div>
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-white">Matches:</span>
                  <span>{matchCount}</span>
                </div>
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-white">Avg Rating:</span>
                  <span>{averageImprintRating}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {Array.from({ length: totalSlots - heroes.length }).map((_, idx) => {
        const absoluteIndex = heroes.length + idx;
        const shouldShowLoading =
          nextSlot &&
          nextSlot.type === 'pick' &&
          nextSlot.index === absoluteIndex &&
          ((nextSlot.team === 'Radiant' && team.name === 'Radiant') ||
            (nextSlot.team === 'Dire' && team.name === 'Dire'));

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
                src="/assets/loading.webm"
                className="object-contain rounded-md"
                style={{ width: '100%', height: '100%' }}
              />
            )}
          </div>
        );
      })}

      {activeTeam === 'Radiant' && (
        <img
          src="/assets/arrow.png"
          alt="Arrow"
          className={`arrow-fade-out ${activeTeam === 'Radiant' ? 'arrow-fade-in-radiant' : ''}`}
          style={{ ...arrowStyle, left: '835px', bottom: '20px' }}
        />
      )}

      {activeTeam === 'Dire' && (
        <img
          src="/assets/arrow.png"
          alt="Arrow"
          className={`arrow-fade-out ${activeTeam === 'Dire' ? 'arrow-fade-in-dire' : ''}`}
          style={{ ...arrowStyle, right: '835px', bottom: '20px' }}
        />
      )}
    </div>
  );
};

export default PickedHeroes;
