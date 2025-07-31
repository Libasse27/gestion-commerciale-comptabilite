// ==============================================================================
//           Contexte React pour la Gestion des Notifications (Toasts)
//
// Ce module fournit un système de notifications global pour l'application.
//
// - NotificationProvider : Gère l'état de la file d'attente des notifications
//   et affiche les Toasts dans un conteneur positionné.
// - useNotification : Un hook simple pour que n'importe quel composant puisse
//   déclencher l'affichage d'une notification.
// ==============================================================================

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { CheckCircleFill, ExclamationTriangleFill, InfoCircleFill, XCircleFill } from 'react-bootstrap-icons';
import { UI_SETTINGS, TOAST_TYPES } from '../utils/constants';

// 1. Création du Contexte
const NotificationContext = createContext(null);

// Mappage des types de toasts aux variantes de couleur et icônes Bootstrap
const toastConfig = {
  [TOAST_TYPES.SUCCESS]: { variant: 'success', Icon: CheckCircleFill },
  [TOAST_TYPES.ERROR]: { variant: 'danger', Icon: XCircleFill },
  [TOAST_TYPES.INFO]: { variant: 'info', Icon: InfoCircleFill },
  [TOAST_TYPES.WARNING]: { variant: 'warning', Icon: ExclamationTriangleFill },
};

/**
 * Le Provider qui va gérer la logique et l'affichage des notifications.
 * @param {{children: React.ReactNode}} props
 */
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  /**
   * Ajoute une nouvelle notification à la file d'attente.
   */
  const addNotification = useCallback((message, type = TOAST_TYPES.INFO) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, message, type }]);
  }, []);

  /**
   * Supprime une notification de la file d'attente par son ID.
   */
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // La valeur du contexte n'expose que la fonction `addNotification`.
  const contextValue = useMemo(() => ({ addNotification }), [addNotification]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}

      {/* Le conteneur qui affichera les toasts en haut à droite de l'écran */}
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        {notifications.map(({ id, message, type }) => {
          const { variant, Icon } = toastConfig[type] || toastConfig[TOAST_TYPES.INFO];
          return (
            <Toast
              key={id}
              bg={variant}
              onClose={() => removeNotification(id)}
              delay={UI_SETTINGS.TOAST_DEFAULT_DURATION}
              autohide
              className="text-white"
            >
              <Toast.Body className="d-flex align-items-center">
                <Icon size={20} className="me-2" />
                <span>{message}</span>
              </Toast.Body>
            </Toast>
          );
        })}
      </ToastContainer>
    </NotificationContext.Provider>
  );
};

/**
 * Hook personnalisé pour consommer facilement le Contexte de Notification.
 * @returns {{addNotification: (message: string, type?: string) => void}}
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification doit être utilisé à l\'intérieur d\'un NotificationProvider');
  }
  return context;
};