// ==============================================================================
//           Composant Générique pour Champ de Formulaire (FormField)
//
// MISE À JOUR : Le composant peut maintenant "envelopper" des composants de
// formulaire personnalisés (comme DatePicker, FileUpload) passés en tant
// qu'enfants (`children`), en plus de pouvoir rendre des champs standards.
// ==============================================================================

import React from 'react';
import { Form, InputGroup } from 'react-bootstrap';

/**
 * Un champ de formulaire générique et réutilisable.
 *
 * @param {object} props - Les propriétés.
 * @param {string} props.label - L'étiquette du champ.
 * @param {string} props.name - Le nom du champ.
 * @param {string} [props.error] - Le message d'erreur de validation.
 * @param {string} [props.helpText] - Un texte d'aide sous le champ.
 * @param {React.ReactNode} [props.children] - Un composant de formulaire personnalisé (DatePicker, Select, etc.) à envelopper.
 * @param {string} [props.as='input'] - Le type de contrôle standard à rendre si pas d'enfant ('input', 'textarea').
 * @param {string} [props.type='text'] - Le type de l'input standard.
 * @param {React.ReactNode} [props.icon] - Une icône à afficher.
 */
const FormField = ({
  label,
  name,
  error,
  helpText,
  children, // Pour les composants personnalisés
  as = 'input',
  type = 'text',
  icon,
  ...props // Les autres props (value, onChange, placeholder, etc.) seront passées au contrôle
}) => {
  const isInvalid = !!error;

  const renderControl = () => {
    // --- Cas 1 : Un composant enfant personnalisé est fourni (ex: <DatePicker />) ---
    if (children) {
      // `React.cloneElement` permet d'ajouter des props à l'enfant.
      // On lui passe automatiquement `isInvalid` pour qu'il puisse gérer son style d'erreur.
      return React.cloneElement(children, { isInvalid });
    }

    // --- Cas 2 : Rendu d'un contrôle de formulaire standard ---
    let control;
    if (as === 'textarea') {
      control = <Form.Control as="textarea" {...props} isInvalid={isInvalid} />;
    } else {
      control = <Form.Control type={type} {...props} isInvalid={isInvalid} />;
    }

    // Si une icône est fournie, on l'enveloppe dans un InputGroup
    if (icon) {
      return (
        <InputGroup hasValidation>
          <InputGroup.Text>{icon}</InputGroup.Text>
          {control}
          <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
        </InputGroup>
      );
    }

    return (
      <>
        {control}
        <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
      </>
    );
  };

  return (
    <Form.Group className="mb-3" controlId={name}>
      {label && <Form.Label>{label}</Form.Label>}
      {renderControl()}
      {helpText && <Form.Text className="text-muted">{helpText}</Form.Text>}
    </Form.Group>
  );
};

export default FormField;