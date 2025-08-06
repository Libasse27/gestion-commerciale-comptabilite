// client/src/components/common/Modal.jsx
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import Loader from './Loader';

const GenericModal = ({
  show,
  onHide,
  title,
  children,
  onConfirm,
  confirmText = 'Sauvegarder',
  confirmVariant = 'primary',
  cancelText = 'Fermer',
  isConfirming = false,
  size = 'lg',
  centered = false,
}) => {
  return (
    <Modal show={show} onHide={onHide} size={size} centered={centered}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isConfirming}>
          {cancelText}
        </Button>
        {onConfirm && (
          <Button variant={confirmVariant} onClick={onConfirm} disabled={isConfirming}>
            {isConfirming ? <Loader size="sm" /> : confirmText}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default GenericModal;