import { Server } from 'socket.io';

let io;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: [
                'http://localhost:5173',
                'http://localhost:5174',
                process.env.FRONTEND_URL
            ].filter(Boolean),
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log(`Socket client connected: ${socket.id}`);

        socket.on('disconnect', () => {
             console.log(`Socket client disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
