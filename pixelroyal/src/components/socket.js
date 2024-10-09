import { io } from 'socket.io-client';

let wsp;

if (location.protocol == "http:") {
	wsp = "ws://";
} else if (location.protocol == "https:") {
	wsp = "wss://";
}

const URL = wsp + location.hostname + ':4000';
const socket = io(URL);

socket.on('connect', () => {
  console.log('Connected to the server');
});	

export default socket;