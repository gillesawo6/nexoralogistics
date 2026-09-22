/// <reference types="vite/client" />
import type Lenis from 'lenis';

interface ImportMetaEnv {
  readonly VITE_CARTO_API_KEY?: string;
  readonly [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    __lenis?: Lenis | null;
  }
}
