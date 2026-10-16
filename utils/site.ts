import { Platform } from 'react-native';

const URL_PADRAO = 'https://project-3ldwb.vercel.app';

/** URL pública do app — na web usa o endereço atual (Vercel). */
export function getSiteUrl(): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin.replace(/\/$/, '');
  }

  const envUrl = process.env.EXPO_PUBLIC_SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');

  return URL_PADRAO;
}

export function getQrCodeImageUrl(siteUrl = getSiteUrl()) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(siteUrl)}`;
}

/** @deprecated use getSiteUrl() */
export const SITE_URL = URL_PADRAO;
