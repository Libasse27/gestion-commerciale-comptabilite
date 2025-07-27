// ==============================================================================
//           Actions Créators Spécifiques aux Appels API
//
// Ce fichier définit les actions Redux qui sont utilisées pour communiquer
// avec le middleware API.
//
// Le fait de les définir ici permet de les réutiliser facilement et d'éviter
// les fautes de frappe dans les types d'action.
// ==============================================================================

import { createAction } from '@reduxjs/toolkit';

/**
 * Action générique pour initier un appel API.
 *
 * Lorsque cette action est "dispatchée", le `apiMiddleware` va l'intercepter
 * et exécuter la requête HTTP correspondante.
 *
 * Le `payload` de cette action doit être un objet contenant toutes les
 * informations nécessaires pour l'appel, par exemple :
 * {
 *   url: '/clients',
 *   method: 'GET',
 *   data: null,
 *   onStart: 'clients/fetchStart',
 *   onSuccess: 'clients/fetchSuccess',
 *   onError: 'clients/fetchFailed'
 * }
 */
export const apiCallBegan = createAction('api/callBegan');

/**
 * Action générique pour représenter le succès d'un appel API.
 * Principalement utilisée pour le débogage ou des logiques complexes.
 * En général, on utilise directement l'action `onSuccess` définie dans le payload.
 */
export const apiCallSuccess = createAction('api/callSuccess');

/**
 * Action générique pour représenter l'échec d'un appel API.
 * Principalement utilisée pour le débogage.
 */
export const apiCallFailed = createAction('api/callFailed');