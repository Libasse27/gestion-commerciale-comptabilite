// ==============================================================================
//           Hook Personnalisé pour la Validation de Formulaire
//
// Ce hook encapsule la logique de validation d'un formulaire. Il prend en entrée
// l'état du formulaire et un objet de configuration des règles de validation,
// et il retourne l'état des erreurs et une fonction pour lancer la validation
// complète.
//
// C'est une alternative légère à des bibliothèques comme Formik ou React Hook Form
// pour les formulaires simples gérés avec `useState`.
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
 *  validateForm: function(): boolean
 * }} Un objet contenant l'état des erreurs et des fonctions pour valider.
 */
function useFormValidator(formState, validationRules) {
  const [errors, setErrors] = useState({});

  /**
   * Valide un seul champ du formulaire.
   * Utilise `useCallback` pour la performance, afin que la fonction ne soit pas
   * recréée à chaque rendu sauf si les dépendances changent.
   *
   * @param {string} fieldName - Le nom du champ à valider.
   * @param {*} value - La valeur du champ à valider.
   */
  const validateField = useCallback((fieldName, value) => {
    const rule = validationRules[fieldName];
    const errorMessage = rule ? rule(value) : undefined;
    
    setErrors(prevErrors => ({
      ...prevErrors,
      [fieldName]: errorMessage,
    }));
  }, [validationRules]);


  /**
   * Valide l'ensemble du formulaire.
   * Utile avant de soumettre le formulaire.
   * @returns {boolean} `true` si le formulaire est valide, sinon `false`.
   */
  const validateForm = useCallback(() => {
    let formIsValid = true;
    const newErrors = {};

    for (const fieldName in validationRules) {
      const rule = validationRules[fieldName];
      const value = formState[fieldName];
      const errorMessage = rule ? rule(value) : undefined;
      
      if (errorMessage) {
        newErrors[fieldName] = errorMessage;
        formIsValid = false;
      }
    }

    setErrors(newErrors);
    return formIsValid;
  }, [formState, validationRules]);


  return {
    errors,
    validateField,
    validateForm,
  };
}

export default useFormValidator;