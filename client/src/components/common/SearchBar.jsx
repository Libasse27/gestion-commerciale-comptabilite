// ==============================================================================
//                Composant de Barre de Recherche Générique
//
// MISE À JOUR : Synchronisation de l'état interne avec les props externes
// et amélioration de l'interface avec des icônes.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { useDebounce } from '../../hooks/useDebounce'; // Assurez-vous que l'import est correct
import { Search, XCircleFill } from 'react-bootstrap-icons';

/**
 * Affiche une barre de recherche avec debounce.
 *
 * @param {object} props - Les propriétés du composant.
 * @param {string} props.value - La valeur actuelle de la recherche (contrôlée par le parent).
 * @param {function(string): void} props.onChange - La fonction pour mettre à jour la valeur dans le parent.
 * @param {function(string): void} props.onSearch - La fonction de callback appelée avec le terme de recherche débattue.
 * @param {string} [props.placeholder='Rechercher...']
 * @param {number} [props.debounceDelay=500]
 * @param {boolean} [props.disabled=false]
 */
const SearchBar = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Rechercher...',
  debounceDelay = 500,
  disabled = false,
}) => {
  
  // Utilise notre hook pour obtenir la valeur débattue du terme de recherche
  const debouncedSearchTerm = useDebounce(value, debounceDelay);

  // Ce `useEffect` se déclenche uniquement lorsque la valeur *débattue* change.
  useEffect(() => {
    // Si la recherche est définie, on l'exécute.
    if (onSearch) {
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, onSearch]);

  const handleClear = () => {
    onChange('');
  };

  return (
    <InputGroup className="mb-3">
      <InputGroup.Text>
        <Search />
      </InputGroup.Text>
      <Form.Control
        type="text"
        placeholder={placeholder}
        value={value} // L'état est maintenant directement contrôlé par le parent
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
      {value && (
        <Button
          variant="light"
          onClick={handleClear}
          className="border"
          title="Effacer la recherche"
        >
          <XCircleFill />
        </Button>
      )}
    </InputGroup>
  );
};

export default SearchBar;