import React, { useEffect, useState } from 'react';
import '../../styles/draftOverlay.css'; // Ensure the styles for the arrow are imported

const arrowStyle = {
  position: 'absolute',
  width: '50px',
  height: '50px',
  zIndex: 30,
};

const ActiveTeamArrow = ({ activeTeam }) => {
  const [lastActiveTeam, setLastActiveTeam] = useState(null); // Track the last active team
  const [arrowClass, setArrowClass] = useState(''); // Track the arrow animation class

  useEffect(() => {
    if (activeTeam !== lastActiveTeam) {
      // Update the arrow animation class based on the active team
      setArrowClass(activeTeam === 'Radiant' ? 'arrow-rotate-radiant' : 'arrow-rotate-dire');
      setLastActiveTeam(activeTeam);

      // Remove the animation class after the animation completes
      const timeout = setTimeout(() => setArrowClass(''), 500); // Match the animation duration
      return () => clearTimeout(timeout);
    }
  }, [activeTeam, lastActiveTeam]);

  return (
    <img
      src="/assets/arrow.png"
      alt="Arrow"
      className={`arrow ${arrowClass}`}
      style={{
        ...arrowStyle,
        left: activeTeam === 'Radiant' ? '960px' : 'unset',
        right: activeTeam === 'Dire' ? '960px' : 'unset',
        transform: activeTeam === 'Radiant' ? 'scaleX(1)' : 'scaleX(-1)', // Flip direction
      }}
    />
  );
};

export default ActiveTeamArrow;