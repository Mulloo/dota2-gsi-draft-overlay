/* eslint-disable no-unused-vars */
// components/Draft/DraftOverlay.jsx
import React from 'react';
import InGameOverlay from '../InGame/InGameOverlay';
import heroPortraitPositions from '../../data/heroPortraitPositions';

import '../../styles/draftOverlay.css';

const DraftOverlay = () => {
  // Mock data for development
  const mockPlayers = {
    team2: {
      1: { name: 'Player1', gold: 6000, xpm: 500 },
      2: { name: 'Player2', gold: 6000, xpm: 400 },
      3: { name: 'Player3', gold: 6000, xpm: 450 },
      4: { name: 'Player4', gold: 6000, xpm: 300 },
      5: { name: 'Player5', gold: 6000, xpm: 350 },
    },
    team3: {
      1: { name: 'Player6', gold: 6000, xpm: 480 },
      2: { name: 'Player7', gold: 6000, xpm: 420 },
      3: { name: 'Player8', gold: 6000, xpm: 460 },
      4: { name: 'Player9', gold: 6000, xpm: 320 },
      5: { name: 'Player10', gold: 6000, xpm: 370 },
    },
  };

  const mockGameTimeMinutes = 15;
  const mockHidePlayerInfo = false;

  return (
    <div
      className="relative text-white bg-transparent"
      style={{ width: '1920px', height: '1080px' }}
    >
      {/* Hard-coded InGameOverlay for development */}
      <InGameOverlay
        players={mockPlayers}
        heroPortraitPositions={heroPortraitPositions}
        gameTimeMinutes={mockGameTimeMinutes}
        hidePlayerInfo={mockHidePlayerInfo}
      />
    </div>
  );
};

export default DraftOverlay;
