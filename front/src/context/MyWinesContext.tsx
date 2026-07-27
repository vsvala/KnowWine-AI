import { createContext, useContext, type ReactNode } from 'react';
import { useMyWines } from '../hooks/useMyWines';

const MyWinesContext = createContext<ReturnType<typeof useMyWines> | null>(null);

export const MyWinesProvider = ({ children }: { children: ReactNode }) => {
  const myWinesState = useMyWines();
  return (
    <MyWinesContext.Provider value={myWinesState}>
      {children}
    </MyWinesContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useMyWinesContext = () => {
  const context = useContext(MyWinesContext);
  // null only happens if this is called outside MyWinesProvider - fail loudly
  // instead of letting it surface later as a confusing "undefined" crash.
  if (!context) throw new Error('useMyWinesContext must be used within MyWinesProvider');
  return context;
};
