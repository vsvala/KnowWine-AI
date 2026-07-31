import { createContext, useContext, type ReactNode } from 'react';
import { useWineList } from '../hooks/useWineList';

const WineListContext = createContext<ReturnType<typeof useWineList> | null>(null);

export const WineListProvider = ({ children }: { children: ReactNode }) => {
  const wineListState = useWineList();
  return <WineListContext.Provider value={wineListState}>{children}</WineListContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWineListContext = () => {
  const context = useContext(WineListContext);
  // null only happens if this is called outside WineListProvider - fail loudly
  // instead of letting it surface later as a confusing "undefined" crash.
  if (!context) throw new Error('useWineListContext must be used within WineListProvider');
  return context;
};
