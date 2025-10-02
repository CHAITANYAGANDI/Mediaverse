import React from 'react';

const UserIcon = ({ width = 64, height = 64 }) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Define a vertical gradient from top (lighter) to bottom (darker) */}
    <defs>
      <linearGradient id="iconGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#5ca7de" />
        <stop offset="100%" stopColor="#205b9c" />
      </linearGradient>
    </defs>

    {/* Outer circle with gradient fill */}
    <circle cx="32" cy="32" r="30" fill="url(#iconGradient)" />

    {/* Head (lighter silhouette) */}
    <circle cx="32" cy="22" r="8" fill="#ffffff" fillOpacity="0.8" />

    {/* Shoulders/body (lighter silhouette) */}
    <path
      d="M16 46c0-8.84 7.16-16 16-16s16 7.16 16 16v2H16v-2z"
      fill="#ffffff"
      fillOpacity="0.8"
    />
  </svg>
);

export default UserIcon;
