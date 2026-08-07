import type { ChangeEvent, Key, ReactNode } from 'react';
import { Link } from 'react-router-dom';

export interface SearchListProps<T> {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  results: T[];
  itemKey: (item: T) => Key;
  itemHref: (item: T) => string;//itemHref` resolves the routing difference (`/wines/:id` vs `/mywines/:id`) as a
  itemLabel: (item: T) => ReactNode;
  placeholder?: string; // default 'Search..'
  emptyMessage?: string; // default 'No matching wines found.'
}

const SearchList = <T,>({
  searchTerm,
  onSearchTermChange,
  results,
  itemKey,
  itemHref,
  itemLabel,
  placeholder = 'Search..',
  emptyMessage = 'No matching wines found.',
}: SearchListProps<T>) => {
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchTermChange(e.target.value);
  };
  return (
    <>
      <h2>Search wines</h2>
      <div className="search-container">
        <input type="search" 
        placeholder={placeholder} 
        value={searchTerm} 
        onChange={handleSearch} />
      </div>
      <div className="search-container">
        <p>Search Results:</p>
        <ul>
          {results.map((item) => (
            <li key={itemKey(item)}>
              <Link to={itemHref(item)}>{itemLabel(item)}</Link>
            </li>
          ))}
        </ul>
        {searchTerm.trim() !== '' && results.length === 0 && <p>No matching {emptyMessage}</p>}
      </div>
    </>
  );
};
export default SearchList;
