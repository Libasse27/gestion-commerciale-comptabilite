// client/src/components/forms/DatePicker.jsx
import React from 'react';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import { Form, InputGroup } from 'react-bootstrap';
import { CalendarEvent } from 'react-bootstrap-icons';
import 'react-datepicker/dist/react-datepicker.css';
import { fr } from 'date-fns/locale';

registerLocale('fr', fr);

const DatePicker = ({
  selected,
  onChange,
  placeholderText = "Sélectionnez une date",
  isInvalid = false,
  disabled = false,
  ...props
}) => {

  const CustomInput = React.forwardRef(({ value, onClick, placeholder }, ref) => (
    <InputGroup hasValidation>
      <Form.Control
        value={value}
        onClick={onClick}
        ref={ref}
        placeholder={placeholder}
        isInvalid={isInvalid}
        readOnly
        disabled={disabled}
        autoComplete="off"
      />
      <InputGroup.Text>
        <CalendarEvent />
      </InputGroup.Text>
    </InputGroup>
  ));
  
  CustomInput.displayName = 'CustomDatePickerInput';

  return (
    <ReactDatePicker
      selected={selected}
      onChange={onChange}
      locale="fr"
      dateFormat="dd/MM/yyyy"
      customInput={<CustomInput placeholder={placeholderText} />}
      disabled={disabled}
      {...props}
    />
  );
};

export default DatePicker;