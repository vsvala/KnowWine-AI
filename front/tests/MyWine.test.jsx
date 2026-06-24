import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MyWine from '../src/components/MyWine';

test('renders content', () => {
  const mywine = {
    name: 'Chablis',
    description: 'A crisp French white wine from Burgundy',
  };

  render(
    <MemoryRouter>
      <MyWine wine={mywine} id={1} deleteWine={() => {}} />
    </MemoryRouter>
  );
  //  screen.debug()
  //  const element = screen.getByText('Component testing is done with react-testing-library')
  // screen.debug(element)

  const element = screen.getByText('Chablis A crisp French white wine from Burgundy');
});
