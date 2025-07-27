// ==============================================================================
//           Composant de Boîte de Dialogue de Confirmation
//
// Ce composant est une spécialisation du `GenericModal` conçu spécifiquement
// pour les actions de confirmation (ex: suppression, validation).
//
// Il simplifie l'interface en se concentrant sur les props essentielles pour
// une confirmation : un titre, un message, et les actions de confirmation/annulation.
//
// Il réutilise le `GenericModal` pour toute sa logique de base.
// ==============================================================================

import React from 'react';
import GenericModal from './Modal'; // Notre composant de modale de base

/**
 * Affiche une boîte de dialogue pour confirmer une action.
 *
 * @param {object} props - Les propriétés du composant.
 * @param {boolean} props.show - Booléen pour contrôler l'affichage.
 * @param {function} props.onHide - Fonction pour fermer la dialogue.
 * @param {string} props.title - Le titre de la dialogue (ex: "Confirmation de Suppression").
 * @param {React.ReactNode} props.children - Le message ou le corps de la question de confirmation.
 * @param {function} props.onConfirm - La fonction à exécuter lorsque l'utilisateur confirme.
 * @param {boolean} [props.isConfirming=false] - Si true, affiche un loader dans le bouton de confirmation.
 * @param {string} [props.confirmText='Confirmer'] - Le texte du bouton de confirmation.
 * @param {string} [props.confirmVariant='primary'] - La variante de couleur du bouton de confirmation ('primary', 'danger', etc.).
 * @param {string} [props.cancelText='Annuler'] - Le texte du bouton d'annulation.
 */
const ConfirmDialog = ({
  show,
  onHide,
  title,
  children,
  onConfirm,
  isConfirming = false,
  confirmText = 'Confirmer',
  confirmVariant = 'primary',
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
      size="md" // Les dialogues de confirmation sont généralement de taille moyenne
      centered
    >
      {children}
    </GenericModal>
  );
};

export default ConfirmDialog;