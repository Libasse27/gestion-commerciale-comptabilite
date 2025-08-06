// client/src/store/middleware/errorLoggerMiddleware.js
// ==============================================================================
//           Middleware pour les Effets de Bord Globaux des Erreurs API
//
// Ce middleware écoute toutes les actions qui se terminent par "/rejected"
// (ce qui est la convention pour les échecs des thunks créés avec
// `createAsyncThunk`).
//
// Son rôle est de déclencher des effets de bord globaux, comme l'affichage
// d'une notification "toast" d'erreur, sans que les slices ou les composants
// n'aient à s'en soucier.
// ==============================================================================

import { isRejectedWithValue } from '@reduxjs/toolkit';
// Note : on ne peut pas utiliser le hook `useNotification` ici car les middlewares
// ne sont pas des composants React. L'affichage du toast devra être géré
// par un "listener" dans l'UI ou par une autre méthode.
// Pour la simplicité, nous allons pour l'instant nous contenter de logger l'erreur.

/**
 * Middleware qui intercepte les échecs des thunks.
 */
const errorLoggerMiddleware = (store) => (next) => (action) => {
  // `isRejectedWithValue` est un "type guard" de Redux Toolkit qui vérifie
  // si une action est un échec de thunk et si elle contient un payload.
  if (isRejectedWithValue(action)) {
    console.error('Erreur API Globale Interceptée:', action.payload);

    // --- LOGIQUE DE NOTIFICATION ---
    // C'est ici qu'on pourrait déclencher une notification globale.
    // Exemple :
    // store.dispatch(uiSlice.actions.showErrorToast(action.payload));
  }

  return next(action);
};

export default errorLoggerMiddleware;