import React, { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
//const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:4000';
const URL = 'http://localhost:4000';
const socket = io(URL);

socket.on('connect', () => {
  console.log('Connected to the server');
});	

export default socket;