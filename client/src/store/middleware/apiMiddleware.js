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
//   - Découple complètement les slices de la logique d'appel API.
//   - Centralise la gestion des erreurs et des états de chargement.
//   - Rend les slices plus simples et plus faciles à tester.
// ==============================================================================

import apiClient from '../../services/api';
import { apiCallBegan, apiCallSuccess, apiCallFailed } from '../actions/apiActions'; // Actions génériques
import { getErrorMessage } from '../../utils/helpers';

const apiMiddleware = ({ dispatch }) => (next) => async (action) => {
  // 1. Vérifier si l'action interceptée est bien notre action `apiCallBegan`.
  if (action.type !== apiCallBegan.type) {
    // Si ce n'est pas le cas, on la laisse passer au prochain middleware ou au reducer.
    return next(action);
  }

  // Laisse l'action `apiCallBegan` passer (utile pour les outils de débogage Redux).
  next(action);

  // 2. Extraire les informations de l'appel API depuis le payload de l'action.
  const {
    url,
    method = 'GET',
    data = null,
    onStart,    // Le nom de l'action à dispatcher au début (ex: 'clients/clientsRequested')
    onSuccess,  // Le nom de l'action à dispatcher en cas de succès
    onError,    // Le nom de l'action à dispatcher en cas d'échec
  } = action.payload;

  // 3. Dispatcher l'action de début de chargement, si elle est définie.
  if (onStart) {
    dispatch({ type: onStart });
  }

  try {
    // 4. Effectuer la requête HTTP avec notre client Axios.
    const response = await apiClient.request({
      url,
      method,
      data,
    });

    // 5. En cas de succès :
    //    a) Dispatcher l'action de succès générique.
    dispatch(apiCallSuccess(response.data));
    //    b) Dispatcher l'action de succès spécifique au slice.
    if (onSuccess) {
      dispatch({ type: onSuccess, payload: response.data });
    }

  } catch (error) {
    // 6. En cas d'échec :
    const errorMessage = getErrorMessage(error);
    //    a) Dispatcher l'action d'échec générique.
    dispatch(apiCallFailed(errorMessage));
    //    b) Dispatcher l'action d'échec spécifique au slice.
    if (onError) {
      dispatch({ type: onError, payload: errorMessage });
    }
  }
};

export default apiMiddleware;