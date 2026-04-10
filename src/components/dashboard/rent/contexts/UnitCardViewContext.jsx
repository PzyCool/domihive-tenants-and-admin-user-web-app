import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const VIEW_STORAGE_KEY = 'domihive_unit_card_view_mode';
const VALID_VIEWS = new Set(['list', 'grid']);

const UnitCardViewContext = createContext(null);

const readStoredView = () => {
  try {
    const stored = String(localStorage.getItem(VIEW_STORAGE_KEY) || '').toLowerCase();
    return VALID_VIEWS.has(stored) ? stored : 'list';
  } catch {
    return 'list';
  }
};

export const UnitCardViewProvider = ({ children }) => {
  const [viewType, setViewTypeState] = useState(() => readStoredView());

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, viewType);
    } catch {
      // Ignore storage write failures.
    }
  }, [viewType]);

  const setViewType = (nextView) => {
    const normalized = String(nextView || '').toLowerCase();
    if (VALID_VIEWS.has(normalized)) {
      setViewTypeState(normalized);
    }
  };

  const value = useMemo(
    () => ({
      viewType,
      setViewType,
      isGrid: viewType === 'grid',
      isList: viewType === 'list'
    }),
    [viewType]
  );

  return <UnitCardViewContext.Provider value={value}>{children}</UnitCardViewContext.Provider>;
};

export const useUnitCardView = () => {
  const context = useContext(UnitCardViewContext);
  if (!context) {
    throw new Error('useUnitCardView must be used within UnitCardViewProvider');
  }
  return context;
};

