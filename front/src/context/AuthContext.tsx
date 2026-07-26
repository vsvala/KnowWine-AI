import { createContext, useContext, type ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

// Type is inferred from the hook so AuthContext and useAuth can't drift apart.
const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  // null only happens if this is called outside AuthProvider - fail loudly
  // instead of letting it surface later as a confusing "undefined" crash.
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
};
