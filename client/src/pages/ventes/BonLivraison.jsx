// client/src/pages/ventes/BonLivraisonPage.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { Card, Row, Col, Button, Table } from 'react-bootstrap';
import { Truck } from 'react-bootstrap-icons';

import { fetchBonLivraisonById, reset } from '../../store/slices/ventesSlice';
import { formatDate } from '../../utils/formatters';
import Loader from '../../components/common/Loader';
import PrintButton from '../../components/print/PrintButton';

const BonLivraisonPage = () => {
  const { id: blId } = useParams();
  const dispatch = useDispatch();

  const { bonLivraisonCourant, status, message } = useSelector((state) => state.ventes);
  const isLoading = status === 'loading';

  useEffect(() => {
    if (blId) {
      dispatch(fetchBonLivraisonById(blId));
    }
    return () => dispatch(reset());
  }, [blId, dispatch]);

  if (isLoading && !bonLivraisonCourant) return <Loader centered />;
  if (status === 'failed' && !bonLivraisonCourant) return <div className="alert alert-danger">Erreur : {message}</div>;
  if (!bonLivraisonCourant) return null;
  
  const { client, commandeOrigine, lignes, ...bl } = bonLivraisonCourant;

  return (
    <>
      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="h2"><Truck className="me-3" />Bon de Livraison {bl.numero}</h1>
          <p className="text-muted">Lié à la commande <Link to={`/ventes/commandes/${commandeOrigine._id}`}>{commandeOrigine.numero}</Link></p>
        </Col>
        <Col className="text-end">
          <PrintButton elementIdToPrint="bl-pdf" pageTitle={`Bon de Livraison ${bl.numero}`} />
        </Col>
      </Row>

      <Card className="shadow-sm" id="bl-pdf">
        <Card.Body className="p-4">
            <Row className="mb-4">
                <Col>
                    <h5>Livré à :</h5>
                    <Link to={`/clients/${client._id}`}><strong>{client.nom}</strong></Link>
                    <p className="mb-0">{bl.adresseLivraison}</p>
                </Col>
                <Col className="text-end">
                    <p className="mb-0"><strong>Date de livraison :</strong> {formatDate(bl.dateLivraison)}</p>
                </Col>
            </Row>
            
            <Table bordered responsive>
              <thead className="bg-light"><tr><th>Référence</th><th>Description</th><th>Quantité Livrée</th></tr></thead>
              <tbody>
                {lignes.map((ligne, i) => (
                    <tr key={i}>
                        <td>{ligne.produit.reference}</td>
                        <td>{ligne.description}</td>
                        <td className="text-center">{ligne.quantite}</td>
                    </tr>
                ))}
              </tbody>
            </Table>
        </Card.Body>
      </Card>
    </>
  );
};

export default BonLivraisonPage;