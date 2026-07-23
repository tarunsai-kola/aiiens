const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

module.exports = {
  init: (server) => {
    io = socketIO(server, {
      cors: {
        origin: '*', // Restrict this in production
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      },
    });

    // Middleware for Socket Authentication
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return next(new Error('Authentication error: Invalid token'));
        
        socket.user = decoded;
        // Automatically join a room for this specific hospital
        socket.join(`hospital_${decoded.hospitalId}`);
        
        // If it's a doctor, join a specific doctor room
        if (decoded.role === 'doctor') {
          // Note: In real app, we need to map userId to doctorId, but this room is based on user ID for direct messages
          socket.join(`user_${decoded.id}`);
        }
        
        next();
      });
    });

    io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id} (User: ${socket.user.id})`);
      
      // Allow client to manually join a doctor-specific queue room
      socket.on('join_doctor_queue', (doctorId) => {
        const roomName = `queue_${socket.user.hospitalId}_${doctorId}`;
        socket.join(roomName);
        console.log(`Socket ${socket.id} joined room ${roomName}`);
      });
      
      socket.on('leave_doctor_queue', (doctorId) => {
        const roomName = `queue_${socket.user.hospitalId}_${doctorId}`;
        socket.leave(roomName);
      });

      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });

    return io;
  },
  
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },
};
