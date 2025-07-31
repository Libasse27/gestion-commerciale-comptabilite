// ==============================================================================
//           Composant d'Affichage des Statistiques d'un Client
//
// Ce composant "widget" affiche les indicateurs de performance clés (KPIs)
// pour un client spécifique.
//
// Il est conçu pour être autonome : il reçoit un ID de client et se charge
// lui-même de récupérer et d'afficher les données.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import StatCard from '../../components/charts/StatCard'; // Notre composant de KPI réutilisable
import { BarChart, PiggyBank, ReceiptCutoff } from 'react-bootstrap-icons';
import { formatCurrency } from '../../utils/currencyUtils';
import apiClient from '../../services/api'; // On peut utiliser apiClient directement pour un appel simple

const ClientStats = ({ clientId }) => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;

    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get(`/statistiques/client/${clientId}`);
        setStats(response.data.data.kpis);
      } catch (error) {
        console.error("Erreur lors de la récupération des stats du client:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [clientId]);

  return (
    <Row className="g-4">
      <Col md={4}>
        <StatCard
          icon={BarChart}
          title="Chiffre d'Affaires Total"
          value={stats?.chiffreAffairesTotal || 0}
          formatter={formatCurrency}
          isLoading={isLoading}
          iconVariant="success"
        />
      </Col>
      <Col md={4}>
        <StatCard
          icon={ReceiptCutoff}
          title="Total Impayé"
          value={stats?.totalImpaye || 0}
          formatter={formatCurrency}
          isLoading={isLoading}
          iconVariant="danger"
        />
      </Col>
      <Col md={4}>
        <StatCard
          icon={PiggyBank}
          title="Nombre de Commandes"
          value={stats?.nombreCommandes || 0}
          isLoading={isLoading}
          iconVariant="info"
        />
      </Col>
    </Row>
  );
};

export default ClientStats;