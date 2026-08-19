import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useLocation } from '../hooks/useLocation';

const Home = () => {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const { location: place, error: placeError } = useLocation(coords);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      zoom: 0,
      center: [0, 0],
    });

    let cancelled = false;

    map.on('style.load', () => {
      map.setProjection({ type: 'globe' });
      map.setSky({
        'sky-color': '#0000ff',
        'sky-horizon-blend': 1,
        'horizon-color': '#ffffff',
        'horizon-fog-blend': 1,
        'fog-color': '#808080',
        'fog-ground-blend': 1,
      } as maplibregl.SkySpecification);

      // Only fly to the user's location once the globe view is actually in
      // place, so the flight happens smoothly instead of snapping into the
      // globe projection mid-flight.
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (cancelled) return;
            const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
            setCoords(coords);
            map.flyTo({ center: coords, zoom: 2, essential: true });
            new maplibregl.Marker({ color: '#ff0000' }).setLngLat(coords).addTo(map);
          },
          (error) => {
            console.warn('Geolocation unavailable:', error.message);
            setGeoError('Selain ei saanut sijaintiasi.');
          }
        );
      }
    });
    return () => {
      cancelled = true;
      map.remove();
    };
  }, []);

  return (
    <div>
      <div className="App">
        <header>
          <h1>KnowWine AI</h1>
        </header>
      </div>
      Welcome to know wine site... Here you can ..
      <div ref={mapContainer} style={{ width: '100%', height: '500px' }} />
      {coords && place ? (
        <p>{place.city}, {place.country}</p>
      ) : (geoError ?? placeError) ? (
        <p>{geoError ?? placeError}</p>
      ) : null}
    </div>
  );
};

export default Home;
