declare module 'next-pwa' {
  import type { NextConfig } from 'next';

  export interface PWAConfig {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    scope?: string;
    sw?: string;
    swSrc?: string;
    reloadOnOnline?: boolean;
    cacheOnFrontEndNav?: boolean;
    aggressiveFrontEndNavCaching?: boolean;
    compress?: boolean;
    workboxOptions?: any;
    generateInDevMode?: boolean;
  }

  export default function withPWA(config?: PWAConfig): (nextConfig: NextConfig) => NextConfig;
}
