// client/src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// --- Gardiens & Layouts ---
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import Layout from '../components/common/Layout';
import Root from './Root';

// --- Pages ---
import LoginPage from '../pages/auth/Login';
import RegisterPage from '../pages/auth/Register';
import ForgotPasswordPage from '../pages/auth/ForgotPassword';
import DashboardPage from '../pages/dashboard/Dashboard';
import ClientsListPage from '../pages/clients/ClientsList';
import ClientFormPage from '../pages/clients/ClientForm';
import ClientDetailPage from '../pages/clients/ClientDetail';
import FournisseursListPage from '../pages/fournisseurs/FournisseursList';
import FournisseurFormPage from '../pages/fournisseurs/FournisseurForm';
import FournisseurDetailPage from '../pages/fournisseurs/FournisseurDetail';
import ProduitsListPage from '../pages/produits/ProduitsList';
import ProduitFormPage from '../pages/produits/ProduitForm';
import ProduitDetailPage from '../pages/produits/ProduitDetail';
import CategoriesPage from '../pages/produits/Categories';
import DepotsPage from '../pages/stock/Depots';
import StocksListPage from '../pages/stock/StocksList';
import MouvementStockPage from '../pages/stock/MouvementStock';
import InventairesListPage from '../pages/stock/Inventaire';
import AlertesStockPage from '../pages/stock/AlertesStock';
import DevisFormPage from '../pages/ventes/DevisForm'; 
import DevisListPage from '../pages/ventes/DevisList';
import CommandesListPage from '../pages/ventes/CommandesList';
import CommandeForm from '../pages/ventes/CommandeForm';
import FacturesListPage from '../pages/ventes/FacturesList';
import FactureForm from '../pages/ventes/FactureForm';
import FactureDetailPage from '../pages/ventes/FactureDetail';
import BonLivraisonPage from '../pages/ventes/BonLivraison'; 
import CommandesAchatPage from '../pages/achats/CommandesAchat';
import FacturesAchatPage from '../pages/achats/FacturesAchat';
import NotFoundPage from '../pages/errors/NotFound';

const Placeholder = ({ title }) => <h2 className="p-4">{title} - À construire</h2>;

const AppRoutes = () => {
  return (
    <Routes>
      {/* Route racine qui gère la redirection initiale */}
      <Route path="/" element={<Root />} />

      {/* Routes Publiques (pour utilisateurs non connectés) */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        {/* <Route path="/reset-password/:token" element={<ResetPasswordPage />} /> */}
      </Route>

      {/* Routes Privées (pour utilisateurs connectés) */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* --- Module Clients --- */}
          <Route path="/clients" element={<ClientsListPage />} />
          <Route path="/clients/nouveau" element={<ClientFormPage key="client-create" />} />
          <Route path="/clients/:id/modifier" element={<ClientFormPage key="client-edit" />} />
          <Route path="/clients/:id" element={<ClientDetailPage />} />

          {/* --- Module Fournisseurs --- */}
          <Route path="/fournisseurs" element={<FournisseursListPage />} />
          <Route path="/fournisseurs/nouveau" element={<FournisseurFormPage key="fournisseur-create" />} />
          <Route path="/fournisseurs/:id/modifier" element={<FournisseurFormPage key="fournisseur-edit" />} />
          <Route path="/fournisseurs/:id" element={<FournisseurDetailPage />} />

          {/* --- Module Catalogue --- */}
          <Route path="/produits" element={<ProduitsListPage />} />
          <Route path="/produits/nouveau" element={<ProduitFormPage key="produit-create" />} />
          <Route path="/produits/:id/modifier" element={<ProduitFormPage key="produit-edit" />} />
          <Route path="/produits/:id" element={<ProduitDetailPage />} />
          <Route path="/produits/categories" element={<CategoriesPage />} />

          {/* --- Module Stock --- */}
          <Route path="/stock/depots" element={<DepotsPage />} />
          <Route path="/stock/inventaires" element={<InventairesListPage />} />
          <Route path="/stock/etat" element={<StocksListPage />} />
          <Route path="/stock/mouvements/:produitId" element={<MouvementStockPage />} />
          <Route path="/stock/alertes" element={<AlertesStockPage />} />

          {/* --- Module Ventes --- */}
          <Route path="/ventes/devis/nouveau" element={<DevisFormPage />} />
          <Route path="/ventes/devis/:id/modifier" element={<DevisFormPage />} />
          <Route path="/ventes/devis" element={<DevisListPage />} />
          {/* Ajouter d'autres routes pour les commandes et factures ici */}
          <Route path="/ventes/commandes" element={<CommandesListPage />} />
          <Route path="/ventes/commandes/nouveau" element={<CommandeForm />} />
          <Route path="/ventes/commandes/:id/modifier" element={<CommandeForm />} />
          <Route path="/ventes/commandes/:id" element={<Placeholder title="Détail Commande" />} />
          <Route path="/ventes/factures" element={<FacturesListPage />} />
          <Route path="/ventes/factures/nouveau" element={<FactureForm />} />
          <Route path="/ventes/factures/:id/modifier" element={<FactureForm />} />
          <Route path="/ventes/factures/:id" element={<FactureDetailPage />} />
          <Route path="/ventes/bon-livraisons/:id" element={<BonLivraisonPage />} />

          {/* --- Module Achats --- */}
          <Route path="/parametres" element={<Placeholder title="Paramètres" />} />
          <Route path="/achats/commandes" element={<CommandesAchatPage />} />
          <Route path="/achats/factures" element={<FacturesAchatPage />} />

          {/* --- Placeholders --- */}
          
          <Route path="/comptabilite" element={<Placeholder title="Comptabilité" />} />
          <Route path="/parametres" element={<Placeholder title="Paramètres" />} />
        </Route>
      </Route>

      {/* Route 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;