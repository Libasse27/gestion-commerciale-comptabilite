// client/src/components/forms/Select.jsx
import React from 'react';
import { Form } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * Affiche une liste déroulante (`<select>`) à partir d'un tableau d'options.
 */
const Select = ({
  name,
  value,
  onChange,
  options,
  placeholder = 'Sélectionnez...',
  isInvalid = false,
  disabled = false,
  ...props
}) => {
  return (
    <Form.Select
      name={name}
      value={value}
      onChange={onChange}
      isInvalid={isInvalid}
      disabled={disabled}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options && options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Form.Select>
  );
};

Select.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  placeholder: PropTypes.string,
  isInvalid: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default Select;