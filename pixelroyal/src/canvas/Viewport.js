import Movement from './Render.js';

export default function Viewport() {
  const mainElement = document.createElement('div');
  const canvas = document.createElement('canvas');
  canvas.id = 'viewport';

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const context = canvas.getContext('2d');

  mainElement.appendChild(canvas);

  if (canvas && context) {
    Movement(canvas, context);
  }

  return mainElement;
}