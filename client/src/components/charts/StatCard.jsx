// ==============================================================================
//           Composant Carte de Statistique (StatCard)
//
// Ce composant réutilisable est conçu pour afficher un indicateur de
// performance clé (KPI) sur un tableau de bord.
//
// Il combine une icône, une valeur principale, un titre et une variation
// optionnelle pour une présentation claire et impactante des données.
// ==============================================================================

import React from 'react';
import { Card, Spinner } from 'react-bootstrap';
import { ArrowDownRight, ArrowUpRight } from 'react-bootstrap-icons';
import { formatCurrency } from '../../utils/currencyUtils'; // Ou un autre formateur

/**
 * Affiche une carte de statistique (KPI) pour un tableau de bord.
 *
 * @param {object} props - Les propriétés du composant.
 * @param {React.ReactNode} props.icon - L'icône à afficher (composant de react-bootstrap-icons).
 * @param {string | number} props.value - La valeur principale du KPI.
 * @param {string} props.title - Le titre du KPI.
 * @param {string} [props.iconVariant='primary'] - La couleur de l'icône (primary, success, etc.).
 * @param {boolean} [props.isLoading=false] - Si true, affiche un spinner à la place de la valeur.
 * @param {function(string|number): string} [props.formatter] - Une fonction pour formater la valeur (ex: formatCurrency).
 * @param {object} [props.change] - Informations sur la variation par rapport à la période précédente.
 * @param {number} [props.change.value] - La valeur du changement (ex: 15.2).
 * @param {('increase'|'decrease')} [props.change.direction] - La direction du changement.
 */
const StatCard = ({
  icon,
  value,
  title,
  iconVariant = 'primary',
  isLoading = false,
  formatter,
  change,
}) => {
  const IconComponent = icon;

  const renderChange = () => {
    if (!change || typeof change.value === 'undefined') {
      return null;
    }

    const isIncrease = change.direction === 'increase';
    const changeColor = isIncrease ? 'text-success' : 'text-danger';
    const ChangeIcon = isIncrease ? ArrowUpRight : ArrowDownRight;

    return (
      <span className={`ms-2 small fw-bold ${changeColor}`}>
        <ChangeIcon size={12} /> {change.value}%
      </span>
    );
  };

  return (
    <Card className="h-100 shadow-sm border-0">
      <Card.Body>
        <div className="d-flex align-items-center">
          <div className={`stat-card-icon bg-${iconVariant}-light text-${iconVariant} rounded-circle me-3`}>
            <IconComponent size={24} />
          </div>
          <div className="stat-card-info">
            <h5 className="text-muted fw-normal mb-1">{title}</h5>
            <div className="d-flex align-items-baseline">
              {isLoading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <h3 className="fw-bold mb-0">
                  {formatter ? formatter(value) : value}
                </h3>
              )}
              {renderChange()}
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

// Styles CSS à ajouter
// Dans `components.css` par exemple :
/*
.stat-card-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bg-primary-light {
  background-color: rgba(var(--bs-primary-rgb), 0.1);
}
.bg-success-light {
  background-color: rgba(var(--bs-success-rgb), 0.1);
}
// etc. pour les autres variantes
*/

export default StatCard;