// src/App.js
import Viewport from './canvas/Viewport';
import Buttons from './ui/Buttons';
import './App.css';

export default function App() {
    const mainElement = document.createElement('main');

    // Create the Viewport element
    const viewportElement = Viewport(); // Assuming Viewport is implemented to return a DOM element
    mainElement.appendChild(viewportElement);

    // Create Buttons element if needed (uncomment if you want it)
    // const buttonsElement = Buttons({ bar: 'side' }); 
    // mainElement.appendChild(buttonsElement);

    return mainElement;
}