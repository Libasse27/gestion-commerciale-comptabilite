// client/src/routes/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// --- Auth & Layout ---
import PublicRoute from './PublicRoute';
import PrivateRoute from './PrivateRoute';
import Root from './Root';
import Layout from '../components/common/Layout';

// --- Auth Pages ---
import LoginPage from '../pages/auth/Login';
import RegisterPage from '../pages/auth/Register';
import ForgotPasswordPage from '../pages/auth/ForgotPassword';
// import ResetPasswordPage from '../pages/auth/ResetPassword'; // Si prévu

// --- Dashboard ---
import DashboardPage from '../pages/dashboard/Dashboard';

// --- Clients ---
import ClientsListPage from '../pages/clients/ClientsList';
import ClientFormPage from '../pages/clients/ClientForm';
import ClientDetailPage from '../pages/clients/ClientDetail';

// --- Fournisseurs ---
import FournisseursListPage from '../pages/fournisseurs/FournisseursList';
import FournisseurFormPage from '../pages/fournisseurs/FournisseurForm';
import FournisseurDetailPage from '../pages/fournisseurs/FournisseurDetail';

// --- Produits ---
import ProduitsListPage from '../pages/produits/ProduitsList';
import ProduitFormPage from '../pages/produits/ProduitForm';
import ProduitDetailPage from '../pages/produits/ProduitDetail';
import CategoriesPage from '../pages/produits/Categories';

// --- Stock ---
import DepotsPage from '../pages/stock/Depots';
import StocksListPage from '../pages/stock/StocksList';
import MouvementStockPage from '../pages/stock/MouvementStock';
import InventairesListPage from '../pages/stock/Inventaire';
import AlertesStockPage from '../pages/stock/AlertesStock';

// --- Ventes ---
import DevisListPage from '../pages/ventes/DevisList';
import DevisFormPage from '../pages/ventes/DevisForm';
import CommandesListPage from '../pages/ventes/CommandesList';
import CommandeForm from '../pages/ventes/CommandeForm';
import FacturesListPage from '../pages/ventes/FacturesList';
import FactureForm from '../pages/ventes/FactureForm';
import FactureDetailPage from '../pages/ventes/FactureDetail';
import BonLivraisonPage from '../pages/ventes/BonLivraison';

// --- Achats ---
import CommandesAchatPage from '../pages/achats/CommandesAchat';
import FacturesAchatPage from '../pages/achats/FacturesAchat';
import ReceptionsPage from '../pages/achats/Receptions';

// --- Comptabilité ---
import PlanComptablePage from '../pages/comptabilite/PlanComptable';
import EcrituresPage from '../pages/comptabilite/Ecritures';
import EcritureFormPage from '../pages/comptabilite/EcritureForm';
import BalancePage from '../pages/comptabilite/Balance';
import GrandLivrePage from '../pages/comptabilite/GrandLivre';
import BilanPage from '../pages/comptabilite/Bilan';
import ResultatNetPage from '../pages/comptabilite/ResultatNet';
import JournauxPage from '../pages/comptabilite/Journaux';

// --- Paiements ---
import PaiementFormPage from '../pages/paiements/PaiementForm';
import PaiementsListPage from '../pages/paiements/PaiementsList';
import EcheanciersPage from '../pages/paiements/Echeanciers';
import RelancesPage from '../pages/paiements/Relances';
import MobileMoneyPage from '../pages/paiements/MobileMoney';

// --- Rapports ---
import RapportsVentesPage from '../pages/rapports/RapportsVentes';
import RapportsAchatsPage from '../pages/rapports/RapportsAchats';
import RapportsStockPage from '../pages/rapports/RapportsStock';
import RapportsComptablesPage from '../pages/rapports/RapportsComptables';
import RapportsFiscauxPage from '../pages/rapports/RapportsFiscaux';

// --- Parametres ---
import UtilisateursPage from '../pages/parametres/Utilisateurs';
import RolesPage from '../pages/parametres/Roles';

// --- Error Pages ---
import NotFoundPage from '../pages/errors/NotFound';
import UnauthorizedPage from '../pages/errors/Unauthorized';
import ServerErrorPage from '../pages/errors/ServerError';

// --- Placeholder ---
const Placeholder = ({ title }) => <h2 className="p-4">{title} - À construire</h2>;

