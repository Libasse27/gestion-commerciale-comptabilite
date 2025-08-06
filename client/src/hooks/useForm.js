// client/src/hooks/useForm.js
// ==============================================================================
//                  Hook Personnalisé : useForm
//
// Simplifie la gestion de l'état, de la validation et de la soumission pour
// les formulaires contrôlés en React.
// ==============================================================================

import { useState, useCallback } from 'react';

export const useForm = ({ initialValues, onSubmit, validators }) => {
  const [values, setValues] = useState(initialValues || {});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback(() => {
    if (!validators) return true;
    const newErrors = {};
    let isValid = true;

    for (const key in validators) {
      const validator = validators[key];
      const error = validator(values[key], values);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    }
    setErrors(newErrors);
    return isValid;
  }, [validators, values]);
  
  const handleChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setValues(prevValues => ({
      ...prevValues,
      [name]: fieldValue,
    }));
  }, []);

  const handleSubmit = useCallback(async (event) => {
    if (event) event.preventDefault();
    if (validate()) {
      setIsSubmitting(true);
      await onSubmit(values);
      setIsSubmitting(false);
    }
  }, [onSubmit, validate, values]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setValues,
    setErrors
  };
};