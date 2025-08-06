// client/src/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import {
  CheckCircleFill,
  ExclamationTriangleFill,
  InfoCircleFill,
  XCircleFill,
} from 'react-bootstrap-icons';
import { UI_SETTINGS, TOAST_TYPES } from '../utils/constants';

const NotificationContext = createContext(null);

const toastConfig = {
  [TOAST_TYPES.SUCCESS]: { variant: 'success', Icon: CheckCircleFill },
  [TOAST_TYPES.ERROR]: { variant: 'danger', Icon: XCircleFill },
  [TOAST_TYPES.INFO]: { variant: 'info', Icon: InfoCircleFill },
  [TOAST_TYPES.WARNING]: { variant: 'warning', Icon: ExclamationTriangleFill },
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = TOAST_TYPES.INFO) => {
    // Empêche d’ajouter plusieurs fois exactement le même message à la suite
    setNotifications((prev) => {
      if (prev.some((n) => n.message === message && n.type === type)) return prev;
      const id = Date.now() + Math.random();
      return [...prev, { id, message, type }];
    });
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const renderToast = useCallback(({ id, message, type }) => {
    const { variant, Icon } = toastConfig[type] || toastConfig[TOAST_TYPES.INFO];

    return (
      <Toast
        key={id}
        bg={variant}
        onClose={() => removeNotification(id)}
        delay={UI_SETTINGS.TOAST_DEFAULT_DURATION}
        autohide
        className="text-white"
        role="alert"
      >
        <Toast.Header closeButton={false} className={`bg-${variant} text-white`}>
          <strong className="me-auto">Notification</strong>
        </Toast.Header>
        <Toast.Body className="d-flex align-items-center">
          <Icon size={20} className="me-3" />
          <span>{message}</span>
        </Toast.Body>
      </Toast>
    );
  }, [removeNotification]);

  const contextValue = useMemo(() => ({ addNotification }), [addNotification]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <ToastContainer
        position="top-end"
        className="p-3 notification-container"
        style={{ zIndex: 9999 }}
      >
        {notifications.map(renderToast)}
      </ToastContainer>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === null) {
    throw new Error("useNotification doit être utilisé à l'intérieur d'un NotificationProvider");
  }
  return context;
};