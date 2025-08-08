// client/src/store/rootReducer.js
import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import dashboardReducer from './slices/dashboardSlice';
import clientsReducer from './slices/clientsSlice'; // <-- Importer
import fournisseursReducer from './slices/fournisseursSlice'; // <-- Importer
import produitsReducer from './slices/produitsSlice';
import stockReducer from './slices/stockSlice';
import ventesReducer from './slices/ventesSlice';
import achatsReducer from './slices/achatsSlice';
import comptabiliteReducer from './slices/comptabiliteSlice'; 
import paiementsReducer from './slices/paiementsSlice';
import rapportsReducer from './slices/rapportsSlice';
import usersReducer from './slices/usersSlice';
import rolesReducer from './slices/rolesSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  dashboard: dashboardReducer,
  produits: produitsReducer,
  clients: clientsReducer,
  fournisseurs: fournisseursReducer,
  stock: stockReducer,
  ventes: ventesReducer, 
  achats: achatsReducer, 
  comptabilite: comptabiliteReducer,
  paiements: paiementsReducer,
  rapports: rapportsReducer,
  users: usersReducer, 
  roles: rolesReducer, 
  
});

export default rootReducer;