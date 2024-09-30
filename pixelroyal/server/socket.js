const io = require('socket.io')(process.env.PORT || 3000, {
  cors: {
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', (reason) => {
    console.log('A user disconnected:', reason);
  });

  socket.on('join-room', (roomId, userId, userName, avatar) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-joined', userId, userName, avatar);

    socket.on('send-message', (message) => {
      socket.to(roomId).emit('receive-message', userId, message);
    });

    socket.on('drawing', (data) => {
      socket.to(data.roomId).emit('drawing', data);
    });

    socket.on('clear-canvas', (roomId) => {
      socket.to(roomId).emit('clear-canvas');
    });
  });
});

module.exports = io;