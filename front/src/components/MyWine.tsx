import { useNavigate } from 'react-router-dom'; // useParams,
type Wine = {
  id: number;
  name: string;
  description: string;
};
interface MyWinesProps {
  wine: Wine | null | undefined;
  deleteWine: (id: number) => void;
  id: number | undefined;
}

const MyWine = ({ wine, id, deleteWine }: MyWinesProps) => {
  //const id = Number(useParams().id);
  const navigate = useNavigate();
  //const wine = wines.find((w) => w.id === id);

  const handleDelete = () => {
    if (id === undefined) return;
    if (window.confirm(`Delete wine "${wine?.name}"?`)) {
      deleteWine(id);
      navigate('/mywines');
    }
  };
  if (!wine) return <p>Wine not found.</p>;

  return (
    <li className="wine">
      <span>
        {wine.name} {wine.description}
      </span>
      <button onClick={handleDelete}>Delete</button>
    </li>
  );
};

export default MyWine;