const AppRoutes = () => (
  <Routes>
    {/* Redirection initiale */}
    <Route path="/" element={<Root />} />

    {/* Routes publiques */}
    <Route element={<PublicRoute />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      {/* <Route path="/reset-password/:token" element={<ResetPasswordPage />} /> */}
    </Route>

    {/* Routes privées */}
    <Route element={<PrivateRoute />}>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* --- Clients --- */}
        <Route path="/clients" element={<ClientsListPage />} />
        <Route path="/clients/nouveau" element={<ClientFormPage key="create" />} />
        <Route path="/clients/:id/modifier" element={<ClientFormPage key="edit" />} />
        <Route path="/clients/:id" element={<ClientDetailPage />} />

        {/* --- Fournisseurs --- */}
        <Route path="/fournisseurs" element={<FournisseursListPage />} />
        <Route path="/fournisseurs/nouveau" element={<FournisseurFormPage key="create" />} />
        <Route path="/fournisseurs/:id/modifier" element={<FournisseurFormPage key="edit" />} />
        <Route path="/fournisseurs/:id" element={<FournisseurDetailPage />} />

        {/* --- Produits --- */}
        <Route path="/produits" element={<ProduitsListPage />} />
        <Route path="/produits/nouveau" element={<ProduitFormPage key="create" />} />
        <Route path="/produits/:id/modifier" element={<ProduitFormPage key="edit" />} />
        <Route path="/produits/:id" element={<ProduitDetailPage />} />
        <Route path="/produits/categories" element={<CategoriesPage />} />

        {/* --- Stock --- */}
        <Route path="/stock/depots" element={<DepotsPage />} />
        <Route path="/stock/inventaires" element={<InventairesListPage />} />
        <Route path="/stock/etat" element={<StocksListPage />} />
        <Route path="/stock/mouvements/:produitId" element={<MouvementStockPage />} />
        <Route path="/stock/alertes" element={<AlertesStockPage />} />

        {/* --- Ventes --- */}
        <Route path="/ventes/devis" element={<DevisListPage />} />
        <Route path="/ventes/devis/nouveau" element={<DevisFormPage />} />
        <Route path="/ventes/devis/:id/modifier" element={<DevisFormPage />} />
        <Route path="/ventes/commandes" element={<CommandesListPage />} />
        <Route path="/ventes/commandes/nouveau" element={<CommandeForm />} />
        <Route path="/ventes/commandes/:id/modifier" element={<CommandeForm />} />
        <Route path="/ventes/commandes/:id" element={<Placeholder title="Détail Commande" />} />
        <Route path="/ventes/factures" element={<FacturesListPage />} />
        <Route path="/ventes/factures/nouveau" element={<FactureForm />} />
        <Route path="/ventes/factures/:id/modifier" element={<FactureForm />} />
        <Route path="/ventes/factures/:id" element={<FactureDetailPage />} />
        <Route path="/ventes/bon-livraisons/:id" element={<BonLivraisonPage />} />

        {/* --- Achats --- */}
        <Route path="/achats/commandes" element={<CommandesAchatPage />} />
        <Route path="/achats/factures" element={<FacturesAchatPage />} />
        <Route path="/achats/receptions" element={<ReceptionsPage />} />

        {/* --- Comptabilité --- */}
        <Route path="/comptabilite/plan" element={<PlanComptablePage />} />
        <Route path="/comptabilite/ecritures" element={<EcrituresPage />} />
        <Route path="/comptabilite/ecritures/nouveau" element={<EcritureFormPage />} />
        <Route path="/comptabilite/balance" element={<BalancePage />} />
        <Route path="/comptabilite/grand-livre" element={<GrandLivrePage />} />
        <Route path="/comptabilite/bilan" element={<BilanPage />} />
        <Route path="/comptabilite/resultat" element={<ResultatNetPage />} />
        <Route path="/comptabilite/journaux" element={<JournauxPage />} />

        {/* --- Paiements --- */}
        <Route path="/paiements" element={<PaiementsListPage />} />
        <Route path="/paiements/nouveau" element={<PaiementFormPage />} />
        <Route path="/paiements/echeanciers" element={<EcheanciersPage />} />
        <Route path="/paiements/relances" element={<RelancesPage />} />
        <Route path="/paiements/mobile-money" element={<MobileMoneyPage />} />

        {/* --- Rapports --- */}
        <Route path="/rapports/ventes" element={<RapportsVentesPage />} />
        <Route path="/rapports/achats" element={<RapportsAchatsPage />} />
        <Route path="/rapports/stock" element={<RapportsStockPage />} />
        <Route path="/rapports/comptables" element={<RapportsComptablesPage />} />
        <Route path="/rapports/fiscaux" element={<RapportsFiscauxPage />} />

        {/* --- Paramètres --- */}
        <Route path="/parametres/utilisateurs" element={<UtilisateursPage />} />
        <Route path="/parametres/roles" element={<RolesPage />} />

      </Route>
    </Route>

    {/* --- Pages d'erreurs --- */}
    <Route path="*" element={<NotFoundPage />} />
    <Route path="/401" element={<UnauthorizedPage />} />
    <Route path="/500" element={<ServerErrorPage />} />
  </Routes>
);

export default AppRoutes;
