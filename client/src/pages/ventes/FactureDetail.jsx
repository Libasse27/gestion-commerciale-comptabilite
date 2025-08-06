// client/src/pages/ventes/FactureDetailPage.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { Card, Row, Col, Button, Badge, Table } from 'react-bootstrap';
import { FileText, Printer, CreditCard } from 'react-bootstrap-icons';

import { fetchFactureById, reset } from '../../store/slices/ventesSlice';
import { formatCurrency, formatDate, formatStatus } from '../../utils/formatters';
import Loader from '../../components/common/Loader';
import PrintButton from '../../components/print/PrintButton';

const FactureDetailPage = () => {
  const { id: factureId } = useParams();
  const dispatch = useDispatch();

  const { factureCourante, status, message } = useSelector((state) => state.ventes);
  const isLoading = status === 'loading';

  useEffect(() => {
    if (factureId) {
      dispatch(fetchFactureById(factureId));
    }
    return () => dispatch(reset());
  }, [factureId, dispatch]);

  if (isLoading && !factureCourante) return <Loader centered />;
  if (status === 'failed' && !factureCourante) return <div className="alert alert-danger">Erreur : {message}</div>;
  if (!factureCourante) return null;
  
  const { client, lignes, ...facture } = factureCourante;

  return (
    <>
      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="h2"><FileText className="me-3" />Facture {facture.numero}</h1>
          <Badge bg="primary">{formatStatus(facture.statut)}</Badge>
        </Col>
        <Col className="text-end">
          <PrintButton elementIdToPrint="facture-pdf" pageTitle={`Facture ${facture.numero}`} variant="secondary" className="me-2" />
          <Button variant="success"><CreditCard className="me-2" />Enregistrer un paiement</Button>
        </Col>
      </Row>

      <Card className="shadow-sm" id="facture-pdf">
        <Card.Body className="p-4">
            {/* Header de la facture */}
            <Row className="mb-4">
                <Col>
                    <h5>Facturé à :</h5>
                    <Link to={`/clients/${client._id}`}><strong>{client.nom}</strong></Link>
                    <p className="mb-0">{client.adresse}</p>
                </Col>
                <Col className="text-end">
                    <p className="mb-0"><strong>Date d'émission :</strong> {formatDate(facture.dateEmission)}</p>
                    <p className="mb-0"><strong>Date d'échéance :</strong> {formatDate(facture.dateEcheance)}</p>
                </Col>
            </Row>
            
            {/* Lignes de la facture */}
            <Table bordered responsive>
              <thead className="bg-light"><tr><th>Description</th><th>Qté</th><th>Prix U. HT</th><th>Total HT</th></tr></thead>
              <tbody>
                {lignes.map((ligne, i) => (
                    <tr key={i}>
                        <td>{ligne.description}</td>
                        <td>{ligne.quantite}</td>
                        <td>{formatCurrency(ligne.prixUnitaireHT)}</td>
                        <td className="text-end">{formatCurrency(ligne.totalHT)}</td>
                    </tr>
                ))}
              </tbody>
            </Table>

            {/* Totaux */}
            <Row className="justify-content-end mt-3">
                <Col md={4}>
                    <p><strong>Total HT :</strong><span className="float-end">{formatCurrency(facture.totalHT)}</span></p>
                    <p><strong>TVA :</strong><span className="float-end">{formatCurrency(facture.totalTVA)}</span></p>
                    <h4 className="fw-bold">Total TTC :<span className="float-end">{formatCurrency(facture.totalTTC)}</span></h4>
                    <hr />
                    <p><strong>Montant Payé :</strong><span className="float-end">{formatCurrency(facture.montantPaye)}</span></p>
                    <h5 className="text-danger fw-bold">Solde Dû :<span className="float-end">{formatCurrency(facture.soldeDu)}</span></h5>
                </Col>
            </Row>
        </Card.Body>
      </Card>
    </>
  );
};

export default FactureDetailPage;