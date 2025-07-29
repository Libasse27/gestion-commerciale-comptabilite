// ==============================================================================
//           Composant de Téléversement de Fichier (FileUpload)
//
// Ce composant fournit une interface utilisateur stylée et interactive pour
// la sélection de fichiers.
//
// Il masque l'input `<input type="file">` par défaut, qui est difficile à
// styler, et le remplace par un champ Bootstrap plus esthétique.
//
// Il gère l'affichage du nom du fichier sélectionné et permet de le retirer.
// ==============================================================================

import React, { useRef } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { FileEarmarkArrowUpFill, XCircleFill } from 'react-bootstrap-icons';

/**
 * Un champ de formulaire pour téléverser un fichier.
 *
 * @param {object} props - Les propriétés du composant.
 * @param {string} props.name - Le nom du champ.
 * @param {File | null} props.selectedFile - Le fichier actuellement sélectionné (un objet File).
 * @param {function(File | null): void} props.onFileSelect - La fonction de callback appelée avec l'objet File sélectionné ou null.
 * @param {string} [props.placeholder='Choisissez un fichier...'] - Le texte affiché quand aucun fichier n'est sélectionné.
 * @param {string} [props.accept] - Les types de fichiers acceptés (ex: "image/*", ".pdf").
 * @param {boolean} [props.isInvalid=false] - Pour le style de validation.
 * @param {boolean} [props.disabled=false] - Pour désactiver le champ.
 */
const FileUpload = ({
  name,
  selectedFile,
  onFileSelect,
  placeholder = 'Aucun fichier sélectionné',
  accept,
  isInvalid = false,
  disabled = false,
}) => {
  // useRef est utilisé pour déclencher le clic sur l'input caché
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    onFileSelect(file || null);
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
    // Réinitialiser la valeur de l'input pour pouvoir re-sélectionner le même fichier
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      {/* L'input de type "file" est caché mais fonctionnel */}
      <input
        type="file"
        name={name}
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      
      {/* L'interface visible par l'utilisateur */}
      <InputGroup>
        <Button
          variant="outline-secondary"
          onClick={handleButtonClick}
          disabled={disabled}
        >
          <FileEarmarkArrowUpFill className="me-2" />
          Parcourir...
        </Button>
        <Form.Control
          value={selectedFile ? selectedFile.name : placeholder}
          placeholder={placeholder}
          readOnly
          isInvalid={isInvalid}
          disabled={disabled}
          style={{ 
            backgroundColor: disabled ? '#e9ecef' : '#fff', 
            cursor: selectedFile ? 'default' : 'pointer'
          }}
          onClick={!selectedFile ? handleButtonClick : undefined}
        />
        {selectedFile && (
          <Button
            variant="outline-danger"
            onClick={handleRemoveFile}
            disabled={disabled}
            title="Retirer le fichier"
          >
            <XCircleFill />
          </Button>
        )}
      </InputGroup>
    </div>
  );
};

export default FileUpload;