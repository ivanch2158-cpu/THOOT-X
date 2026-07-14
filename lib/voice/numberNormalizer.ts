// lib/voice/numberNormalizer.ts
// Convierte números en español hablado a enteros
// Soporta: "dieciséis", "uno seis", "treinta y seis", "uno punto seis"

// ── MAPA DE PALABRAS A DÍGITOS ────────────────────────────────────────────────

const UNIDADES: Record<string, number> = {
  cero: 0, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4,
  cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9,
};

const ESPECIALES: Record<string, number> = {
  diez: 10, once: 11, doce: 12, trece: 13, catorce: 14,
  quince: 15, dieciséis: 16, dieciseis: 16, diecisiete: 17,
  dieciocho: 18, diecinueve: 19,
  veinte: 20, veintiuno: 21, veintidós: 22, veintidos: 22,
  veintitrés: 23, veintitres: 23, veinticuatro: 24, veinticinco: 25,
  veintiséis: 26, veintiseis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29,
  treinta: 30, cuarenta: 40, cincuenta: 50,
};

// ── NORMALIZACIÓN ─────────────────────────────────────────────────────────────

/**
 * Convierte una representación verbal de número a entero.
 * Ejemplos:
 *   "dieciséis"  → 16
 *   "uno seis"   → 16
 *   "treinta y seis" → 36
 *   "cuatro ocho"    → 48
 *   "16"             → 16
 */
export function normalizeNumber(texto: string): number | null {
  const s = texto.toLowerCase().trim();

  // Número directo
  const directo = parseInt(s, 10);
  if (!isNaN(directo)) return directo;

  // Palabra especial de un solo token
  if (ESPECIALES[s] !== undefined) return ESPECIALES[s];
  if (UNIDADES[s] !== undefined) return UNIDADES[s];

  // "treinta y seis" → 30 + 6 = 36
  const treintaMatch = s.match(/^(treinta|cuarenta|cincuenta)\s+y\s+(.+)$/);
  if (treintaMatch) {
    const decena = ESPECIALES[treintaMatch[1]] ?? 0;
    const unidad = UNIDADES[treintaMatch[2]] ?? 0;
    if (unidad > 0) return decena + unidad;
  }

  // Dos tokens "uno seis" → 16, "cuatro ocho" → 48
  const tokens = s.split(/[\s.]+/);
  if (tokens.length === 2) {
    const d1 = UNIDADES[tokens[0]] ?? parseInt(tokens[0], 10);
    const d2 = UNIDADES[tokens[1]] ?? parseInt(tokens[1], 10);
    if (!isNaN(d1) && !isNaN(d2) && d1 >= 1 && d1 <= 9 && d2 >= 0 && d2 <= 9) {
      return d1 * 10 + d2;
    }
  }

  return null;
}

/**
 * Extrae el primer número de una cadena que puede contener texto mezclado.
 * Ejemplo: "el diente treinta y seis" → 36
 */
export function extractNumber(texto: string): number | null {
  // Intentar número directo primero
  const numMatch = texto.match(/\b(\d{1,2})\b/);
  if (numMatch) return parseInt(numMatch[1], 10);

  // Palabras especiales de dos dígitos
  for (const [palabra, valor] of Object.entries(ESPECIALES)) {
    if (texto.toLowerCase().includes(palabra)) return valor;
  }

  // "treinta y X"
  const treintaMatch = texto.toLowerCase().match(/(treinta|cuarenta|cincuenta)\s+y\s+(\w+)/);
  if (treintaMatch) {
    const decena = ESPECIALES[treintaMatch[1]] ?? 0;
    const unidad = UNIDADES[treintaMatch[2]] ?? 0;
    if (unidad > 0) return decena + unidad;
  }

  // Par de dígitos hablados: "cuatro ocho" → 48
  const tokensAll = texto.toLowerCase().split(/\s+/);
  for (let i = 0; i < tokensAll.length - 1; i++) {
    const d1 = UNIDADES[tokensAll[i]];
    const d2 = UNIDADES[tokensAll[i + 1]];
    if (d1 !== undefined && d2 !== undefined && d1 >= 1 && d1 <= 9 && d2 >= 0 && d2 <= 9) {
      return d1 * 10 + d2;
    }
  }

  return null;
}
