// client/src/pages/dashboard/CommercialDashboardPage.jsx
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Card } from 'react-bootstrap';
import { Briefcase } from 'react-bootstrap-icons';

import { fetchDashboardData } from '../../store/slices/dashboardSlice';
import StatCard from '../../components/charts/StatCard';
import LineChart from '../../components/charts/LineChart';
import { formatCurrency } from '../../utils/formatters';
import { Cart4, People, JournalText } from 'react-bootstrap-icons';

const CommercialDashboardPage = () => {
  const dispatch = useDispatch();
  const { kpis, ventesAnnuelles, status } = useSelector((state) => state.dashboard);
  const isLoading = status === 'loading';

  useEffect(() => {
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

  return (
    <div>
      <div className="mb-4">
        <h1 className="h2"><Briefcase className="me-3" />Tableau de Bord - Commercial</h1>
        <p className="text-muted">Analyse de la performance commerciale.</p>
      </div>

      <Row xs={1} md={2} xl={3} className="g-4 mb-4">
        <Col>
          <StatCard
            icon={Cart4} title="Chiffre d'Affaires (30j)"
            value={kpis?.chiffreAffaires?.value ?? 0}
            change={{ value: kpis?.chiffreAffaires?.change, direction: kpis?.chiffreAffaires?.change >= 0 ? 'increase' : 'decrease' }}
            formatter={formatCurrency} iconVariant="primary"
            isLoading={isLoading}
          />
        </Col>
        <Col>
          <StatCard
            icon={People} title="Nouveaux Clients (30j)"
            value={kpis?.nouveauxClients?.value ?? 0}
            change={{ value: kpis?.nouveauxClients?.change, direction: kpis?.nouveauxClients?.change >= 0 ? 'increase' : 'decrease' }}
            iconVariant="success" isLoading={isLoading}
          />
        </Col>
        <Col>
          <StatCard
            icon={JournalText} title="Devis en Attente"
            value={kpis?.devisEnAttente?.value ?? 0}
            iconVariant="warning" isLoading={isLoading}
          />
        </Col>
      </Row>

      <Row className="g-4">
        <Col>
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <h5 className="card-title">Ventes des 12 derniers mois</h5>
              <div style={{ height: '400px' }}>
                <LineChart data={salesChartData} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CommercialDashboardPage;