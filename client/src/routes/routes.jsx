// ==============================================================================
//           Définition Centrale des Routes de l'Application (Version Recommandée)
//
// Cette version simplifie la logique en s'appuyant sur le comportement de
// redirection de nos gardiens `PublicRoute` et `PrivateRoute`.
//
// - Les routes publiques (comme `/login`) sont inaccessibles aux utilisateurs connectés.
// - Les routes privées (comme `/dashboard`) sont inaccessibles aux visiteurs.
// - La racine `/` redirige simplement vers `/login`, laissant les gardiens
//   décider de la destination finale.
// ==============================================================================

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// --- Importation des Gardiens de Route ---
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';

// --- Importation des Layouts et Pages ---
import Layout from '../components/common/Layout';
import LoginPage from '../pages/auth/Login';
import DashboardPage from '../pages/dashboard/Dashboard';
import ClientsListPage from '../pages/clients/ClientsList';
import NotFoundPage from '../pages/errors/NotFound';
// ... importez vos autres pages ici ...

const AppRoutes = () => {
  return (
    <Routes>
      {/* --- Route Racine --- */}
      {/* L'utilisateur arrivant à la racine est redirigé vers /login.
          À partir de là, les gardiens de route prendront le relais. */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* --- Routes Publiques --- */}
      {/* Enveloppées par PublicRoute, elles redirigeront vers /dashboard si l'utilisateur est déjà connecté. */}
      <Route element={<PublicRoute redirectTo="/dashboard" />}>
        <Route path="/login" element={<LoginPage />} />
        {/* <Route path="/register" element={<RegisterPage />} /> */}
        {/* <Route path="/forgot-password" element={<ForgotPasswordPage />} /> */}
      </Route>

      {/* --- Routes Protégées --- */}
      {/* Enveloppées par PrivateRoute, elles redirigeront vers /login si l'utilisateur n'est pas connecté. */}
      <Route element={<PrivateRoute redirectTo="/login" />}>
        {/* Toutes les routes à l'intérieur utiliseront le Layout principal */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/clients" element={<ClientsListPage />} />
          {/* ... Ajoutez les autres routes protégées ici ... */}
          
          {/*
            Note : La route racine étant gérée à l'extérieur, il n'y a plus
            besoin de `index` ici, sauf si vous voulez une page par défaut
            pour une URL comme `/app/` par exemple.
          */}
        </Route>
      </Route>

      {/* --- Route pour les pages non trouvées --- */}
      {/* Cette route attrape toutes les autres URL non définies */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;