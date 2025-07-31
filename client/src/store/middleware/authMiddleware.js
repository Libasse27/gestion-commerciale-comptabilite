// ==============================================================================
//           Middleware Redux pour la Gestion des Effets de Bord
//                           de l'Authentification
//
// Ce middleware intercepte les actions liées à l'authentification pour
// déclencher des effets de bord (side effects), tels que :
//   - Interagir avec le `localStorage` pour persister ou supprimer les tokens
//     et les informations de l'utilisateur.
//
// Il permet de garder les reducers purs (sans effets de bord) et de
// centraliser la logique de persistance de la session.
// ==============================================================================

import {
  saveToLocalStorage,
  removeFromLocalStorage,
} from '../../utils/helpers';
import { LOCAL_STORAGE_KEYS } from '../../utils/constants';
// Importez le thunk `login` et l'action `logout` directement depuis le slice.
// Note : Le nom du thunk est `loginUser` dans notre slice, pas `login`.
import { loginUser, logout } from '../slices/authSlice';

/**
 * Middleware qui gère les effets de bord de l'authentification.
 * La signature `(store) => (next) => (action)` est la structure standard.
 */
const authMiddleware = (store) => (next) => (action) => {
  // 1. Laisse d'abord l'action passer pour que le state Redux soit mis à jour par le reducer.
  const result = next(action);

  // 2. Intercepte l'action de succès (`fulfilled`) du thunk `loginUser`.
  // `loginUser.fulfilled.match(action)` est la méthode correcte et la plus sûre
  // pour réagir à une action asynchrone réussie créée avec `createAsyncThunk`.
  if (loginUser.fulfilled.match(action)) {
    // Le `payload` de cette action est ce qui est retourné par la fonction `login` du `authService`.
    const { accessToken, user } = action.payload;

    console.log('Auth Middleware: Connexion réussie, sauvegarde des données...');

    // Le `refreshToken` est géré par un cookie httpOnly, on n'a pas besoin de le stocker ici.
    // On ne stocke que les informations qui doivent être lues par le client.
    saveToLocalStorage(LOCAL_STORAGE_KEYS.USER_INFO, {
      token: accessToken,
      ...user,
    });
  }

  // 3. Intercepte l'action de déconnexion (`logout`).
  if (logout.match(action)) {
    console.log('Auth Middleware: Déconnexion, nettoyage du localStorage...');

    // Nettoie le localStorage pour terminer la session côté client.
    removeFromLocalStorage(LOCAL_STORAGE_KEYS.USER_INFO);

    // La redirection sera gérée par les composants de l'application qui réagissent
    // à la mise à jour de l'état d'authentification.
  }

  return result;
};

export default authMiddleware;