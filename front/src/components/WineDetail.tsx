import type { Wine } from '../types/wine';

interface WineDetailProps {
  wine: Wine | null | undefined;
}

const WineDetail = ({ wine }: WineDetailProps) => {
  if (!wine) return <p>Wine not found.</p>;

  return (
    <div className="wine-detail">
      <h2>{wine.display_name}</h2>
      <ul>
        <li>Type: {wine.type}</li>
        <li>Subtype: {wine.sub_type}</li>
        <li>Color: {wine.color}</li>
        {wine.residual_sugar && <li>Residual sugar: {wine.residual_sugar}</li>}
        <li>Producer: {wine.producer.display_name}</li>
        {wine.region && <li>Region: {wine.region}</li>}
      </ul>
    </div>
  );
};

export default WineDetail;
