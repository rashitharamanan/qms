import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(window.location.origin.replace('5173', '5000') || 'http://localhost:5000');
      setSocket(newSocket);
      // Join user-specific room for notifications
      newSocket.on('connect', () => {
        newSocket.emit('join-user', user.id);
      });
      return () => {
        newSocket.emit('leave-user', user.id);
        newSocket.close();
      };
    }
  }, [user]);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
