// client/src/pages/clients/ClientStats.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { fetchClientKpis } from '../../store/slices/clientsSlice';
import StatCard from '../../components/charts/StatCard';
import { formatCurrency } from '../../utils/formatters';
import { Cart4, ExclamationCircle, JournalCheck } from 'react-bootstrap-icons';

const ClientStats = ({ clientId }) => {
  const dispatch = useDispatch();
  const { clientKpis, statusKpis } = useSelector((state) => state.clients);
  const isLoading = statusKpis === 'loading';

  useEffect(() => {
    if (clientId) {
      dispatch(fetchClientKpis(clientId));
    }
  }, [clientId, dispatch]);

  return (
    <Row className="g-4">
      <Col md={4}>
        <StatCard
          icon={Cart4}
          title="Chiffre d'Affaires Total"
          value={clientKpis?.chiffreAffairesTotal ?? 0}
          formatter={formatCurrency}
          iconVariant="primary"
          isLoading={isLoading}
        />
      </Col>
      <Col md={4}>
        <StatCard
          icon={ExclamationCircle}
          title="Total Impayé"
          value={clientKpis?.totalImpaye ?? 0}
          formatter={formatCurrency}
          iconVariant="danger"
          isLoading={isLoading}
        />
      </Col>
      <Col md={4}>
        <StatCard
          icon={JournalCheck}
          title="Nombre de Commandes"
          value={clientKpis?.nombreCommandes ?? 0}
          iconVariant="success"
          isLoading={isLoading}
        />
      </Col>
    </Row>
  );
};

export default ClientStats;