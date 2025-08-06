// client/src/components/common/ConfirmDialog.jsx
import React from 'react';
import GenericModal from './Modal';

const ConfirmDialog = ({
  show,
  onHide,
  title,
  children,
  onConfirm,
  isConfirming = false,
  confirmText = 'Confirmer',
  confirmVariant = 'danger', // La confirmation est souvent pour une action destructive
  cancelText = 'Annuler',
}) => {
  return (
    <GenericModal
      show={show}
      onHide={onHide}
      title={title}
      onConfirm={onConfirm}
      confirmText={confirmText}
      confirmVariant={confirmVariant}
      cancelText={cancelText}
      isConfirming={isConfirming}
      size="md"
      centered
    >
      {children}
    </GenericModal>
  );
};

export default ConfirmDialog;