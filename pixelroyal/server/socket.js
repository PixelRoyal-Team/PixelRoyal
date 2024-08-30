import { Server } from 'http'; 


import { httpServer } from './server.js'; // Replace './server.js' with the correct path

// Create a Socket.IO server
const io = new Server(httpServer);


io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle incoming messages named 'message'
  socket.on('message', (data) => {
    console.log('Received message:', data);

    // Broadcast the message to all connected clients (except the sender)
    socket.broadcast.emit('message', data);
  });

  // Handle client disconnections
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});