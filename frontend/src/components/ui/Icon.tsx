import React from 'react';

// Define common icons with verified path data
const ICONS = {
  warning: {
    viewBox: "0 0 24 24",
    path: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
  },
  check: {
    viewBox: "0 0 24 24",
    path: "M5 13l4 4L19 7"
  },
  x: {
    viewBox: "0 0 24 24",
    path: "M6 18L18 6M6 6l12 12"
  },
  user: {
    viewBox: "0 0 24 24",
    path: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
  }
};

interface IconProps {
  name: keyof typeof ICONS;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

const Icon: React.FC<IconProps> = ({ 
  name, 
  className = "w-6 h-6", 
  size = 24,
  strokeWidth = 2
}) => {
  const icon = ICONS[name];
  
  if (!icon) {
    console.error(`Icon "${name}" not found`);
    return null;
  }
  
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      width={size}
      height={size}
      viewBox={icon.viewBox}
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
        d={icon.path}
      />
    </svg>
  );
};

export default Icon; 