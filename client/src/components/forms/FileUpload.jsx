// client/src/components/forms/FileUpload.jsx
import React, { useRef } from 'react';
import { Form, Button, InputGroup } from 'react-bootstrap';
import { FileEarmarkArrowUp, XCircle } from 'react-bootstrap-icons';
import PropTypes from 'prop-types';

const FileUpload = ({
  name,
  selectedFile,
  onFileSelect,
  placeholder = 'Aucun fichier sélectionné',
  accept,
  isInvalid = false,
  disabled = false,
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    onFileSelect(file || null);
  };

  const handleButtonClick = () => fileInputRef.current?.click();

  const handleRemoveFile = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        name={name}
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      
      <InputGroup hasValidation>
        <Button variant="outline-secondary" onClick={handleButtonClick} disabled={disabled}>
          <FileEarmarkArrowUp className="me-2" />
          Choisir un fichier
        </Button>
        <Form.Control
          value={selectedFile ? selectedFile.name : ''}
          placeholder={placeholder}
          readOnly
          isInvalid={isInvalid}
          disabled={disabled}
          style={{ backgroundColor: '#fff' }} // Forcer le fond blanc même en disabled
        />
        {selectedFile && (
          <Button variant="outline-secondary" onClick={handleRemoveFile} disabled={disabled}>
            <XCircle />
          </Button>
        )}
        {/* L'erreur sera affichée par le composant FormField parent */}
      </InputGroup>
    </>
  );
};

FileUpload.propTypes = {
  name: PropTypes.string,
  selectedFile: PropTypes.object,
  onFileSelect: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  accept: PropTypes.string,
  isInvalid: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default FileUpload;