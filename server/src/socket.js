const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { get } = require('./config/db');

let io;
const connectedUsers = new Map();

module.exports = {
    init: (server) => {
        const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
            .split(',')
            .map(o => o.trim());

        const isAllowedOrigin = (origin, callback) => {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            if (origin.endsWith('.vercel.app') || origin.includes('localhost')) return callback(null, true);
            return callback(null, true);
        };

        io = socketIo(server, {
            cors: {
                origin: isAllowedOrigin,
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                credentials: true
            }
        });

        io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) return next(new Error('Authentication error'));
                
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await get('SELECT id, name, role FROM users WHERE id = ?', [decoded.id]);
                if (!user) return next(new Error('User not found'));
                
                socket.user = user;
                next();
            } catch (err) {
                next(new Error('Authentication error'));
            }
        });

        io.on('connection', (socket) => {
            console.log(`User connected to socket: ${socket.user.name}`);
            connectedUsers.set(socket.user.id, {
                id: socket.user.id,
                name: socket.user.name,
                role: socket.user.role
            });

            // Broadcast updated presence to all clients
            io.emit('presence:update', Array.from(connectedUsers.values()));

            socket.on('disconnect', () => {
                console.log(`User disconnected from socket: ${socket.user.name}`);
                connectedUsers.delete(socket.user.id);
                io.emit('presence:update', Array.from(connectedUsers.values()));
            });
        });

        return io;
    },
    getIo: () => {
        if (!io) throw new Error('Socket.io not initialized!');
        return io;
    }
};
