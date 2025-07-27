// ==============================================================================
//           Middleware Redux pour la Gestion des Effets de Bord
//                           de l'Authentification
//
// Ce middleware intercepte les actions liées à l'authentification pour
// déclencher des effets de bord (side effects), tels que :
//   - Interagir avec le `localStorage` pour persister ou supprimer les tokens.
//
// Il permet de garder les reducers purs (sans effets de bord) et de
// centraliser la logique de persistance de l'authentification.
// ==============================================================================

import { LOCAL_STORAGE_KEYS } from '../../utils/constants';
import { saveToLocalStorage } from '../../utils/helpers';
// Importez le thunk `login` et l'action `logout` directement depuis le slice.
import { login, logout } from '../slices/authSlice';

/**
 * Middleware qui gère les effets de bord de l'authentification.
 * La signature `(store) => (next) => (action)` est la structure standard.
 */
const authMiddleware = (store) => (next) => (action) => {
  // 1. Laisse d'abord l'action passer pour que le state Redux soit mis à jour.
  const result = next(action);

  // 2. Intercepte l'action de succès (`fulfilled`) du thunk `login`.
  // `login.fulfilled.match(action)` est la méthode correcte pour réagir
  // à une action asynchrone réussie créée avec `createAsyncThunk`.
  if (login.fulfilled.match(action)) {
    // Le `payload` de cette action est ce qui est retourné par la fonction `login` du `authService`.
    const { accessToken, refreshToken, user } = action.payload;

    console.log('Auth Middleware: Connexion réussie, sauvegarde des données dans localStorage...');

    // Sauvegarde les informations critiques dans le localStorage pour la persistance de la session.
    saveToLocalStorage(LOCAL_STORAGE_KEYS.AUTH_TOKEN, accessToken);
    if(refreshToken) saveToLocalStorage(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    saveToLocalStorage(LOCAL_STORAGE_KEYS.USER_INFO, user);
  }

  // 3. Intercepte l'action de déconnexion (`logout`).
  if (logout.match(action)) {
    console.log('Auth Middleware: Déconnexion, nettoyage du localStorage...');

    // Nettoie le localStorage pour terminer la session.
    localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_INFO);

    // La redirection est gérée par les composants PrivateRoute/PublicRoute,
    // pas besoin de `window.location.href` ici, ce qui est plus propre.
  }

  return result;
};

export default authMiddleware;