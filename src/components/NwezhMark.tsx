import React from 'react';

interface NwezhMarkProps {
  className?: string;
  variant?: 'tile' | 'monochrome';
}

export const NwezhMark: React.FC<NwezhMarkProps> = ({
  className = 'w-9 h-9',
  variant = 'tile',
}) => {
  if (variant === 'monochrome') {
    return (
      <svg
        viewBox="0 0 64 64"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <path
          d="M18 48V29C18 21.268 24.268 15 32 15C39.732 15 46 21.268 46 29V48"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M25.5 48V31.5C25.5 27.9101 28.4101 25 32 25C35.5899 25 38.5 27.9101 38.5 31.5V48"
          stroke="#2F5E4E"
          className="dark:stroke-[#6E9F8B]"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 48H50"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 512 512"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect width="512" height="512" rx="112" fill="#18221E" />
      <path
        d="M156 368V236C156 180.772 200.772 136 256 136C311.228 136 356 180.772 356 236V368"
        stroke="#FAF9F6"
        strokeWidth="26"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M208 368V252C208 225.49 229.49 204 256 204C282.51 204 304 225.49 304 252V368"
        stroke="#9EC2B2"
        strokeWidth="22"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M128 368H384"
        stroke="#FAF9F6"
        strokeWidth="26"
        strokeLinecap="round"
      />
    </svg>
  );
};
