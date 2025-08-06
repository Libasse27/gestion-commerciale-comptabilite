// client/src/hooks/useFormValidator.js
// ==============================================================================
//           Hook Personnalisé pour la Validation de Formulaire
// ==============================================================================

import { useState, useCallback } from 'react';

/**
 * Hook pour gérer la validation d'un état de formulaire.
 *
 * @param {object} validationRules - L'objet de configuration des règles de validation.
 * @returns {{
 *  errors: object,
 *  validate: function(object): boolean
 * }}
 */
function useFormValidator(validationRules) {
  const [errors, setErrors] = useState({});

  /**
   * Valide l'ensemble du formulaire.
   * @param {object} formState - L'état actuel du formulaire à valider.
   * @returns {boolean} `true` si le formulaire est valide.
   */
  const validate = useCallback((formState) => {
    let formIsValid = true;
    const newErrors = {};

    for (const fieldName in validationRules) {
      const rule = validationRules[fieldName];
      const value = formState[fieldName];
      const errorMessage = rule ? rule(value, formState) : undefined; // Passe aussi le state complet
      
      if (errorMessage) {
        newErrors[fieldName] = errorMessage;
        formIsValid = false;
      }
    }

    setErrors(newErrors);
    return formIsValid;
  }, [validationRules]);


  return {
    errors,
    validate,
    setErrors // Exposer setErrors pour des cas d'usage avancés (ex: erreurs serveur)
  };
}

export default useFormValidator;