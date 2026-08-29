import { Link } from 'react-router-dom';
import { useMyWinesContext } from '../context/MyWinesContext';
import SearchList from '../components/common/SearchList';
import type { MyWine } from '../types/wine';
import { useMyWineSearch } from '../hooks/useMyWineSearch';
//import { useAuthContext } from '../context/AuthContext';

const MyWines = () => {
  //const [users, setUsers] = useState<User[]>([]);
  // const [user, setUser] = useState('');
  // const { user } = useAuthContext();
  // console.log(user)

  const { myWines } = useMyWinesContext();
  const { searchTerm, setSearchTerm, searchResults } = useMyWineSearch();

  // const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
  //   setSearched(e.target.value);
  // };

  // const filteredWines =
  //   searched.trim() === ''
  //     ? []
  //     : myWines.filter((wine) => {
  //         const lowerSearch = searched.toLowerCase().trim();
  //         return (
  //           wine.name.toLowerCase().includes(lowerSearch) ||
  //           wine.description.toLowerCase().includes(lowerSearch)
  //         );
  //       });

  //  const redWines  =  myWines.filter(wine => wine.type="red")
  //  console.log(redWines)

  //  const whiteWines  =  myWines.filter(wine => wine.type="red")
  //  console.log(redWines)

  //  const sparklingWines  =  myWines.filter(wine => wine.type="red")
  //  console.log(redWines)

  //  const wineRegion  =  myWines.filter(wine => wine.type="red")
  //  console.log(redWines)

  //counrty
  //grapes

  return (
    <div>
      <SearchList<MyWine>
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        results={searchResults}
        itemKey={(wine) => wine.id}
        itemHref={(wine) => `/mywines/${wine.id}`}
        itemLabel={(wine) => wine.name}
      />

      <div className="search-container">
        <h2>My Wines</h2>
        <ul>
          {myWines.map((wine) => (
            <li className="favourite-item" key={wine.id}>
              <Link to={`/mywines/${wine.id}`}>
                <strong>{wine.name}</strong>
              </Link>
              {/* <strong>{wine.name}</strong>: {wine.description}{' '} */}
              {/* <button onClick={() => deleteWine(wine.id)}>Delete</button> */}
            </li>
          ))}
        </ul>
      </div>

      <br />
    </div>
  );
};
export default MyWines;
