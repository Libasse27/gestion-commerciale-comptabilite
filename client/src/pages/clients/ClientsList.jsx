// ==============================================================================
//           Page d'Affichage de la Liste des Clients
//
// MISE À JOUR : Utilise maintenant le hook `useClients` pour une meilleure
// abstraction de l'état Redux.
// ==============================================================================

import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Row, Col, Badge, Card } from 'react-bootstrap';
import { PersonPlusFill } from 'react-bootstrap-icons';

// --- Importations internes ---
import { fetchClients } from '../../store/slices/clientsSlice';
import { useClients } from '../../hooks/useClients'; // <-- Importer le hook
import { useDebounce } from '../../hooks/useDebounce';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import ExportExcel from '../../components/print/ExportExcel';
import { formatCurrency } from '../../utils/currencyUtils';

const ClientsListPage = () => {
  const dispatch = useDispatch();

  // --- Lecture de l'état depuis Redux via le hook personnalisé ---
  const { clients, pagination, isLoading, isError, message } = useClients();

  // --- États locaux pour le contrôle de l'UI ---
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // --- Effet pour charger les données ---
  useEffect(() => {
    dispatch(fetchClients({ page: currentPage, limit: 10, search: debouncedSearchQuery }));
  }, [currentPage, debouncedSearchQuery, dispatch]);


  // --- Définition des colonnes pour le tableau et l'export ---
  const columns = useMemo(
    () => [
      { Header: 'Code', accessor: 'codeClient' },
      {
        Header: 'Nom du Client',
        accessor: 'nom',
        Cell: ({ row }) => <Link to={`/clients/${row._id}`}>{row.nom}</Link>,
      },
      { Header: 'Email', accessor: 'email' },
      { Header: 'Téléphone', accessor: 'telephone' },
      {
        Header: 'Solde',
        accessor: 'solde',
        Cell: ({ row }) => (
          <span className={row.solde < 0 ? 'text-danger fw-bold' : ''}>
            {formatCurrency(row.solde)}
          </span>
        ),
      },
      {
        Header: 'Statut',
        accessor: 'isActive',
        Cell: ({ row }) => (
          <Badge bg={row.isActive ? 'success' : 'secondary'}>
            {row.isActive ? 'Actif' : 'Inactif'}
          </Badge>
        ),
      },
      {
          Header: 'Actions',
          accessor: '_id',
          Cell: ({ row }) => (
              <Button as={Link} to={`/clients/${row._id}/modifier`} variant="outline-primary" size="sm">
                  Modifier
              </Button>
          )
      }
    ],
    []
  );

  const columnsForExport = columns.filter(col => col.accessor !== '_id');

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  if (isError) {
    return <div className="alert alert-danger">Erreur : {message}</div>;
  }

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col>
          <h1>Clients</h1>
          <p className="text-muted">Gérez votre portefeuille de clients.</p>
        </Col>
        <Col className="text-end">
            <ExportExcel
                data={clients}
                columns={columnsForExport}
                filename="export_clients"
                buttonText="Exporter"
                variant="outline-success"
                className="me-2"
            />
            <Button as={Link} to="/clients/nouveau">
                <PersonPlusFill className="me-2" />
                Nouveau Client
            </Button>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Header>
            <SearchBar
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Rechercher par nom, code ou email..."
                disabled={isLoading}
            />
        </Card.Header>
        <Card.Body className="p-0">
            <Table
                columns={columns}
                data={clients}
                isLoading={isLoading}
                emptyMessage="Aucun client ne correspond à votre recherche."
            />
        </Card.Body>
        {pagination && pagination.pages > 1 && (
            <Card.Footer>
                <Pagination
                    currentPage={pagination.page || 1}
                    totalPages={pagination.pages || 1}
                    onPageChange={(page) => setCurrentPage(page)}
                />
            </Card.Footer>
        )}
      </Card>
    </div>
  );
};

export default ClientsListPage;