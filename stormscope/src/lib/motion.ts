// ═══════════════════════════════════════════════════════
// Motion Presets — per DesignSystem.md §12
// ═══════════════════════════════════════════════════════

export const motionPresets = {
  /** Fade up with stagger-ready delay */
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },

  /** Fade in only */
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.35 },
  },

  /** Scale up from slightly smaller */
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 },
  },

  /** Slide in from left */
  slideInLeft: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },

  /** Stagger children */
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  },

  /** Stagger children (slower) */
  staggerContainerSlow: {
    animate: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  },
} as const;

/** Viewport trigger options for scroll animations */
export const viewportOptions = {
  once: true,
  margin: "-60px",
} as const;
