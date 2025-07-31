// ==============================================================================
//           Page Principale du Tableau de Bord (Version Finale Corrigée)
//
// Rôle : Affiche une synthèse visuelle de l'activité commerciale et comptable.
//
// CORRECTION CLÉ :
// Le `useEffect` a été modifié pour n'exécuter l'appel API qu'une seule fois
// au montage, ou si les données ont été explicitement réinitialisées.
// Ceci corrige la boucle de rendu infinie qui causait les erreurs "429 Too Many Requests".
// ==============================================================================

import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Card } from 'react-bootstrap';

// --- Importations internes ---
import { useAuth } from '../../hooks/useAuth';
import { fetchDashboardData, resetDashboard } from '../../store/slices/dashboardSlice';
import StatCard from '../../components/charts/StatCard';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';
import Loader from '../../components/common/Loader';
import AlertMessage from '../../components/common/AlertMessage'; // Composant à créer/utiliser
import { formatCurrency } from '../../utils/currencyUtils';
import { Cart4, PeopleFill, JournalText, CashStack } from 'react-bootstrap-icons';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();

  // On récupère l'état complet du slice. 'status' est la clé pour contrôler les appels.
  const { kpis, ventesAnnuelles, status, isError, message } = useSelector(
    (state) => state.dashboard
  );
  
  // --- CORRECTION DE LA BOUCLE INFINIE ---
  useEffect(() => {
    // On ne lance le chargement que si le statut est 'idle' (c'est-à-dire,
    // à l'état initial ou après un reset).
    // Cela empêche de relancer l'appel à chaque rendu.
    if (status === 'idle') {
      dispatch(fetchDashboardData());
    }

    // Le `return` d'un useEffect est une fonction de nettoyage.
    // Elle sera exécutée lorsque le composant est "démonté".
    // C'est une bonne pratique pour réinitialiser l'état si l'utilisateur
    // quitte la page, afin que les données soient fraîches à son retour.
    return () => {
      // Optionnel : décommentez si vous voulez que les données se rechargent
      // à chaque fois que l'utilisateur revient sur la page.
      // dispatch(resetDashboard());
    };
  }, [status, dispatch]);

  // --- Transformation des données pour les graphiques avec `useMemo` ---
  // `useMemo` met en cache le résultat de cette fonction. Le calcul ne sera
  // refait que si `ventesAnnuelles` change, ce qui optimise les performances.
  const salesChartData = useMemo(() => {
    // S'assurer que les données sont valides avant de les mapper
    if (!Array.isArray(ventesAnnuelles) || ventesAnnuelles.length === 0) {
      return { labels: [], datasets: [] };
    }
    const labels = ventesAnnuelles.map(d => new Date(d.date).toLocaleString('fr-SN', { month: 'short', year: '2-digit' }));
    const dataPoints = ventesAnnuelles.map(d => d.chiffreAffaires);
    return {
      labels,
      datasets: [{
        label: "Chiffre d'Affaires (XOF)", data: dataPoints,
        borderColor: 'rgb(53, 162, 235)', backgroundColor: 'rgba(53, 162, 235, 0.5)',
        fill: true, tension: 0.3,
      }],
    };
  }, [ventesAnnuelles]);
  
  // Données factices pour le deuxième graphique (à remplacer)
  const topProductsData = useMemo(() => ({
      labels: ['Produit A', 'Produit B', 'Service C'],
      datasets: [{
          label: 'Ventes (unités)', data: [300, 150, 220],
          backgroundColor: 'rgba(75, 192, 192, 0.6)'
      }]
  }), []); // Tableau vide car les données sont statiques

  // --- Gestion des différents états de l'UI ---
  if (status === 'loading') {
    return <Loader centered message="Chargement du tableau de bord..." />;
  }

  if (isError) {
    return <AlertMessage variant="danger" title="Erreur de chargement"> {message} </AlertMessage>;
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="mb-0">Bonjour, {user?.firstName || 'Utilisateur'} !</h1>
        <p className="text-muted">Voici un aperçu de votre activité.</p>
      </div>

      {/* --- Section des KPIs --- */}
      <Row className="g-4 mb-4">
        <Col md={6} xl={3}><StatCard icon={Cart4} title="CA Aujourd'hui" value={kpis.chiffreAffairesAujourdhui} formatter={formatCurrency} iconVariant="primary" /></Col>
        <Col md={6} xl={3}><StatCard icon={PeopleFill} title="Nouveaux Clients" value={kpis.nouveauxClientsAujourdhui} iconVariant="success" /></Col>
        <Col md={6} xl={3}><StatCard icon={JournalText} title="Devis en Attente" value={kpis.devisEnAttente} iconVariant="warning" /></Col>
        <Col md={6} xl={3}><StatCard icon={CashStack} title="Trésorerie" value={kpis.tresorerie} formatter={formatCurrency} iconVariant="info" /></Col>
      </Row>

      {/* --- Section des Graphiques --- */}
      <Row className="g-4">
        <Col lg={8}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <Card.Title>Évolution des Ventes (12 derniers mois)</Card.Title>
              <div style={{ height: '350px' }}>
                <LineChart data={salesChartData} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <Card.Title>Top Produits</Card.Title>
              <div style={{ height: '350px' }}>
                <BarChart data={topProductsData} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;