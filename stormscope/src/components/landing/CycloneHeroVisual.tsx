"use client";

import { motion } from "framer-motion";

/**
 * Lightweight orbital Bay of Bengal cyclone trajectory visualization.
 * Designed to evoke a storm observed from orbit (Design.md §5)
 * with zero heavy canvas loops or distracting effects.
 */
export default function CycloneHeroVisual() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Subtle radial atmospheric depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 72% 46%, rgba(56, 189, 248, 0.12) 0%, rgba(45, 212, 191, 0.05) 28%, rgba(7, 17, 29, 0) 65%)",
        }}
      />

      {/* Orbital graticule & cyclone trajectory SVG */}
      <svg
        viewBox="0 0 1200 720"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full object-cover opacity-75"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Lat/Lng graticule grid */}
        <g stroke="#132842" strokeWidth="1" strokeOpacity="0.65">
          <line x1="0" y1="140" x2="1200" y2="140" />
          <line x1="0" y1="280" x2="1200" y2="280" />
          <line x1="0" y1="420" x2="1200" y2="420" />
          <line x1="0" y1="560" x2="1200" y2="560" />
          <line x1="240" y1="0" x2="240" y2="720" />
          <line x1="480" y1="0" x2="480" y2="720" />
          <line x1="720" y1="0" x2="720" y2="720" />
          <line x1="960" y1="0" x2="960" y2="720" />
        </g>

        {/* Stylized Eastern India / Odisha coastline contour */}
        <path
          d="M 520 720 L 580 610 L 650 530 L 725 460 L 775 405 L 820 355 L 855 305 L 895 250 L 945 205 L 1015 170 L 1070 110 L 1200 75"
          stroke="#D6C3A5"
          strokeOpacity="0.22"
          strokeWidth="1.5"
        />
        <path
          d="M 555 720 L 615 620 L 685 540 L 755 470 L 800 415 L 845 365 L 885 310 L 930 255 L 985 210 L 1055 175"
          stroke="#38BDF8"
          strokeOpacity="0.1"
          strokeWidth="1"
          strokeDasharray="4 6"
        />

        {/* Isobar / wind-field concentric rings near Puri landfall */}
        <g transform="translate(835, 340)">
          <motion.circle
            r="210"
            stroke="#38BDF8"
            strokeOpacity="0.12"
            strokeWidth="1"
            strokeDasharray="6 6"
            animate={{ rotate: 360 }}
            transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
          />
          <motion.circle
            r="145"
            stroke="#2DD4BF"
            strokeOpacity="0.18"
            strokeWidth="1"
            strokeDasharray="4 5"
            animate={{ rotate: -360 }}
            transition={{ duration: 64, repeat: Infinity, ease: "linear" }}
          />
          <circle
            r="84"
            stroke="#38BDF8"
            strokeOpacity="0.25"
            strokeWidth="1.25"
          />
          <circle
            r="34"
            fill="#38BDF8"
            fillOpacity="0.08"
            stroke="#38BDF8"
            strokeOpacity="0.4"
            strokeWidth="1.25"
          />
          <circle r="5" fill="#38BDF8" />
        </g>

        {/* Cyclone Fani historical track arc across Bay of Bengal */}
        <motion.path
          d="M 960 660 C 920 580, 880 510, 860 440 C 845 390, 835 360, 835 340 C 845 300, 875 245, 920 185 C 955 140, 995 100, 1045 60"
          stroke="url(#trackGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={{ pathLength: 0.15, opacity: 0.4 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.2, ease: "easeOut" }}
        />

        {/* Track telemetry nodes */}
        <g>
          <circle cx="935" cy="605" r="3.5" fill="#2DD4BF" fillOpacity="0.8" />
          <circle cx="888" cy="520" r="3.5" fill="#2DD4BF" fillOpacity="0.85" />
          <circle cx="855" cy="430" r="4" fill="#F59E0B" fillOpacity="0.9" />
          <circle cx="835" cy="340" r="5" fill="#EF4444" />
          <circle cx="878" cy="245" r="3.5" fill="#38BDF8" fillOpacity="0.85" />
          <circle cx="945" cy="155" r="3" fill="#38BDF8" fillOpacity="0.65" />
        </g>

        {/* Coordinate telemetry annotations */}
        <g
          fill="#94A3B8"
          fillOpacity="0.55"
          fontSize="11"
          fontFamily="monospace"
        >
          <text x="852" y="344">19.8°N 85.8°E · PURI LANDFALL</text>
          <text x="872" y="434">215 KM/H PEAK</text>
          <text x="950" y="608">BAY OF BENGAL</text>
        </g>

        <defs>
          <linearGradient id="trackGradient" x1="960" y1="660" x2="1045" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.4" />
            <stop offset="45%" stopColor="#38BDF8" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#F59E0B" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.35" />
          </linearGradient>
        </defs>
      </svg>

      {/* Bottom fade into page background */}
      <div
        className="absolute inset-x-0 bottom-0 h-32"
        style={{
          background:
            "linear-gradient(to top, #07111D 0%, rgba(7, 17, 29, 0) 100%)",
        }}
      />
    </div>
  );
}
