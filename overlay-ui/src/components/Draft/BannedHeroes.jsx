// components/Draft/BannedHeroes.jsx
import React from 'react';
import { formatHeroName } from '../../utils/formatHeroName';


/**
 * Renders banned heroes with faded portraits and red Xs.
 *
 * @param {object} props
 * @param {string[]} props.heroes - List of banned hero IDs (e.g. "axe").
 * @param {number} props.totalSlots - Total ban slots (usually 7).
 * @param {object} props.nextSlot - Info about the upcoming ban { team, type, index }.
 * @param {object} props.team - Team info object with a `name` ("Radiant" or "Dire").
 * @param {string} props.size - Portrait size (default "80px").
 */
const BannedHeroes = ({ heroes, totalSlots = 7, nextSlot, team, size = '80px' }) => {
  return (
    <div className="flex flex-wrap gap-2 red-tint">
      {heroes.map((hero, idx) => (
        <div
          key={idx}
          className="relative"
          style={{ width: size, height: size, margin: '4px' }}
        >
          <img
            src={`https://cdn.imprint.gg/heroes/rectangular_portraits/npc_dota_hero_${hero}.png`}
            alt={hero}
            className="object-cover rounded-md opacity-50"
            style={{ width: '100%', height: '100%' }}
          />
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
    </div>
  );
};

export default BannedHeroes;
