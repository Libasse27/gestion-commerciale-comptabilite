
// client/src/pages/parametres/UtilisateursPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Row, Col, Badge, Card } from 'react-bootstrap';
import { PeopleFill, PersonPlusFill } from 'react-bootstrap-icons';

import { fetchUsers } from '../../store/slices/usersSlice';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import { formatDate } from '../../utils/formatters';

const UtilisateursPage = () => {
  const dispatch = useDispatch();
  const { users, pagination, status, message } = useSelector((state) => state.users);
  const isLoading = status === 'loading';

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchUsers({ page: currentPage }));
  }, [currentPage, dispatch]);

  const columns = useMemo(() => [
    { Header: 'Nom Complet', accessor: 'fullName' },
    { Header: 'Email', accessor: 'email' },
    { Header: 'Rôle', accessor: 'role.name' },
    { Header: 'Date de Création', accessor: 'createdAt', Cell: ({ value }) => formatDate(value) },
    { Header: 'Statut', accessor: 'isActive', Cell: ({ value }) => <Badge bg={value ? 'success' : 'secondary'}>{value ? 'Actif' : 'Inactif'}</Badge> },
    { Header: 'Actions', accessor: '_id', Cell: ({ value }) => <Button as={Link} to={`/parametres/utilisateurs/${value}/modifier`} variant="outline-primary" size="sm">Modifier</Button> }
  ], []);

  if (status === 'failed' && users.length === 0) {
    return <div className="alert alert-danger">Erreur : {message}</div>;
  }

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col md={6}><h1><PeopleFill className="me-3" />Gestion des Utilisateurs</h1></Col>
        <Col md={6} className="text-md-end">
            <Button as={Link} to="/parametres/utilisateurs/nouveau">
                <PersonPlusFill className="me-2" /> Nouvel Utilisateur
            </Button>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
            <Table columns={columns} data={users} isLoading={isLoading} />
        </Card.Body>
        {pagination && pagination.pages > 1 && (
            <Card.Footer>
                <Pagination
                    currentPage={currentPage}
                    totalCount={pagination.total}
                    pageSize={pagination.limit}
                    onPageChange={setCurrentPage}
                />
            </Card.Footer>
        )}
      </Card>
    </div>
  );
};

export default UtilisateursPage;