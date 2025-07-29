// ==============================================================================
//           Page Principale du Tableau de Bord
//
// Cette page est le point central de l'application après la connexion.
// Elle affiche une vue d'ensemble de l'activité commerciale à travers des
// indicateurs clés (KPIs) et des graphiques.
//
// Elle orchestre la récupération des données en dispatchant les actions
// du `dashboardSlice` et affiche les composants de visualisation.
// ==============================================================================

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Card } from 'react-bootstrap'

// --- Importation des actions Redux ---
import { fetchKpis, fetchVentesAnnuelles } from '../../store/slices/dashboardSlice'

// --- Importation des composants de l'UI ---
import StatCard from '../../components/charts/StatCard'
import LineChart from '../../components/charts/LineChart'
import BarChart from '../../components/charts/BarChart' // Exemple d'ajout
import { formatCurrency } from '../../utils/currencyUtils'
import { Cart4, PeopleFill, JournalText, CashStack } from 'react-bootstrap-icons'

const DashboardPage = () => {
  const dispatch = useDispatch()

  // --- Lecture des données depuis le store Redux ---
  const { kpis, ventesAnnuelles, isLoading, isError, message } = useSelector(
    (state) => state.dashboard
  )

  // --- Déclenchement du chargement des données ---
  // Le `useEffect` avec un tableau de dépendances vide `[]` s'exécute
  // une seule fois, au premier rendu du composant.
  useEffect(() => {
    dispatch(fetchKpis())
    dispatch(fetchVentesAnnuelles())
  }, [dispatch])

  // --- Transformation des données pour les graphiques ---
  const salesChartData = {
    labels: ventesAnnuelles.map(d =>
      // Formate la date en "Mois Année" (ex: "Juil 24")
      new Date(d.date).toLocaleString('fr-SN', { month: 'short', year: '2-digit' })
    ),
    datasets: [
      {
        label: "Chiffre d'Affaires",
        data: ventesAnnuelles.map(d => d.chiffreAffaires),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        fill: true,
        tension: 0.3,
      },
    ],
  }
  
  // Exemple de données pour un BarChart
  const topProductsData = {
      labels: ['Produit A', 'Produit B', 'Service C'],
      datasets: [{
          label: 'Ventes',
          data: [300, 150, 220],
          backgroundColor: 'rgba(75, 192, 192, 0.6)'
      }]
  };


  if (isError) {
    return <div className="alert alert-danger">Erreur de chargement du tableau de bord : {message}</div>
  }

  return (
    <div>
      <h1 className="mb-4">Tableau de Bord</h1>

      {/* --- Section des KPIs --- */}
      <Row className="g-4 mb-4">
        <Col md={6} xl={3}>
          <StatCard
            icon={Cart4}
            title="CA Aujourd'hui"
            value={kpis.chiffreAffairesAujourdhui}
            formatter={formatCurrency}
            isLoading={isLoading}
            iconVariant="primary"
          />
        </Col>
        <Col md={6} xl={3}>
          <StatCard
            icon={PeopleFill}
            title="Nouveaux Clients"
            value={kpis.nouveauxClientsAujourdhui}
            isLoading={isLoading}
            iconVariant="success"
          />
        </Col>
        <Col md={6} xl={3}>
          <StatCard
            icon={JournalText}
            title="Devis en Attente"
            value={kpis.devisEnAttente}
            isLoading={isLoading}
            iconVariant="warning"
          />
        </Col>
        <Col md={6} xl={3}>
          <StatCard
            icon={CashStack}
            title="Trésorerie"
            value={kpis.tresorerie}
            formatter={formatCurrency}
            isLoading={isLoading}
            iconVariant="info"
          />
        </Col>
      </Row>

      {/* --- Section des Graphiques --- */}
      <Row className="g-4">
        <Col lg={8}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <Card.Title>Évolution des Ventes</Card.Title>
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
  )
}

export default DashboardPage