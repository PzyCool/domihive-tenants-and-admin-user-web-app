import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useProperties } from './PropertiesContext';

const EMPTY_STATE = {
  rents: {},
  bills: {},
  receipts: [],
  history: []
};

const PaymentsContext = createContext();

export const usePayments = () => {
  const ctx = useContext(PaymentsContext);
  if (!ctx) throw new Error('usePayments must be used within PaymentsProvider');
  return ctx;
};

export const PaymentsProvider = ({ children }) => {
  const { user } = useAuth();
  const { properties } = useProperties();
  const userKey = user?.id || 'guest';
  const paymentsStorageKey = `domihive_payments_${userKey}`;

  const [state, setState] = useState(EMPTY_STATE);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(paymentsStorageKey);
      setState(raw ? JSON.parse(raw) : EMPTY_STATE);
    } catch (_error) {
      setState(EMPTY_STATE);
    }
  }, [paymentsStorageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(paymentsStorageKey, JSON.stringify(state));
    } catch (err) {
      console.error('Error saving payments state', err);
    }
  }, [state, paymentsStorageKey]);

  useEffect(() => {
    if (!properties.length) return;
    setState((prev) => {
      const nextRents = { ...prev.rents };
      let changed = false;

      properties
        .filter((property) => property.tenancyStatus !== 'ENDED')
        .forEach((property) => {
          if (!nextRents[property.propertyId]) {
            nextRents[property.propertyId] = {
              amount: Number(property.rentAmount || 0),
              nextDue: property.nextPayment?.dueDate || '',
              status: property.nextPayment?.status || 'Upcoming'
            };
            changed = true;
          }
        });

      if (!changed) return prev;
      return { ...prev, rents: nextRents };
    });
  }, [properties]);

  const addReceipt = (receipt) => {
    setState((prev) => ({ ...prev, receipts: [receipt, ...prev.receipts] }));
  };

  const addHistory = (entry) => {
    setState((prev) => ({ ...prev, history: [entry, ...prev.history] }));
  };

  const updateRentStatus = (propertyId, status) => {
    setState((prev) => ({
      ...prev,
      rents: {
        ...prev.rents,
        [propertyId]: { ...prev.rents[propertyId], status }
      }
    }));
  };

  const updateBillStatus = (propertyId, billId, status) => {
    setState((prev) => ({
      ...prev,
      bills: {
        ...prev.bills,
        [propertyId]: (prev.bills[propertyId] || []).map((b) =>
          b.id === billId ? { ...b, status } : b
        )
      }
    }));
  };

  const value = useMemo(
    () => ({
      rents: state.rents,
      bills: state.bills,
      receipts: state.receipts,
      history: state.history,
      addReceipt,
      addHistory,
      updateRentStatus,
      updateBillStatus
    }),
    [state]
  );

  return <PaymentsContext.Provider value={value}>{children}</PaymentsContext.Provider>;
};

export default PaymentsContext;
