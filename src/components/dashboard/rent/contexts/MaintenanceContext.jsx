import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';

const MaintenanceContext = createContext();

export const useMaintenance = () => {
  const ctx = useContext(MaintenanceContext);
  if (!ctx) throw new Error('useMaintenance must be used within MaintenanceProvider');
  return ctx;
};

export const MaintenanceProvider = ({ children }) => {
  const { user } = useAuth();
  const userKey = user?.id || 'guest';
  const ticketsStorageKey = `domihive_maintenance_tickets_${userKey}`;
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ticketsStorageKey);
      setTickets(raw ? JSON.parse(raw) : []);
    } catch (_error) {
      setTickets([]);
    }
  }, [ticketsStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(ticketsStorageKey, JSON.stringify(tickets));
    } catch (err) {
      console.error('Error saving maintenance tickets', err);
    }
  }, [tickets, ticketsStorageKey]);

  const addTicket = (ticket) => {
    setTickets((prev) => [{ ...ticket, ticketId: `MT-${Date.now()}` }, ...prev]);
  };

  const updateTicket = (ticketId, changes) => {
    setTickets((prev) =>
      prev.map((t) => (t.ticketId === ticketId ? { ...t, ...changes } : t))
    );
  };

  const addUpdate = (ticketId, update) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.ticketId === ticketId ? { ...t, updates: [...(t.updates || []), update] } : t
      )
    );
  };

  const value = useMemo(
    () => ({
      tickets,
      addTicket,
      updateTicket,
      addUpdate
    }),
    [tickets]
  );

  return <MaintenanceContext.Provider value={value}>{children}</MaintenanceContext.Provider>;
};

export default MaintenanceContext;
