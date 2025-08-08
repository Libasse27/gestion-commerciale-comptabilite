// client/src/pages/dashboard/ComptableDashboardPage.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { Wallet2, CashStack, ClockHistory } from 'react-bootstrap-icons';

import { fetchKpisTresorerie } from '../../store/slices/dashboardSlice';
import StatCard from '../../components/charts/StatCard';
import { formatCurrency } from '../../utils/formatters';

const ComptableDashboardPage = () => {
  const dispatch = useDispatch();
  
  const { kpisTresorerie, status } = useSelector((state) => state.dashboard);
  const isLoading = status === 'loading';

  useEffect(() => {
    // Ne fetcher que si les données ne sont pas déjà là
    if (!kpisTresorerie) {
      dispatch(fetchKpisTresorerie());
    }
  }, [kpisTresorerie, dispatch]);

  return (
    <div>
      <div className="mb-4">
        <h1 className="h2"><Wallet2 className="me-3" />Tableau de Bord - Comptabilité & Trésorerie</h1>
        <p className="text-muted">Vue d'ensemble de la santé financière.</p>
      </div>

      <Row xs={1} md={2} xl={3} className="g-4 mb-4">
        <Col>
            <StatCard
                icon={CashStack}
                title="Solde de Trésorerie Actuel"
                value={kpisTresorerie?.soldeTresorerieActuel ?? 0}
                formatter={formatCurrency}
                iconVariant="success"
                isLoading={isLoading}
            />
        </Col>
        <Col>
            <StatCard
                icon={ClockHistory}
                title="Encaissements Prévus (30j)"
                value={kpisTresorerie?.previsionnel30j?.totalEncaissementsPrevus ?? 0}
                formatter={formatCurrency}
                iconVariant="primary"
                isLoading={isLoading}
            />
        </Col>
        <Col>
            <StatCard
                icon={ClockHistory}
                title="Décaissements Prévus (30j)"
                value={kpisTresorerie?.previsionnel30j?.totalDecaissementsPrevus ?? 0}
                formatter={formatCurrency}
                iconVariant="warning"
                isLoading={isLoading}
            />
        </Col>
      </Row>
      
      {/* Ici, on pourrait ajouter des graphiques ou des listes de factures à payer/relancer */}
    </div>
  );
};

export default ComptableDashboardPage;