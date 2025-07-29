// ==============================================================================
//           Définition Centrale des Routes de l'Application (Version Optimisée)
//
// La route racine (`/`) est maintenant gérée par le composant `Root` qui
// s'occupe de l'aiguillage initial de l'utilisateur.
// ==============================================================================

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// --- Importation des Gardiens et du Composant Racine ---
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import Root from './Root';

// --- Importation des Layouts et Pages ---
import Layout from '../components/common/Layout';

// Pages Publiques
import LoginPage from '../pages/auth/Login';
import RegisterPage from '../pages/auth/Register';
import ForgotPasswordPage from '../pages/auth/ForgotPassword';
import ResetPasswordPage from '../pages/auth/ResetPassword';

// Pages Protégées
import DashboardPage from '../pages/dashboard/Dashboard';
import ClientsListPage from '../pages/clients/ClientsList';
// ... importez les futures pages ici

// Page d'Erreur
import NotFoundPage from '../pages/errors/NotFound';

// Composant "placeholder" pour les pages non encore créées
const Placeholder = ({ title }) => <h2 className="text-muted mt-4">{title} - À construire</h2>;


const AppRoutes = () => {
  return (
    <Routes>
      {/* --- Route Racine --- */}
      {/* L'aiguilleur `Root` décide de rediriger vers /login ou /dashboard */}
      <Route path="/" element={<Root />} />

      {/* --- Routes Publiques --- */}
      {/* Accessibles uniquement si non connecté. */}
      <Route element={<PublicRoute redirectTo="/" />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Route>

      {/* --- Routes Protégées --- */}
      {/* Accessibles uniquement si connecté. */}
      <Route element={<PrivateRoute redirectTo="/login" />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Module Tiers */}
          <Route path="/clients" element={<ClientsListPage />} />
          <Route path="/fournisseurs" element={<Placeholder title="Fournisseurs" />} />
          
          {/* Module Catalogue */}
          <Route path="/produits" element={<Placeholder title="Produits & Services" />} />
          <Route path="/categories" element={<Placeholder title="Catégories" />} />
          
          {/* Module Ventes */}
          <Route path="/devis" element={<Placeholder title="Devis" />} />
          <Route path="/commandes" element={<Placeholder title="Commandes" />} />
          <Route path="/livraisons" element={<Placeholder title="Bons de Livraison" />} />
          <Route path="/factures" element={<Placeholder title="Factures" />} />
          
          {/* Module Stock */}
          <Route path="/stock" element={<Placeholder title="État du Stock" />} />
          <Route path="/stock/mouvements" element={<Placeholder title="Mouvements de Stock" />} />
          
          {/* Module Comptabilité */}
          <Route path="/comptabilite/plan" element={<Placeholder title="Plan Comptable" />} />
          <Route path="/comptabilite/ecritures" element={<Placeholder title="Écritures Comptables" />} />
          
          {/* Module Trésorerie */}
          <Route path="/paiements" element={<Placeholder title="Paiements" />} />
          
          {/* Module Rapports */}
          <Route path="/rapports" element={<Placeholder title="Rapports & Analyses" />} />

          {/* Module Paramètres (pour l'admin) */}
          <Route path="/parametres/utilisateurs" element={<Placeholder title="Gestion des Utilisateurs" />} />
          <Route path="/parametres/roles" element={<Placeholder title="Gestion des Rôles" />} />
        </Route>
      </Route>

      {/* --- Route pour les pages non trouvées --- */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;