// ==============================================================================
//           Configuration du Store Redux Principal
//
// Ce fichier est le cœur de la gestion d'état de l'application.
// Il configure et crée le store Redux en utilisant Redux Toolkit.
//
// Il assemble les reducers, ajoute les middlewares nécessaires, et injecte
// l'instance du store dans le client API pour résoudre les dépendances circulaires.
// ==============================================================================

import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';

// On importe la fonction d'injection depuis notre client API
import { injectStore } from '../services/api';

// --- Importation des Middlewares (Optionnel selon l'architecture choisie) ---
// import apiMiddleware from './middleware/apiMiddleware';
// import authMiddleware from './middleware/authMiddleware';

/**
 * Création et configuration du store Redux.
 */
const store = configureStore({
  // `rootReducer` est la combinaison de tous les reducers de nos slices.
  reducer: rootReducer,
  
  // `middleware` est l'endroit où l'on ajoute nos middlewares personnalisés.
  // `getDefaultMiddleware` inclut déjà des outils utiles comme `redux-thunk`.
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      // Il est recommandé de garder la vérification de sérialisabilité activée,
      // mais elle peut être désactivée si vous avez des raisons spécifiques
      // de stocker des valeurs non-sérialisables (comme des Dates).
      serializableCheck: false,
    }),
    // Exemple si vous utilisiez des middlewares personnalisés :
    // .concat(apiMiddleware, authMiddleware),

  // Activer les Redux DevTools uniquement en environnement de développement
  // pour des raisons de performance et de sécurité.
  devTools: process.env.NODE_ENV !== 'production',
});


// ==============================================================================
// ---                       INJECTION DE DÉPENDANCE                        ---
// ==============================================================================
// C'est l'étape cruciale.
// On injecte le store qui vient d'être créé dans le module `api.js`.
// L'intercepteur Axios aura maintenant accès à `store.dispatch` et `store.getState`
// pour gérer la déconnexion automatique en cas d'erreur 401.
injectStore(store);

export default store;

// --- Inférence des types pour TypeScript (Optionnel mais recommandé) ---
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;