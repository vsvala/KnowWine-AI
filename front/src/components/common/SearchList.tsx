import type { ChangeEvent, Key, ReactNode } from 'react';
import { Link } from 'react-router-dom';

export interface SearchListProps<T> {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  results: T[];
  itemKey: (item: T) => Key;
  itemHref: (item: T) => string;
  itemLabel: (item: T) => ReactNode;
  placeholder?: string; // default 'Search..'
  emptyMessage?: string; // default 'No matching wines found.'
  onSubmit?: () => void; // if provided, results only update on submit (Enter / Search button) instead of live-as-you-type
  hasSearched?: boolean; // defaults to searchTerm.trim() !== '' for live-filter callers
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
  onSubmit,
  hasSearched = searchTerm.trim() !== '',
}: SearchListProps<T>) => {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => onSearchTermChange(e.target.value);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.();
  };

  return (
    <>
      <h2>Search wines</h2>
      <form className="search-container" onSubmit={handleSubmit}>
        <input type="search" placeholder={placeholder} value={searchTerm} onChange={handleChange} />
        {onSubmit && <button type="submit">Search</button>}
      </form>
      <div className="search-container">
        <p>Search Results</p>
        <ul>
          {results.map((item) => (
            <li key={itemKey(item)}>
              <Link to={itemHref(item)}>{itemLabel(item)}</Link>
            </li>
          ))}
        </ul>
        {hasSearched && results.length === 0 && <p>{emptyMessage}</p>}
      </div>
    </>
  );
};

export default SearchList;
