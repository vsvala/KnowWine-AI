import { createContext, useContext, type ReactNode } from 'react';
import { useNotifications } from '../hooks/useNotifications';

// Type is inferred from the hook so NotificationContext and useNotifications can't drift apart.
const NotificationContext = createContext<ReturnType<typeof useNotifications> | null>(null);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const notificationState = useNotifications();
  return (
    <NotificationContext.Provider value={notificationState}>
      {children}
    </NotificationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  // null only happens if this is called outside NotificationProvider - fail loudly
  // instead of letting it surface later as a confusing "undefined" crash.
  if (!context) throw new Error('useNotificationContext must be used within NotificationProvider');
  return context;
};
