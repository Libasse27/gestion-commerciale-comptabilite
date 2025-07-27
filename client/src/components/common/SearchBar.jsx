// ==============================================================================
//                Composant de Barre de Recherche Générique
//
// Ce composant fournit une barre de recherche réutilisable avec une gestion
// de "debounce" intégrée.
//
// Le "debounce" permet de ne déclencher la recherche qu'après que
// l'utilisateur a cessé de taper pendant un court instant, ce qui évite de
// surcharger le backend avec une requête à chaque frappe.
//
// Il est conçu comme un composant contrôlé.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import useDebounce from '../../hooks/useDebounce'; // Importation du hook

/**
 * Affiche une barre de recherche avec debounce.
 *
 * @param {object} props - Les propriétés du composant.
 * @param {string} props.initialValue - La valeur initiale de la barre de recherche.
 * @param {function(string): void} props.onSearch - La fonction de callback appelée avec le terme de recherche débattue.
 * @param {string} [props.placeholder='Rechercher...'] - Le texte d'aide affiché dans le champ.
 * @param {number} [props.debounceDelay=500] - Le délai en ms pour le debounce.
 * @param {boolean} [props.isSearching=false] - Si true, peut être utilisé pour afficher un indicateur de chargement.
 */
const SearchBar = ({
  initialValue,
  onSearch,
  placeholder = 'Rechercher...',
  debounceDelay = 500,
  isSearching = false,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  
  // Utilise notre hook pour obtenir la valeur débattue du terme de recherche
  const debouncedSearchTerm = useDebounce(searchTerm, debounceDelay);

  // Ce `useEffect` se déclenche uniquement lorsque la valeur *débattue* change.
  useEffect(() => {
    // On appelle la fonction de recherche du parent avec la valeur stabilisée.
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <InputGroup className="mb-3">
      <Form.Control
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        disabled={isSearching}
      />
      {searchTerm && (
        <InputGroup.Text
          onClick={handleClear}
          style={{ cursor: 'pointer' }}
          title="Effacer la recherche"
        >
          × {/* Le caractère de la croix */}
        </InputGroup.Text>
      )}
    </InputGroup>
  );
};

export default SearchBar;