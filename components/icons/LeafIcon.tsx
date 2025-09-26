
import React from 'react';

export const LeafIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path
      d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66L6 19h2l.22-1.34C12 11 17 8 17 8z"
    />
    <path
      d="M17 8c0-3.31-2.69-6-6-6s-6 2.69-6 6c0 2.02 1 3.83 2.55 4.89l.3 1.34C5.17 15.83 5 17.89 5 20h2c0-1.53.34-3.24 1-5l1.41-2.11C11.53 12.23 13 11 15 10c1.34 0 2.5.53 3.32 1.32L20 10c-.5-5-5-8-5-8z"
    />
  </svg>
);
