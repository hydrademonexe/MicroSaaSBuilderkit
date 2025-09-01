// client/src/lib/formatters.ts

// =========================
// Currency (BRL) helpers
// =========================

export function formatCurrency(value: number): string {
  const v = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}

/**
 * parseCurrency:
 * - Accepts strings like "R$ 005,00", "5,00", "12.5", "1.200,00", "1200"
 * - Returns number in BRL (e.g., 5, 12.5, 1200)
 */
export function parseCurrency(input: string | number | null | undefined): number {
  if (typeof input === "number") return input;
  if (!input) return 0;

  let s = String(input).trim();

  // Keep only digits, comma, dot, minus
  s = s.replace(/[^\d,.\-]/g, "");

  // Decide decimal separator as the last ',' or '.'
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  const hasSep = lastComma !== -1 || lastDot !== -1;

  if (hasSep) {
    const decPos = Math.max(lastComma, lastDot);
    const intPart = s.slice(0, decPos).replace(/[^\d\-]/g, "");
    const fracPart = s.slice(decPos + 1).replace(/[^\d]/g, "");
    const frac2 = (fracPart + "00").slice(0, 2);
    const normalized = `${intPart}.${frac2}`;
    const num = Number(normalized);
    return Number.isFinite(num) ? num : 0;
  }

  const intOnly = s.replace(/[^\d\-]/g, "");
  if (intOnly === "" || intOnly === "-") return 0;
  const num = Number(intOnly);
  return Number.isFinite(num) ? num : 0;
}

/**
 * formatCurrencyInput:
 * For typing in inputs: converts raw digits to "0,00" style without "R$"
 * Example: "5" -> "0,05", "500" -> "5,00"
 */
export function formatCurrencyInput(input: string): string {
  if (input == null) return "";
  const digits = String(input).replace(/\D/g, "");
  if (digits.length === 0) return "";
  const cents = parseInt(digits, 10);
  const value = cents / 100;
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Adds "R$ " prefix to a currency input string (already in 0,00 format) */
export function addCurrencyMask(input: any): string {
  const raw: string = typeof input === 'string'
    ? input
    : (input && input.target && typeof input.target.value === 'string' ? input.target.value : '');
  const n = parseCurrency(raw);
  return formatCurrency(n);
}

/** For displaying with "R$ " */
export function formatCurrencyDisplay(input: string | number): string {
  const value = parseCurrency(input);
  return formatCurrency(value);
}

// =========================
// Pricing helpers
// =========================

/** Valid margin percentage (0–95) */
export function validateMargin(marginPercent: number): { valid: boolean; warning?: string; error?: string } {
  if (!Number.isFinite(marginPercent)) return false;
  
  if (marginPercent < 0) {
    return { valid: false, error: "Margem não pode ser negativa" };
  }
  
  if (marginPercent > 300) {
    return { valid: false, error: "Margem muito alta (máximo 300%)" };
  }
  
  if (marginPercent >= 95 && marginPercent <= 300) {
    return { valid: true, warning: "Margem muito alta pode distorcer preço" };
  }
  
  return { valid: true };
}

/**
 * calculatePricing:
 * Given ingredient cost, yield and desired margin %, returns pricing calculations.
 */
export function calculatePricing(ingredientCost: number, unitsProduced: number, marginPercent: number): {
  custoUnit: number;
  precoSugerido: number;
  lucroUnit: number;
} {
  const cost = Number.isFinite(ingredientCost) ? ingredientCost : 0;
  const units = Number.isFinite(unitsProduced) && unitsProduced > 0 ? unitsProduced : 1;
  const margin = Math.max(0, Math.min(300, marginPercent));
  
  const custoUnit = Number((cost / units).toFixed(2));
  const precoSugerido = Number((custoUnit * (1 + margin / 100)).toFixed(2));
  const lucroUnit = Number((precoSugerido - custoUnit).toFixed(2));
  
  return {
    custoUnit,
    precoSugerido,
    lucroUnit
  };
}

// =========================
// WhatsApp helpers (BR)
// =========================

/** Remove non-digits, keep up to 11 (DDI opcional ignorado, assume BR local) */
export function parseWhatsApp(input: string): string {
  const digits = String(input).replace(/\D/g, "");
  // If includes leading 55, drop it
  const trimmed = digits.startsWith("55") ? digits.slice(2) : digits;
  // Keep 10 or 11 digits
  return trimmed.slice(0, 11);
}

export function validateWhatsApp(input: string): boolean {
  const d = parseWhatsApp(input);
  return d.length === 10 || d.length === 11;
}

/** Format (XX) XXXXX-XXXX or (XX) XXXX-XXXX */
export function formatWhatsApp(input: string): string {
  const d = parseWhatsApp(input);
  if (d.length <= 2) return d;
  const ddd = d.slice(0, 2);
  if (d.length === 10) {
    const p1 = d.slice(2, 6);
    const p2 = d.slice(6, 10);
    return `(${ddd}) ${p1}-${p2}`;
  }
  const p1 = d.slice(2, 7);
  const p2 = d.slice(7, 11);
  return `(${ddd}) ${p1}-${p2}`;
}

// =========================
// CEP helpers (BR)
// =========================

export function parseCEP(input: string): string {
  const d = String(input).replace(/\D/g, "");
  return d.slice(0, 8);
}

export function validateCEP(input: string): boolean {
  return parseCEP(input).length === 8;
}

export function formatCEP(input: string): string {
  const d = parseCEP(input);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5, 8)}`;
}
