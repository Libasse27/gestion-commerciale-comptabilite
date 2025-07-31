// ==============================================================================
//                  Hook Personnalisé : useApi
//
// Ce hook simplifie les appels API en gérant automatiquement les états
// de chargement, d'erreur et de données.
//
// Il est conçu pour être utilisé de deux manières :
//  1. En fournissant une fonction API à `apiFunc` pour un appel automatique
//     au montage du composant (typiquement pour les requêtes GET).
//  2. En ne fournissant pas `apiFunc` pour un appel manuel via la fonction
//     `request` retournée (typiquement pour les requêtes POST, PATCH, etc.).
// ==============================================================================

import { useState, useCallback, useEffect } from 'react';
import { getErrorMessage } from '../utils/helpers';

/**
 * Hook personnalisé pour gérer les cycles de vie des appels API.
 * @param {function} [apiFunc] - (Optionnel) La fonction de service API à appeler automatiquement.
 * @returns {{
 *  data: any | null,
 *  error: string | null,
 *  isLoading: boolean,
 *  request: function
 * }} Un objet contenant les données, l'erreur, l'état de chargement et la fonction pour lancer la requête.
 */
export const useApi = (apiFunc) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * La fonction principale qui exécute l'appel API.
   * Elle est enveloppée dans `useCallback` pour la performance.
   */
  const request = useCallback(async (...args) => {
    setIsLoading(true);
    setError(null);
    try {
      // Si la fonction API a été passée en argument du hook, on l'utilise.
      // Sinon, on attend qu'elle soit passée en argument de `request`.
      const funcToCall = apiFunc || args[0];
      const params = apiFunc ? args : args.slice(1);
      
      const result = await funcToCall(...params);
      setData(result.data); // On suppose une réponse Axios où les données sont dans `result.data`
      return result.data; // On retourne les données pour une gestion en chaîne (.then)
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      throw err; // On propage l'erreur pour que le code appelant puisse la gérer aussi
    } finally {
      setIsLoading(false);
    }
  }, [apiFunc]);


  // Si `apiFunc` est fourni, on l'exécute au montage du composant.
  useEffect(() => {
    if (apiFunc) {
      request();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiFunc]); // `request` n'est pas inclus pour éviter une boucle infinie


  return { data, error, isLoading, request };
};