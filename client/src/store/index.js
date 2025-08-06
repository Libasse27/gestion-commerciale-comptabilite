// client/src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import { injectStore } from '../services/api';
import authMiddleware from './middleware/authMiddleware';
import errorLoggerMiddleware from './middleware/errorLoggerMiddleware';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(authMiddleware, errorLoggerMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

injectStore(store);

export default store; // <-- S'ASSURER QUE "default" EST BIEN PRÉSENT