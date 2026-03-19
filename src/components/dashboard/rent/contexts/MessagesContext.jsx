import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';

const MessagesContext = createContext();

export const useMessages = () => {
  const ctx = useContext(MessagesContext);
  if (!ctx) throw new Error('useMessages must be used within MessagesProvider');
  return ctx;
};

export const MessagesProvider = ({ children }) => {
  const { user } = useAuth();
  const userKey = user?.id || 'guest';
  const threadsStorageKey = `domihive_message_threads_${userKey}`;
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(threadsStorageKey);
      setThreads(raw ? JSON.parse(raw) : []);
    } catch (_error) {
      setThreads([]);
    }
  }, [threadsStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(threadsStorageKey, JSON.stringify(threads));
    } catch (err) {
      console.error('Error saving message threads', err);
    }
  }, [threads, threadsStorageKey]);

  const addThread = (thread) => {
    setThreads((prev) => [thread, ...prev]);
  };

  const addMessage = (threadId, message) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.threadId === threadId
          ? {
              ...t,
              messages: [...t.messages, message],
              lastMessage: message.text,
              lastUpdatedAt: message.createdAt,
              unreadCount: 0,
              status: message.sender === 'USER' && t.status === 'RESOLVED' ? 'OPEN' : t.status
            }
          : t
      )
    );
  };

  const setStatus = (threadId, status) => {
    setThreads((prev) =>
      prev.map((t) => (t.threadId === threadId ? { ...t, status } : t))
    );
  };

  const markRead = (threadId) => {
    setThreads((prev) =>
      prev.map((t) => (t.threadId === threadId ? { ...t, unreadCount: 0 } : t))
    );
  };

  const value = useMemo(
    () => ({
      threads,
      addThread,
      addMessage,
      setStatus,
      markRead
    }),
    [threads]
  );

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
};

export default MessagesContext;
