/// <reference types="vite/client" />

import type { App } from './App';

declare global {
  interface Window {
    app: App;
  }
}
