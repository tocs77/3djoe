import { PlaneGame } from './PlaneGame';
import './plane.css';
import { instId, startBtnId } from './planeTypes';

export const loadPlaneGame = () => {
  const instructions = document.createElement('p');
  instructions.id = instId;
  instructions.textContent = 'Space, mouse or touch to climb';
  const startBtn = document.createElement('button');
  startBtn.textContent = 'Start';
  instructions.classList.add('instructions');
  startBtn.classList.add('start-btn');
  startBtn.id = startBtnId;
  document.body.appendChild(instructions);
  document.body.appendChild(startBtn);

  document.addEventListener('DOMContentLoaded', () => {
    window.planeGame = new PlaneGame();
  });
};
