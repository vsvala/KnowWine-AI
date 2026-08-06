import { useNavigate } from 'react-router-dom'; // useParams,
import { useMyWinesContext } from '../context/MyWinesContext';

type Wine = {
  id: number;
  name: string;
  description: string;
};
interface MyWineProps {
  wine: Wine | null | undefined;
  id: number | undefined;
  isLoading?: boolean;
}

const MyWine = ({ wine, id, isLoading }: MyWineProps) => {
  const { deleteWine } = useMyWinesContext();

  //const id = Number(useParams().id);
  const navigate = useNavigate();
  //const wine = wines.find((w) => w.id === id);

  if (isLoading) return <p>Loading wine...</p>;
  if (!wine) return <p>Wine not found.</p>;

  const handleDelete = () => {
    if (id === undefined) return;
    if (window.confirm(`Delete wine "${wine?.name}"?`)) {
      deleteWine(id).then((success) => {
        if (success) navigate('/mywines');
      });
    }
  };

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
