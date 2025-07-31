// ==============================================================================
//           Hook Personnalisé pour la Validation de Formulaire
//
// Ce hook encapsule la logique de validation d'un formulaire. Il prend en entrée
// l'état du formulaire et un objet de configuration des règles de validation,
// et il retourne l'état des erreurs et une fonction pour lancer la validation
// complète.
//
// C'est une alternative légère à des bibliothèques comme Formik ou React Hook Form
// pour les formulaires gérés avec `useState`.
// ==============================================================================

import { useState, useCallback } from 'react';

/**
 * Hook pour gérer la validation d'un état de formulaire.
 *
 * @param {object} formState - L'état actuel du formulaire (ex: { email: '', password: '' }).
 * @param {object} validationRules - Un objet où les clés sont les noms des champs
 *   et les valeurs sont des fonctions de validation (qui retournent un message d'erreur
 *   ou `undefined`).
 * @returns {{
 *  errors: object,
 *  validateField: function(string, *): void,
 *  validateForm: function(): boolean,
 *  setErrors: function
 * }} Un objet contenant l'état des erreurs et des fonctions pour valider.
 */
export function useFormValidator(formState, validationRules) {
  const [errors, setErrors] = useState({});

  /**
   * Valide un seul champ du formulaire et met à jour l'état des erreurs.
   * Utilise `useCallback` pour la performance.
   *
   * @param {string} fieldName - Le nom du champ à valider.
   * @param {*} value - La valeur du champ à valider.
   */
  const validateField = useCallback((fieldName, value) => {
    if (validationRules[fieldName]) {
      const errorMessage = validationRules[fieldName](value);
      setErrors(prevErrors => ({
        ...prevErrors,
        [fieldName]: errorMessage,
      }));
    }
  }, [validationRules]);


  /**
   * Valide l'ensemble du formulaire, met à jour l'état des erreurs,
   * et retourne si le formulaire est valide.
   * Utile avant de soumettre le formulaire.
   * @returns {boolean} `true` si le formulaire est valide, sinon `false`.
   */
  const validateForm = useCallback(() => {
    let formIsValid = true;
    const newErrors = {};

    for (const fieldName in validationRules) {
      if (Object.prototype.hasOwnProperty.call(validationRules, fieldName)) {
        const rule = validationRules[fieldName];
        const value = formState[fieldName];
        const errorMessage = rule ? rule(value) : undefined;
        
        if (errorMessage) {
          newErrors[fieldName] = errorMessage;
          formIsValid = false;
        }
      }
    }

    setErrors(newErrors);
    return formIsValid;
  }, [formState, validationRules]);


  return {
    errors,
    validateField,
    validateForm,
    setErrors, // Exposer setErrors peut être utile pour réinitialiser les erreurs
  };
}