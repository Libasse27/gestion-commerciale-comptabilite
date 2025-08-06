// client/src/routes/Root.jsx
// ==============================================================================
//           Composant Racine de l'Application (Root)
//
// Ce composant sert de point d'entrée pour le rendu de toutes les routes.
// C'est la coquille la plus externe de notre application après les providers.
//
// Il est l'endroit idéal pour placer une logique qui doit s'exécuter
// une seule fois au chargement de l'application, comme la vérification
// initiale de la session ou la configuration de bibliothèques globales.
// ==============================================================================

import React from 'react';
import { Outlet } from 'react-router-dom';

const Root = () => {
  // Pour l'instant, ce composant ne fait qu'afficher les routes enfants.
  // On pourrait y ajouter un useEffect pour une logique d'initialisation.
  // Exemple :
  useEffect(() => {
    //   dispatch(trySilentLogin()); // Tenter de rafraîchir le token au premier chargement
  }, [dispatch]);

  return (
    <>
      {/* 
        <Outlet /> est le placeholder où React Router va rendre la route 
        qui correspond à l'URL actuelle. Ce sera soit les routes publiques, 
        soit les routes privées.
      */}
      <Outlet />
    </>
  );
};

export default Root;