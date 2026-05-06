/**
 * Explicit image manifest — every image used per page
 * is registered here. No dynamic or untracked image loading.
 * If an image is missing, it throws explicitly — not silently.
 */

export const IMAGES = {
  // Shared
  LOGO: '/images/logo.png',
  NATIONAL_EMBLEM: '/images/national-emblem.png',
  ASHOKA_CHAKRA: '/images/ashoka-chakra.png',

  // Landing page specific
  LANDING: {
    HERO_EMBLEM: '/images/hero-emblem.png',
    HERO_CHAKRA: '/images/ashoka-chakra.png',
  },

  // Login page specific
  LOGIN: {
    EMBLEM_CARD: '/images/national-emblem.png',
    BACKGROUND_CHAKRA: '/images/ashoka-chakra.png',
  },

  // OTP page specific
  OTP: {
    EMBLEM: '/images/national-emblem.png',
  },

  // Dashboard shared
  DASHBOARD: {
    LOGO_SIDEBAR: '/images/logo.png',
  },
} as const;

/**
 * Validates that a required image exists.
 * Call this in getStaticProps or page-level error boundary.
 * Throws explicitly — never silently falls back.
 */
export function requireImage(path: string, context: string): string {
  if (!path || typeof path !== 'string') {
    throw new Error(
      `[ImageLoader] Missing required image in context: ${context}. ` +
      `Path received: ${String(path)}`
    );
  }
  return path;
}

/**
 * Safe image with explicit fallback + error logging.
 * Use this in components instead of <img> directly.
 */
export function getImageWithFallback(
  imagePath: string,
  fallbackPath: string,
  context: string
): string {
  try {
    return requireImage(imagePath, context);
  } catch (error) {
    console.error(`[ImageLoader] Falling back for: ${context}`, error);
    return fallbackPath;
  }
}
