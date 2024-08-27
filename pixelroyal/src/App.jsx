import Viewport from './canvas/Viewport';
//import Chatbox from './components/Chatbox';
import Buttons from './ui/Buttons';

import './App.css';

export default function App() {
  return (
    <main>
      <Buttons bar="side" />
      <Viewport />
    </main>
  )
}