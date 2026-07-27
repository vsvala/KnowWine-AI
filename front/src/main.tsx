import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';
import { MyWinesProvider } from './context/MyWinesContext.tsx';
import { WineListProvider } from './context/WineListContext.tsx'; 
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <WineListProvider>
            <MyWinesProvider>
              <App />
            </MyWinesProvider>
          </WineListProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  </StrictMode>
);
