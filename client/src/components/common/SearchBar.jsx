// client/src/components/common/SearchBar.jsx
import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { useDebounce } from '../../hooks/useDebounce';
import { Search, XCircle } from 'react-bootstrap-icons';
import { UI_SETTINGS } from '../../utils/constants';

/**
 * Affiche une barre de recherche avec debounce.
 * @param {{
 *  onSearch: (term: string) => void,
 *  placeholder?: string,
 *  initialValue?: string
 * }} props
 */
const SearchBar = ({
  onSearch,
  placeholder = 'Rechercher...',
  initialValue = '',
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const debouncedSearchTerm = useDebounce(searchTerm, UI_SETTINGS.DEFAULT_DEBOUNCE_DELAY);

  useEffect(() => {
    // Déclencher la recherche uniquement si la valeur débattue change
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <InputGroup>
      <InputGroup.Text>
        <Search />
      </InputGroup.Text>
      <Form.Control
        type="search"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm && (
        <Button
          variant="light"
          onClick={handleClear}
          className="border"
          aria-label="Effacer la recherche"
        >
          <XCircle />
        </Button>
      )}
    </InputGroup>
  );
};

export default SearchBar;