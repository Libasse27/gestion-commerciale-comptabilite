// ==============================================================================
//                Composant Racine de l'Application : App
//
// Ce composant est le point d'entrée de plus haut niveau de l'arborescence
// des composants React.
//
// Il est maintenant également responsable de l'effet de bord global qui
// applique le thème (clair/sombre) à l'ensemble de l'application en
// modifiant un attribut sur l'élément `<html>`.
// ==============================================================================

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AppRoutes from './routes/routes';

/**
 * Le composant racine de l'application.
 */
function App() {
  // On lit le thème actuel depuis le `uiSlice` de notre store Redux.
  const { theme } = useSelector((state) => state.ui);

  // Ce `useEffect` s'exécute à chaque fois que la valeur du thème dans le store change.
  useEffect(() => {
    // On met à jour l'attribut `data-theme` sur l'élément <html>.
    // Le fichier `themes.css` utilise cet attribut pour appliquer les bonnes
    // variables de couleur.
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);


  return (
    <>
      <Router>
        <AppRoutes />
      </Router>

      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        // On lie le thème du ToastContainer au thème de notre application
        theme={theme}
      />
    </>
  );
}

export default App;