import { useState, useEffect, useRef } from 'react';
import { parseBRLToCents, formatCentsToBRL } from '@/lib/money';
import { cn } from '@/lib/utils';

interface CurrencyInputBRLProps {
  valueCents?: number;
  onChange: (cents: number) => void;
  required?: boolean;
  id?: string;
  name?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function CurrencyInputBRL({ 
  valueCents, 
  onChange, 
  required = false, 
  id, 
  name, 
  placeholder = "R$ 0,00",
  className,
  disabled = false
}: CurrencyInputBRLProps) {
  const [display, setDisplay] = useState(formatCentsToBRL(valueCents ?? 0));
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { 
    setDisplay(formatCentsToBRL(valueCents ?? 0)); 
  }, [valueCents]);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const cents = parseBRLToCents(e.target.value);
    setDisplay(formatCentsToBRL(cents));
    onChange(cents);
    e.currentTarget.setCustomValidity('');
  }

  function handleBlur() {
    if (required && (parseBRLToCents(display) <= 0)) {
      ref.current?.setCustomValidity('Informe um valor válido. Ex.: 12,50');
    } else {
      ref.current?.setCustomValidity('');
    }
    setDisplay(formatCentsToBRL(parseBRLToCents(display)));
  }

  return (
    <input
      ref={ref}
      id={id} 
      name={name}
      type="text" 
      inputMode="decimal" 
      autoComplete="off"
      value={display}
      onChange={handleInput} 
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        "flex h-11 sm:h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation",
        className
      )}
      aria-label="Preço (R$)"
    />
  );
}