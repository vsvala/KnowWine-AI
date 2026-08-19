import getLocationService from '../services/location';

import { useEffect, useState } from 'react';
type PlaceProperties = {
  city?: string;
  name?: string;
  country?: string;
  state?: string;
  countrycode?: string;
  [key: string]: unknown;
};

export const useLocation = (coords: [number, number] | null | undefined) => {
  const [location, setLocation] = useState<PlaceProperties | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      if (!coords) return;
      setError(null);
      try {
        const data = await getLocationService.getLocation(coords);
        const properties = data?.features?.[0]?.properties;
        if (!properties) {
          setError('Paikkaa ei löytynyt näille koordinaateille.');
          return;
        }
        setLocation(properties);
      } catch (error) {
        console.error('Error fetching place name:', error);
        setError('Sijaintia ei saatu haettua juuri nyt.');
      }
    };
    fetchLocation();
  }, [coords]);

  return { location, error };
};
