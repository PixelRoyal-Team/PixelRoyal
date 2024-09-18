import React, { useEffect } from 'react';
import { io } from 'socket.io-client';

import Viewport from './canvas/Viewport';
//import Chatbox from './components/Chatbox';
import Buttons from './ui/Buttons';

import Chat from './components/chat';

import './App.css';

export default function App() {
  return (
    <main>
	  <Chat />
      <Buttons bar="side" />
      <Viewport />
    </main>
  )
}