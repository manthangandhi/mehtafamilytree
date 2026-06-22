import React from 'react';

export function FloralBackground({ opacity = "0.08", className = "absolute inset-0 pointer-events-none" }: { opacity?: string; className?: string }) {
  return (
    <div className={className} style={{ opacity }}>
      <svg
        className="w-full h-full"
        viewBox="0 0 1200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern id="floralField" patternUnits="userSpaceOnUse" width="55" height="45">
            <g className="text-[#C8A97E]">
              {/* Flower 1 */}
              <circle cx="15" cy="12" r="3.5" fill="currentColor" opacity="0.55" />
              <circle cx="15" cy="12" r="1.5" fill="#f7f3eb" opacity="0.3" />
              <ellipse cx="10" cy="9" rx="2" ry="1.2" fill="currentColor" opacity="0.4" transform="rotate(-30 10 9)" />
              <ellipse cx="20" cy="9" rx="2" ry="1.2" fill="currentColor" opacity="0.4" transform="rotate(30 20 9)" />
              <ellipse cx="10" cy="15" rx="2" ry="1.2" fill="currentColor" opacity="0.4" transform="rotate(30 10 15)" />
              <ellipse cx="20" cy="15" rx="2" ry="1.2" fill="currentColor" opacity="0.4" transform="rotate(-30 20 15)" />
              <ellipse cx="15" cy="6" rx="1.3" ry="2" fill="currentColor" opacity="0.4" />
              {/* Connecting stem/vine */}
              <path d="M5 22 Q12 18 20 22" stroke="currentColor" strokeWidth="0.9" opacity="0.35" />
              {/* Flower 2 close by for density */}
              <circle cx="40" cy="28" r="3.5" fill="currentColor" opacity="0.55" />
              <circle cx="40" cy="28" r="1.5" fill="#f7f3eb" opacity="0.3" />
              <ellipse cx="35" cy="25" rx="2" ry="1.2" fill="currentColor" opacity="0.4" transform="rotate(-30 35 25)" />
              <ellipse cx="45" cy="25" rx="2" ry="1.2" fill="currentColor" opacity="0.4" transform="rotate(30 45 25)" />
              <ellipse cx="35" cy="31" rx="2" ry="1.2" fill="currentColor" opacity="0.4" transform="rotate(30 35 31)" />
              <ellipse cx="45" cy="31" rx="2" ry="1.2" fill="currentColor" opacity="0.4" transform="rotate(-30 45 31)" />
              <ellipse cx="40" cy="22" rx="1.3" ry="2" fill="currentColor" opacity="0.4" />
              {/* Small buds and leaves to fill every gap */}
              <circle cx="25" cy="38" r="1.8" fill="currentColor" opacity="0.4" />
              <path d="M20 32 Q25 28 30 32" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
              <path d="M35 15 Q40 12 42 18" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#floralField)" />
        <g className="text-[#C8A97E]" opacity="0.3">
          <circle cx="200" cy="100" r="5" fill="currentColor" />
          <circle cx="200" cy="100" r="2.5" fill="#f7f3eb" opacity="0.2" />
          <circle cx="1000" cy="100" r="5" fill="currentColor" />
          <circle cx="1000" cy="100" r="2.5" fill="#f7f3eb" opacity="0.2" />
        </g>
      </svg>
    </div>
  );
}
