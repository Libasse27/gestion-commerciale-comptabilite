// ==============================================================================
//           Configuration du Store Redux Principal de l'Application
//
// Ce fichier est le point central de la configuration de Redux Toolkit.
// Il est responsable de :
//   - L'assemblage de tous les reducers via le `rootReducer`.
//   - L'ajout des middlewares personnalisés (pour les appels API, l'auth, etc.)
//     à la chaîne de middlewares par défaut.
//   - La création et l'exportation du "store" Redux unique qui sera
//     utilisé dans toute l'application.
//
// `configureStore` de Redux Toolkit simplifie ce processus en incluant par
// défaut des outils utiles comme Redux Thunk et les Redux DevTools.
// ==============================================================================

import { configureStore } from '@reduxjs/toolkit';

// --- Importation des pièces du puzzle ---
import rootReducer from './rootReducer';
import apiMiddleware from './middleware/apiMiddleware';
import authMiddleware from './middleware/authMiddleware';
// import { logger } from 'redux-logger'; // Un logger utile en développement

/**
 * Crée et configure le store Redux de l'application.
 */
export const store = configureStore({
  /**
   * `reducer`: Le reducer racine qui combine tous les reducers des slices.
   * Il définit la forme de l'état global.
   */
  reducer: rootReducer,

  /**
   * `middleware`: Une fonction qui nous permet de personnaliser la chaîne de middlewares.
   * `getDefaultMiddleware` nous donne accès aux middlewares inclus par défaut
   * (comme redux-thunk), et nous y ajoutons les nôtres.
   */
  middleware: (getDefaultMiddleware) => {
    const defaultMiddleware = getDefaultMiddleware({
      // Optionnel : désactiver la vérification de sérialisation si vous
      // avez besoin de stocker des valeurs non-sérialisables (ex: Dates).
      // serializableCheck: false,
    });
    
    // Ajoute nos middlewares personnalisés à la chaîne
    const customMiddleware = defaultMiddleware
      .concat(apiMiddleware)
      .concat(authMiddleware);

    // En développement, on peut ajouter un logger pour voir toutes les actions
    // et les changements d'état dans la console.
    if (import.meta.env.MODE === 'development') {
      // Pour utiliser redux-logger, installez-le avec `npm install redux-logger`
      // const { logger } = require('redux-logger');
      // customMiddleware.push(logger);
    }
    
    return customMiddleware;
  },

  /**
   * `devTools`: Active ou désactive l'extension Redux DevTools du navigateur.
   * Activé par défaut en développement, désactivé en production.
   * Nous le forçons ici pour être explicite.
   */
  devTools: import.meta.env.MODE !== 'production',
});