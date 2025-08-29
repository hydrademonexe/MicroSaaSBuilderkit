import React, { forwardRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { formatWhatsApp, parseWhatsApp, validateWhatsApp, formatCEP, parseCEP, validateCEP, addCurrencyMask, parseCurrency } from '@/lib/formatters';

interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  mask: 'whatsapp' | 'cep' | 'currency';
  value?: string;
  onChange?: (value: string) => void;
  onValidationChange?: (isValid: boolean) => void;
}

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ mask, value = '', onChange, onValidationChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(() => {
      if (mask === 'whatsapp') return formatWhatsApp(value);
      if (mask === 'cep') return formatCEP(value);
      if (mask === 'currency') return value;
      return value;
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value;
      let parsedValue = '';
      let isValid = true;

      switch (mask) {
        case 'whatsapp':
          const formatted = formatWhatsApp(newValue);
          parsedValue = parseWhatsApp(newValue);
          isValid = validateWhatsApp(newValue);
          setDisplayValue(formatted);
          break;
        case 'cep':
          const formattedCEP = formatCEP(newValue);
          parsedValue = parseCEP(newValue);
          isValid = newValue === '' || validateCEP(newValue);
          setDisplayValue(formattedCEP);
          break;
        case 'currency':
          const currencyFormatted = formatCurrencyInput(newValue);
          parsedValue = parseCurrency(currencyFormatted).toString();
          setDisplayValue(currencyFormatted);
          break;
        default:
          parsedValue = newValue;
          setDisplayValue(newValue);
      }

      onChange?.(parsedValue);
      onValidationChange?.(isValid);
    };

    return (
      <Input
        {...props}
        ref={ref}
        value={displayValue}
        onChange={handleChange}
        className={`${props.className || ''} ${
          mask === 'whatsapp' && !validateWhatsApp(displayValue) && displayValue.length > 0
            ? 'border-red-500'
            : ''
        }`}
      />
    );
  }
);

MaskedInput.displayName = 'MaskedInput';