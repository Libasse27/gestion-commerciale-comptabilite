// client/src/components/charts/StatCard.jsx
import React from 'react';
import { Card, Spinner } from 'react-bootstrap';
import { ArrowDownRight, ArrowUpRight } from 'react-bootstrap-icons';

// CSS pour les icônes (à ajouter dans un fichier CSS global, ex: App.css)
/*
.stat-card-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bg-primary-light { background-color: rgba(var(--bs-primary-rgb), 0.1); }
.bg-success-light { background-color: rgba(var(--bs-success-rgb), 0.1); }
.bg-warning-light { background-color: rgba(var(--bs-warning-rgb), 0.1); }
.bg-danger-light { background-color: rgba(var(--bs-danger-rgb), 0.1); }
.bg-info-light { background-color: rgba(var(--bs-info-rgb), 0.1); }
*/

const StatCard = ({
  icon: Icon,
  value,
  title,
  iconVariant = 'primary',
  isLoading = false,
  formatter = (val) => val, // Fournit un formateur par défaut
  change,
}) => {

  const renderChange = () => {
    if (isLoading || !change || typeof change.value !== 'number') return null;
    const isPositive = change.value >= 0;
    const changeColor = isPositive ? 'text-success' : 'text-danger';
    const ChangeIcon = isPositive ? ArrowUpRight : ArrowDownRight;

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
            <Icon size={24} />
          </div>
          <div className="flex-grow-1">
            <h6 className="text-muted fw-normal mb-1">{title}</h6>
            <div className="d-flex align-items-baseline">
              {isLoading ? (
                <Spinner animation="border" size="sm" variant={iconVariant} />
              ) : (
                <h3 className="fw-bold mb-0">
                  {formatter(value)}
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

export default StatCard;