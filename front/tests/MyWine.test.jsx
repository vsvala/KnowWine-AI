import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import MyWine from '../src/components/MyWine';
import { AuthProvider } from '../src/context/AuthContext';
import { NotificationProvider } from '../src/context/NotificationContext';
import { MyWinesProvider } from '../src/context/MyWinesContext';
import myWineService from '../src/services/myWines';

vi.mock('../src/services/myWines');

test('renders content', async () => {
  window.localStorage.setItem('loggedWineappUser', JSON.stringify({ token: 'test-token' }));
  myWineService.getAll.mockResolvedValue([
    { id: 1, name: 'Chablis', description: 'A crisp French white wine from Burgundy' },
  ]);

  render(
    <MemoryRouter initialEntries={['/mywines/1']}>
      <AuthProvider>
        <NotificationProvider>
          <MyWinesProvider>
            <Routes>
              <Route path="/mywines/:id" element={<MyWine />} />
            </Routes>
          </MyWinesProvider>
        </NotificationProvider>
      </AuthProvider>
    </MemoryRouter>
  );

  const element = await screen.findByText('Chablis A crisp French white wine from Burgundy');
  expect(element).toBeInTheDocument();
});
