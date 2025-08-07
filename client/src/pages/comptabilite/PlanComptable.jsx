// client/src/pages/comptabilite/PlanComptablePage.jsx
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { Book } from 'react-bootstrap-icons';

import { fetchPlanComptable } from '../../store/slices/comptabiliteSlice';
import Table from '../../components/common/Table';
import Loader from '../../components/common/Loader';

const PlanComptablePage = () => {
  const dispatch = useDispatch();
  const { planComptable, status, message } = useSelector((state) => state.comptabilite);
  const isLoading = status === 'loading';

  useEffect(() => {
    // Ne fetcher que si le plan n'est pas déjà chargé
    if (status === 'idle') {
      dispatch(fetchPlanComptable());
    }
  }, [status, dispatch]);

  const columns = useMemo(() => [
    { Header: 'Numéro', accessor: 'numero' },
    { Header: 'Libellé', accessor: 'libelle' },
    { Header: 'Classe', accessor: 'classe' },
    { Header: 'Sens', accessor: 'sens' },
    { Header: 'Type', accessor: 'type' },
    { Header: 'Lettrable', accessor: 'estLettrable', Cell: ({ value }) => value ? 'Oui' : 'Non' },
  ], []);

  if (isLoading && planComptable.length === 0) {
    return <Loader centered />;
  }

  if (status === 'failed') {
    return <div className="alert alert-danger">Erreur : {message}</div>;
  }

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col><h1><Book className="me-3" />Plan Comptable</h1></Col>
        {/* Ajouter un bouton pour créer un nouveau compte si nécessaire */}
      </Row>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
            <Table columns={columns} data={planComptable} isLoading={isLoading} />
        </Card.Body>
      </Card>
    </div>
  );
};

export default PlanComptablePage;