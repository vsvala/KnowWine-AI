import { scan } from "react-scan";
if (import.meta.env.DEV) {
  scan();
}
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';
import { WineListProvider } from './context/WineListContext.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <NotificationProvider>
            <WineListProvider>
              <App />
            </WineListProvider>
          </NotificationProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  </StrictMode>
);
