// ==============================================================================
//                Composant de Fenêtre Modale Générique
//
// Ce composant encapsule le composant `Modal` de `react-bootstrap` pour fournir
// une interface simple et réutilisable pour afficher des boîtes de dialogue.
//
// Il gère :
//   - L'affichage/masquage de la modale.
//   - Un titre, un corps et un pied de page personnalisables.
//   - Des boutons d'action (ex: Confirmer, Annuler) avec des callbacks.
//
// Son but est de standardiser l'apparence et le comportement des modales
// à travers toute l'application.
// ==============================================================================

import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import Loader from './Loader'; // Pour afficher un indicateur de chargement dans les boutons

/**
 * Affiche une fenêtre modale réutilisable.
 *
 * @param {object} props - Les propriétés du composant.
 * @param {boolean} props.show - Booléen pour contrôler l'affichage de la modale.
 * @param {function} props.onHide - Fonction à appeler lorsque la modale est fermée (via la croix, Echap, ou clic extérieur).
 * @param {string} props.title - Le titre à afficher dans l'en-tête de la modale.
 * @param {React.ReactNode} props.children - Le contenu (corps) de la modale.
 * @param {string} [props.size='lg'] - La taille de la modale ('sm', 'lg', 'xl').
 * @param {boolean} [props.centered=true] - Si true, la modale est centrée verticalement.
 * @param {string} [props.confirmText='Confirmer'] - Le texte du bouton de confirmation.
 * @param {function} [props.onConfirm] - La fonction à appeler lors du clic sur le bouton de confirmation.
 * @param {string} [props.cancelText='Annuler'] - Le texte du bouton d'annulation.
 * @param {function} [props.onCancel] - La fonction à appeler lors du clic sur le bouton d'annulation (par défaut, appelle onHide).
 * @param {string} [props.confirmVariant='primary'] - La variante de couleur du bouton de confirmation.
 * @param {boolean} [props.isConfirming=false] - Si true, affiche un loader dans le bouton de confirmation.
 * @param {boolean} [props.hideFooter=false] - Si true, masque le pied de page et les boutons.
 */
const GenericModal = ({
  show,
  onHide,
  title,
  children,
  size = 'lg',
  centered = true,
  confirmText = 'Confirmer',
  onConfirm,
  cancelText = 'Annuler',
  onCancel,
  confirmVariant = 'primary',
  isConfirming = false,
  hideFooter = false,
}) => {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={onHide} size={size} centered={centered}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>{children}</Modal.Body>

      {!hideFooter && (
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancel} disabled={isConfirming}>
            {cancelText}
          </Button>
          {onConfirm && (
            <Button variant={confirmVariant} onClick={onConfirm} disabled={isConfirming}>
              {isConfirming ? (
                <Loader size="sm" showText={false} variant="light" />
              ) : (
                confirmText
              )}
            </Button>
          )}
        </Modal.Footer>
      )}
    </Modal>
  );
};

export default GenericModal;