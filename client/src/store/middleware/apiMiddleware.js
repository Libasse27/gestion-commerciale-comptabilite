// ==============================================================================
//           Middleware Redux pour la Gestion Centralisée des Appels API
//
// Ce middleware intercepte une action `apiCallBegan` et gère le cycle de vie
// complet d'une requête HTTP :
//   1. Déclenche une action de début de chargement (ex: `clients/fetchStart`).
//   2. Effectue l'appel API en utilisant notre client Axios (`apiClient`).
//   3. En cas de succès, déclenche une action de succès avec les données reçues
//      (ex: `clients/fetchSuccess`).
//   4. En cas d'échec, déclenche une action d'échec avec le message d'erreur
//      (ex: `clients/fetchFailed`).
//
// Avantages :
//   - Découple les slices de la logique d'appel API.
//   - Centralise la gestion des erreurs et des états de chargement.
// ==============================================================================

import apiClient from '../../services/api';
import { apiCallBegan } from '../actions/apiActions';
import { getErrorMessage } from '../../utils/helpers';

const apiMiddleware = ({ dispatch }) => (next) => async (action) => {
  // 1. Vérifier si l'action interceptée est bien notre action `apiCallBegan`.
  if (action.type !== apiCallBegan.type) {
    // Si ce n'est pas le cas, on la laisse passer au prochain middleware ou au reducer.
    return next(action);
  }

  // 2. Extraire les informations de l'appel API depuis le payload de l'action.
  const {
    url,
    method = 'GET',
    data = null,
    onStart, // Le nom de l'action à dispatcher au début (ex: 'clients/fetchStart')
    onSuccess, // Le nom de l'action à dispatcher en cas de succès
    onError, // Le nom de l'action à dispatcher en cas d'échec
  } = action.payload;

  // 3. Dispatcher l'action de début de chargement, si elle est définie.
  if (onStart) {
    dispatch({ type: onStart });
  }

  // Laisse l'action `apiCallBegan` passer (utile pour le débogage).
  next(action);

  try {
    // 4. Effectuer la requête HTTP avec notre client Axios.
    const response = await apiClient.request({
      url,
      method,
      data,
    });

    // 5. En cas de succès, dispatcher l'action de succès avec les données de la réponse.
    dispatch({ type: onSuccess, payload: response.data });

  } catch (error) {
    // 6. En cas d'échec, dispatcher l'action d'échec avec un message d'erreur clair.
    const errorMessage = getErrorMessage(error);
    dispatch({ type: onError, payload: errorMessage });
  }
};

export default apiMiddleware;