import { render, screen } from '@testing-library/react';
import MyWineForm from '../src/pages/MyWineForm';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

test('<MyWineForm /> updates parent state and calls onSubmit', async () => {
  const user = userEvent.setup();
  const addWine = vi.fn();

  render(
    <MemoryRouter>
      <MyWineForm addWine={addWine} />
    </MemoryRouter>
  );
  const input1 = screen.getByLabelText('Name');
  const input2 = screen.getByLabelText('Description');
  const sendButton = screen.getByText('Save');

  await user.type(input1, 'testing a form name..');
  await user.type(input2, 'testing a form description.');
  await user.click(sendButton);

  expect(addWine.mock.calls).toHaveLength(1);
  expect(addWine.mock.calls[0][0].name).toBe('testing a form name..');
  console.log(addWine.mock.calls);
});
