import { render, screen } from '@testing-library/react';
import Home from '../src/pages/Home';
import getLocationService from '../src/services/location';

vi.mock('../src/services/location');

vi.mock('maplibre-gl', () => {
  class MockMap {
    on(event, cb) {
      if (event === 'style.load') cb();
    }
    setProjection() {}
    setSky() {}
    flyTo() {}
    remove() {}
  }
  class MockMarker {
    setLngLat() {
      return this;
    }
    addTo() {
      return this;
    }
  }
  return { default: { Map: MockMap, Marker: MockMarker } };
});

const mockGeolocation = (getCurrentPosition) => {
  Object.defineProperty(global.navigator, 'geolocation', {
    value: { getCurrentPosition },
    configurable: true,
  });
};

test('shows the reverse-geocoded place name once geolocation succeeds', async () => {
  mockGeolocation((success) => {
    success({ coords: { latitude: 60.17, longitude: 24.94 } });
  });
  getLocationService.getLocation.mockResolvedValue({
    features: [{ properties: { city: 'Helsinki', country: 'Finland' } }],
  });

  render(<Home />);

  const place = await screen.findByText('Helsinki, Finland');
  expect(place).toBeInTheDocument();
});

test('shows a fallback message when geolocation permission is denied', async () => {
  mockGeolocation((_success, error) => {
    error({ message: 'User denied Geolocation' });
  });

  render(<Home />);

  const message = await screen.findByText('Selain ei saanut sijaintiasi.');
  expect(message).toBeInTheDocument();
});

test('shows a fallback message when reverse geocoding fails', async () => {
  mockGeolocation((success) => {
    success({ coords: { latitude: 60.17, longitude: 24.94 } });
  });
  getLocationService.getLocation.mockRejectedValue(new Error('Photon down'));

  render(<Home />);

  const message = await screen.findByText('Sijaintia ei saatu haettua juuri nyt.');
  expect(message).toBeInTheDocument();
});
