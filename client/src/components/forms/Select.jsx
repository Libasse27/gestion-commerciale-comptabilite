// ==============================================================================
//           Composant de Liste Déroulante (Select)
//
// Ce composant encapsule le `Form.Select` de `react-bootstrap` pour fournir
// une interface simplifiée et réutilisable.
//
// Sa principale fonctionnalité est de générer automatiquement les options
// à partir d'un tableau d'objets `options`, ce qui rend le code des
// formulaires beaucoup plus propre.
// ==============================================================================

import React from 'react';
import { Form } from 'react-bootstrap';

/**
 * @typedef {object} SelectOption
 * @property {string | number} value - La valeur de l'option (ce qui sera sauvegardé).
 * @property {string} label - Le texte de l'option (ce que l'utilisateur voit).
 */

/**
 * Affiche une liste déroulante (`<select>`) à partir d'un tableau d'options.
 *
 * @param {object} props - Les propriétés du composant.
 * @param {string} props.name - Le nom du champ.
 * @param {string | number} props.value - La valeur actuellement sélectionnée.
 * @param {function(React.ChangeEvent<HTMLSelectElement>): void} props.onChange - La fonction appelée lorsque la sélection change.
 * @param {Array<SelectOption>} props.options - Le tableau d'objets pour peupler les options.
 * @param {string} [props.placeholder='Sélectionnez...'] - Le texte de la première option (désactivée).
 * @param {boolean} [props.isInvalid=false] - Pour le style de validation.
 * @param {boolean} [props.disabled=false] - Pour désactiver le champ.
 */
const Select = ({
  name,
  value,
  onChange,
  options,
  placeholder = 'Sélectionnez une option...',
  isInvalid = false,
  disabled = false,
  ...props
}) => {
  return (
    <Form.Select
      name={name}
      value={value}
      onChange={onChange}
      isInvalid={isInvalid}
      disabled={disabled}
      {...props}
    >
      {/* Option de placeholder */}
      {placeholder && <option value="">{placeholder}</option>}

      {/* Génération des options à partir du tableau */}
      {options && options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Form.Select>
  );
};

export default Select;