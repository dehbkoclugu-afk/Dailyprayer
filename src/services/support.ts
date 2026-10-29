/**
 * Single source of truth for the support address. Builds set it through
 * EXPO_PUBLIC_SUPPORT_EMAIL; the fallback is the contact published in the
 * privacy policy (src/data/legal.ts) so every surface agrees.
 */
const FALLBACK_SUPPORT_EMAIL = 'dehbkoclugu@gmail.com';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const configured = process.env.EXPO_PUBLIC_SUPPORT_EMAIL?.trim() ?? '';

export const SUPPORT_EMAIL = EMAIL_RE.test(configured) ? configured : FALLBACK_SUPPORT_EMAIL;
