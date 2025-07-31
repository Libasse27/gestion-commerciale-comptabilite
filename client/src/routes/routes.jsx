// ==============================================================================
//           Définition Centrale des Routes de l'Application
//
// Ce fichier utilise `react-router-dom` pour définir la structure de navigation
// de l'application. Il organise les routes en deux catégories principales :
//   - Publiques : Accessibles à tous (ex: connexion, inscription).
//   - Privées : Nécessitent une authentification.
//
// Il utilise des composants "wrapper" (PublicRoute, PrivateRoute) pour gérer
// la logique de redirection en fonction de l'état d'authentification.
// ==============================================================================

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// --- Importation des Gardiens et du Composant Racine ---
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import Root from './Root'; // Le composant d'aiguillage initial

// --- Importation des Layouts et Pages ---
import Layout from '../components/common/Layout';

// Pages Publiques (Authentification)
import LoginPage from '../pages/auth/Login';
import RegisterPage from '../pages/auth/Register';
import ForgotPasswordPage from '../pages/auth/ForgotPassword';
//import ResetPasswordPage from '../pages/auth/ResetPassword';

// Pages Protégées
import DashboardPage from '../pages/dashboard/Dashboard';
// import ClientsListPage from '../pages/clients/ClientsList';
// import ClientFormPage from '../pages/clients/ClientForm';
// import ClientDetailPage from '../pages/clients/ClientDetail';

// Page d'Erreur
import NotFoundPage from '../pages/errors/NotFound';

// Composant "placeholder" pour les pages non encore créées
const Placeholder = ({ title }) => <h2 className="text-muted mt-4">{title} - À construire</h2>;


const AppRoutes = () => {
  return (
    <Routes>
      {/* ================================================== */}
      {/* ===           ROUTE RACINE                     === */}
      {/* ================================================== */}
      {/* Cette route est la première à être évaluée. Le composant `Root`
          redirige l'utilisateur vers /login ou /dashboard en fonction de
          son état de connexion. */}
      <Route path="/" element={<Root />} />


      {/* ================================================== */}
      {/* ===           ROUTES PUBLIQUES                 === */}
      {/* ================================================== */}
      {/* Ces routes sont enveloppées par `PublicRoute`. Si l'utilisateur est
          déjà connecté, il sera redirigé vers `/dashboard`. */}
      <Route element={<PublicRoute redirectTo="/dashboard" />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
       {/* <Route path="/reset-password/:token" element={<ResetPasswordPage />} /> */}
      </Route>


      {/* ================================================== */}
      {/* ===           ROUTES PROTÉGÉES                 === */}
      {/* ================================================== */}
      {/* Ces routes sont enveloppées par `PrivateRoute`. Si l'utilisateur n'est
          pas connecté, il sera redirigé vers `/login`. */}
      <Route element={<PrivateRoute redirectTo="/login" />}>
        {/* Toutes les routes à l'intérieur de cette section utiliseront le `Layout`
            (qui contient la sidebar, le header, etc.). */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* --- Module Clients --- */}
          {/* <Route path="/clients" element={<ClientsListPage />} /> */}
          {/* <Route path="/clients/nouveau" element={<ClientFormPage key="client-create" />} /> */}
          {/* <Route path="/clients/:id/modifier" element={<ClientFormPage key="client-edit" />} /> */}
          {/* <Route path="/clients/:id" element={<ClientDetailPage />} /> */}
          
          {/* --- Placeholders pour les futurs modules --- */}
          <Route path="/fournisseurs" element={<Placeholder title="Fournisseurs" />} />
          <Route path="/produits" element={<Placeholder title="Produits & Services" />} />
          <Route path="/ventes" element={<Placeholder title="Ventes" />} />
          <Route path="/stock" element={<Placeholder title="Stock" />} />
          <Route path="/comptabilite" element={<Placeholder title="Comptabilité" />} />
          <Route path="/parametres" element={<Placeholder title="Paramètres" />} />
        </Route>
      </Route>


      {/* ================================================== */}
      {/* ===           ROUTE 404                        === */}
      {/* ================================================== */}
      {/* Cette route est évaluée en dernier. Si aucune des routes
          ci-dessus n'a matché, elle s'affichera. */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;