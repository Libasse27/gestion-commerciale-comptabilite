// client/src/pages/dashboard/DashboardPage.jsx
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Card } from 'react-bootstrap';

import { useAuth } from '../../hooks/useAuth';
import { fetchDashboardData } from '../../store/slices/dashboardSlice';
import StatCard from '../../components/charts/StatCard';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/formatters';
import { Cart4, People, JournalText, Wallet2 } from 'react-bootstrap-icons';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();

  const { kpis, ventesAnnuelles, facturesEnRetard, status, message } = useSelector(
    (state) => state.dashboard
  );
  
  useEffect(() => {
    // On ne fetch les données que si elles n'ont jamais été chargées
    if (status === 'idle') {
      dispatch(fetchDashboardData());
    }
  }, [status, dispatch]);

  const salesChartData = useMemo(() => {
    if (!ventesAnnuelles?.labels) return { labels: [], datasets: [] };
    return {
      labels: ventesAnnuelles.labels,
      datasets: [{
        label: "Chiffre d'Affaires",
        data: ventesAnnuelles.datasets?.[0]?.data || [],
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
      }],
    };
  }, [ventesAnnuelles]);
  
  const topProductsData = useMemo(() => ({
      labels: ['HP EliteBook', 'Conseil', 'Licence'],
      datasets: [{
          label: 'Ventes (FCFA)',
          data: [1500000, 2300000, 250000], // Données factices
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
      }]
  }), []);

  if (status === 'loading' && !kpis) {
    return <Loader centered />;
  }

  if (status === 'failed') {
    return <div className="alert alert-danger">Erreur : {message}</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="h2">Bonjour, {user?.firstName} !</h1>
        <p className="text-muted">Voici un aperçu de votre activité.</p>
      </div>

      <Row xs={1} md={2} xl={4} className="g-4 mb-4">
        <Col>
          <StatCard
            icon={Cart4} title="Chiffre d'Affaires"
            value={kpis?.chiffreAffaires?.value ?? 0}
            change={{ value: kpis?.chiffreAffaires?.change, direction: kpis?.chiffreAffaires?.change >= 0 ? 'increase' : 'decrease' }}
            formatter={formatCurrency} iconVariant="primary"
            isLoading={status === 'loading'}
          />
        </Col>
        <Col>
          <StatCard
            icon={People} title="Nouveaux Clients"
            value={kpis?.nouveauxClients?.value ?? 0}
            change={{ value: kpis?.nouveauxClients?.change, direction: kpis?.nouveauxClients?.change >= 0 ? 'increase' : 'decrease' }}
            iconVariant="success" isLoading={status === 'loading'}
          />
        </Col>
        <Col>
          <StatCard
            icon={JournalText} title="Devis en Attente"
            value={kpis?.devisEnAttente?.value ?? 0}
            iconVariant="warning" isLoading={status === 'loading'}
          />
        </Col>
        <Col>
            <StatCard
            icon={Wallet2} title="Factures en Retard"
            value={facturesEnRetard?.length ?? 0}
            iconVariant="danger" isLoading={status === 'loading'}
          />
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h5 className="card-title">Ventes des 12 derniers mois</h5>
              <div style={{ height: '350px' }}>
                <LineChart data={salesChartData} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h5 className="card-title">Top Produits (Exemple)</h5>
              <div style={{ height: '350px' }}>
                <BarChart data={topProductsData} options={{ indexAxis: 'y', plugins: { legend: { display: false } } }} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;