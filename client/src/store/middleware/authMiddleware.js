// client/src/store/middleware/authMiddleware.js
// ==============================================================================
//           Middleware Redux pour les Effets de Bord de l'Auth
//
// Ce middleware intercepte les actions d'authentification pour interagir
// avec le `localStorage` et persister la session utilisateur.
// ==============================================================================

import { saveToLocalStorage, removeFromLocalStorage } from '../../utils/helpers';
import { LOCAL_STORAGE_KEYS } from '../../utils/constants';
import { login, register, logout } from '../slices/authSlice';

const authMiddleware = (store) => (next) => (action) => {
  // Laisse d'abord l'action passer et mettre à jour le state.
  const result = next(action);

  // Intercepte les actions de succès des thunks `login` et `register`.
  if (login.fulfilled.match(action) || register.fulfilled.match(action)) {
    const { accessToken, user } = action.payload;
    
    // Persister les informations essentielles dans le localStorage.
    saveToLocalStorage(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    saveToLocalStorage(LOCAL_STORAGE_KEYS.USER_INFO, user);
  }

  // Intercepte l'action de déconnexion.
  if (logout.match(action)) {
    // Nettoyer le localStorage pour terminer la session.
    removeFromLocalStorage(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
    removeFromLocalStorage(LOCAL_STORAGE_KEYS.USER_INFO);
  }

  return result;
};

export default authMiddleware;