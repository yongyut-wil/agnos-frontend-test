"use client";

import { useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';

export const useSocket = () => {
  const socket = useMemo(() => io({
    path: '/socket.io',
  }), []);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return socket;
};
