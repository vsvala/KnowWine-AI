import { render, screen } from '@testing-library/react';
import MyWineForm from '../src/pages/MyWineForm';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { MyWinesProvider } from '../src/context/MyWinesContext';
import { NotificationProvider } from '../src/context/NotificationContext';
import { AuthProvider } from '../src/context/AuthContext';
import myWineService from '../src/services/myWines';

vi.mock('../src/services/myWines');

test('<MyWineForm /> updates parent state and calls onSubmit', async () => {
  window.localStorage.setItem('loggedWineappUser', JSON.stringify({ token: 'test-token' }));
  myWineService.getAll.mockResolvedValue([]);
  myWineService.create.mockResolvedValue({
    id: 2,
    name: 'testing a form name..',
    description: 'testing a form description.',
  });
  
  const user = userEvent.setup();

  render(
    <MemoryRouter>
      <AuthProvider>
        <NotificationProvider>
          <MyWinesProvider>
            <MyWineForm />
          </MyWinesProvider>
        </NotificationProvider>
      </AuthProvider>
    </MemoryRouter>
  );
  const input1 = screen.getByLabelText('Name');
  const input2 = screen.getByLabelText('Description');
  const sendButton = screen.getByText('Save');

  await user.type(input1, 'testing a form name..');
  await user.type(input2, 'testing a form description.');
  await user.click(sendButton);

  expect(myWineService.create.mock.calls).toHaveLength(1);
  expect(myWineService.create.mock.calls[0][0].name).toBe('testing a form name..');
});
