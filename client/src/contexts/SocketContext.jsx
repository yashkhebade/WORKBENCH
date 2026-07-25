import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (user && token) {
      const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') : '/';
      const newSocket = io(socketUrl, {
        auth: { token }
      });

      newSocket.on('presence:update', (users) => {
        setOnlineUsers(users);
      });

      setSocket(newSocket);

      return () => newSocket.close();
    } else if (socket) {
      socket.close();
      setSocket(null);
    }
  }, [user, token]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
