import { useNavigate, useParams } from 'react-router-dom';
import { useMyWinesContext } from '../context/MyWinesContext';

const MyWine = () => {
  const { deleteWine, myWines, isLoading } = useMyWinesContext();
  const { id } = useParams();
  //const id = Number(useParams().id);
  const wine = myWines.find((w) => w.id === Number(id));
  const navigate = useNavigate();

  if (isLoading) return <p>Loading wine...</p>;
  if (!wine) return <p>Wine not found.</p>;

  const handleDelete = () => {
    if (window.confirm(`Delete wine "${wine?.name}"?`)) {
      deleteWine(wine.id).then((success) => {
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
