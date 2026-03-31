import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5001';

export const useSocket = (events: Record<string, (...args: any[]) => void>) => {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        socketRef.current = io(SOCKET_URL, {
            withCredentials: true
        });

        // Register event listeners
        Object.entries(events).forEach(([event, handler]) => {
            socketRef.current?.on(event, handler);
        });

        return () => {
            // Cleanup on unmount
            if (socketRef.current) {
                Object.keys(events).forEach((event) => {
                    socketRef.current?.off(event);
                });
                socketRef.current.disconnect();
            }
        };
    }, []); // Hook only runs on mount/unmount. Handlers must be stable (use useCallback) or we can ignore stale closures if logic is simple 

    return socketRef.current;
};
