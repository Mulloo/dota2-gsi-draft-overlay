// components/Draft/TeamLogo.jsx
import React from 'react';

/**
 * Renders a team logo with optional active styling.
 *
 * @param {object} props
 * @param {string} props.logo - Path or URL to the team logo image.
 * @param {string} props.teamName - Name of the team (for alt/title).
 * @param {boolean} props.isActive - Whether the team is currently active.
 * @param {string} props.color - Optional Tailwind color class (e.g. 'green' or 'red')
 * @param {object} props.style - Optional inline style override.
 */
const TeamLogo = ({ logo, teamName, isActive = false, color = '', style = {} }) => {
  return (
    <img
      src={logo}
      alt={`${teamName} Logo`}
      title={teamName}
      className={`team-logo ${isActive ? 'active-team' : ''} ${isActive && color}`}
      style={{
        width: '100px',
        height: '100px',
        borderRadius: '8px',
        objectFit: 'contain',
        ...style,
      }}
    />
  );
};

export default TeamLogo;
