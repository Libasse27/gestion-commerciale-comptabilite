// ==============================================================================
//           Actions Créators Spécifiques aux Appels API
//
// Ce fichier définit les actions Redux qui sont utilisées pour communiquer
// avec le middleware API (`apiMiddleware`).
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
 *   onStart: 'clients/clientsRequested', // Le type de l'action de début
 *   onSuccess: 'clients/clientsReceived',  // Le type de l'action de succès
 *   onError: 'clients/clientsRequestFailed' // Le type de l'action d'échec
 * }
 */
export const apiCallBegan = createAction('api/callBegan');

/**
 * Action générique pour représenter le succès d'un appel API.
 * Elle est "dispatchée" par le middleware API en cas de succès, en plus
 * de l'action `onSuccess` spécifique.
 * Utile pour des logiques transversales (ex: logger tous les succès API).
 */
export const apiCallSuccess = createAction('api/callSuccess');

/**
 * Action générique pour représenter l'échec d'un appel API.
 * Elle est "dispatchée" par le middleware API en cas d'échec, en plus
 * de l'action `onError` spécifique.
 * Utile pour des logiques transversales (ex: afficher un toast d'erreur global).
 */
export const apiCallFailed = createAction('api/callFailed');