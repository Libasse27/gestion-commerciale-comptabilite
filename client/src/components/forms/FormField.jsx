// client/src/components/forms/FormField.jsx
import React from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import PropTypes from 'prop-types';

const FormField = ({
  label,
  name,
  error,
  helpText,
  children,
  as = 'input',
  type = 'text',
  icon,
  ...props
}) => {
  const isInvalid = !!error;

  const renderControl = () => {
    if (children) {
      return React.cloneElement(children, { isInvalid, ...props });
    }

    const control = <Form.Control as={as} type={type} name={name} {...props} isInvalid={isInvalid} />;

    if (icon) {
      return (
        <InputGroup hasValidation>
          <InputGroup.Text>{icon}</InputGroup.Text>
          {control}
          {isInvalid && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
        </InputGroup>
      );
    }
    
    return (
      <>
        {control}
        <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
      </>
    );
  };

  return (
    <Form.Group className="mb-3" controlId={name}>
      {label && <Form.Label>{label}</Form.Label>}
      {renderControl()}
      {helpText && !error && <Form.Text className="text-muted">{helpText}</Form.Text>}
    </Form.Group>
  );
};

FormField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  error: PropTypes.string,
  helpText: PropTypes.string,
  children: PropTypes.element,
  as: PropTypes.oneOf(['input', 'textarea', 'select']),
  type: PropTypes.string,
  icon: PropTypes.node,
};

export default FormField;