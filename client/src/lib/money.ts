// Helpers para conversão de valores monetários BRL
export function parseBRLToCents(input: string): number {
  const onlyDigits = (input ?? '').replace(/\D/g, '');
  return onlyDigits ? parseInt(onlyDigits, 10) : 0;
}

export function formatCentsToBRL(cents: number): string {
  const v = (cents ?? 0) / 100;
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatInputBRL(input: string): string {
  const cents = parseBRLToCents(input);
  return formatCentsToBRL(cents);
}