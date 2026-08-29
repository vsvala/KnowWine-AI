import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AxiosError } from 'axios';
import Users from '../src/pages/Users';
import { NotificationProvider } from '../src/context/NotificationContext';
import userServise from '../src/services/users';

vi.mock('../src/services/users');
const renderUsers = () =>
  render(
    <MemoryRouter initialEntries={['/users']}>
      <NotificationProvider>
        <Routes>
          <Route path="/users" element={<Users />} />
          <Route path="/" element={<div>Home page</div>} />
        </Routes>
      </NotificationProvider>
    </MemoryRouter>
  );

test('renders the user list on success', async () => {
  userServise.getAll.mockResolvedValue([
    { id: 1, name: 'Test User' },
    { id: 2, name: 'Second User' },
  ]);

  renderUsers();

  expect(await screen.findByText('Test User')).toBeInTheDocument();
  expect(screen.getByText('Second User')).toBeInTheDocument();
});

test('redirects to home when the backend returns 403', async () => {
  const error = new AxiosError('Forbidden');
  error.response = { status: 403, data: { error: 'forbidden' } };
  userServise.getAll.mockRejectedValue(error);

  renderUsers();

  expect(await screen.findByText('Home page')).toBeInTheDocument();
});
//npx vitest run tests/Users.test.jsx
