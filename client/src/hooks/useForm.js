// ==============================================================================
//                  Hook Personnalisé : useForm
//
// Ce hook simplifie la gestion de l'état, de la validation et de la
// soumission pour les formulaires contrôlés en React.
//
// Il est conçu pour être une alternative légère à des bibliothèques plus
// complexes comme React Hook Form ou Formik, idéal pour les formulaires
// simples à moyens.
//
// Caractéristiques :
//   - Gère l'état des valeurs du formulaire.
//   - Gère l'état des erreurs de validation par champ.
//   - Fournit un `handleChange` générique.
//   - Gère la soumission du formulaire et la validation complète.
// ==============================================================================

import { useState, useCallback } from 'react';

/**
 * Hook personnalisé pour gérer les formulaires.
 * @param {object} options
 * @param {object} options.initialValues - Les valeurs initiales du formulaire.
 * @param {function} options.onSubmit - La fonction à appeler lors de la soumission du formulaire valide.
 * @param {object} [options.validators] - Un objet où les clés sont les noms des champs et les valeurs sont les fonctions de validation.
 * @returns {{
 *   values: object,
 *   errors: object,
 *   isSubmitting: boolean,
 *   handleChange: function,
 *   handleSubmit: function,
 *   setValues: function
 * }}
 */
export const useForm = ({ initialValues, onSubmit, validators }) => {
  const [values, setValues] = useState(initialValues || {});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Valide tous les champs du formulaire.
   * @returns {boolean} `true` si le formulaire est valide.
   */
  const validate = useCallback(() => {
    if (!validators) return true;

    const newErrors = {};
    let isValid = true;

    for (const key in validators) {
      const validator = validators[key];
      const error = validator(values[key], values); // Passe toutes les valeurs pour les validations dépendantes
      
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [validators, values]);

  /**
   * Gère le changement de valeur d'un champ de formulaire.
   */
  const handleChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setValues(prevValues => ({
      ...prevValues,
      [name]: fieldValue,
    }));
  }, []);

  /**
   * Gère la soumission du formulaire.
   */
  const handleSubmit = useCallback(async (event) => {
    if (event) event.preventDefault();
    setIsSubmitting(true);

    if (validate()) {
      await onSubmit(values);
    }

    setIsSubmitting(false);
  }, [onSubmit, validate, values]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setValues, // Expose setValues pour des mises à jour manuelles si nécessaire
  };
};