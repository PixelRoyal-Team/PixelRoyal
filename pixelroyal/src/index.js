// src/index.js
import App from './App';

const container = document.getElementById('root');
const appElement = App(); // Call the App function to get the element
container.appendChild(appElement); // Append the element to the container