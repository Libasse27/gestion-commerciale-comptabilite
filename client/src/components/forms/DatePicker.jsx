// ==============================================================================
//           Composant de Sélection de Date (DatePicker)
//
// Ce composant encapsule la bibliothèque `react-datepicker` pour fournir une
// interface de sélection de date cohérente et stylée avec Bootstrap.
//
// Il est conçu pour être utilisé avec notre composant `FormField` pour une
// intégration transparente dans les formulaires.
// ==============================================================================

import React from 'react';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import { Form, InputGroup } from 'react-bootstrap';
import { CalendarEventFill } from 'react-bootstrap-icons';

// Importation de la locale française pour afficher le calendrier en français
import { fr } from 'date-fns/locale/fr';
registerLocale('fr', fr);

/**
 * Un champ de saisie de date avec un calendrier popup.
 *
 * @param {object} props - Les propriétés.
 * @param {Date | null} props.selected - La date actuellement sélectionnée.
 * @param {function(Date): void} props.onChange - La fonction appelée quand la date change.
 * @param {string} [props.placeholderText] - Le texte d'aide dans le champ.
 * @param {boolean} [props.isInvalid=false] - Pour le style de validation.
 * @param {boolean} [props.disabled=false] - Pour désactiver le champ.
 */
const DatePicker = ({
  selected,
  onChange,
  placeholderText,
  isInvalid,
  disabled,
  ...props
}) => {

  // Composant personnalisé pour le champ de saisie, pour qu'il ressemble à un champ Bootstrap
  const CustomInput = React.forwardRef(({ value, onClick }, ref) => (
    <InputGroup>
      <InputGroup.Text><CalendarEventFill /></InputGroup.Text>
      <Form.Control
        value={value}
        onClick={onClick}
        ref={ref}
        placeholder={placeholderText}
        isInvalid={isInvalid}
        readOnly // Empêche la saisie manuelle pour forcer l'utilisation du calendrier
      />
    </InputGroup>
  ));

  return (
    <ReactDatePicker
      selected={selected}
      onChange={onChange}
      locale="fr" // Calendrier en français
      dateFormat="dd/MM/yyyy" // Format d'affichage de la date
      className="form-control" // Permet à react-bootstrap de le styler
      customInput={<CustomInput />}
      disabled={disabled}
      {...props}
    />
  );
};

export default DatePicker;