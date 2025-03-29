import React from 'react';
import FloatingStats from './FloatingStats';

const InGameOverlay = ({ players, heroPortraitPositions, gameTimeMinutes, hidePlayerInfo }) => {
  return (
    <div className="ingame-overlay">
      {/* Floating Stats */}
      <FloatingStats
        players={players}
        heroPortraitPositions={heroPortraitPositions}
        gameTimeMinutes={gameTimeMinutes}
        hidePlayerInfo={hidePlayerInfo}
      />

      {/* Additional in-game elements can be added here */}
    </div>
  );
};

export default InGameOverlay;