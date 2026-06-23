import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const Home = () => {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      zoom: 0,
      center: [0, 0],
    });

    map.on('style.load', () => {
      map.setProjection({ type: 'globe' });
      map.setSky({
        'sky-color': '#0000ff',
        'sky-horizon-blend': 5,
        'horizon-color': '#ffffff',
        'horizon-fog-blend': 10,
        'fog-color': '#808080',
        'fog-ground-blend': 20,
      } as maplibregl.SkySpecification);
    });

    return () => map.remove();
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
    </div>
  );
};

export default Home;
