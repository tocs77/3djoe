/// <reference types="vite/client" />

import type { App } from './App';
import type { PlaneGame } from './plane/PlaneGame';

declare global {
  interface Window {
    app: App;
    planeGame: PlaneGame;
  }
}
