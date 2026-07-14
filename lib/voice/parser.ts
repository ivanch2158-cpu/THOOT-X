// lib/voice/parser.ts
// Parser de comandos de voz para el odontograma
// Extrae número de diente, superficie y condición de una transcripción en español

import { extractNumber } from './numberNormalizer';

// ── TIPOS ─────────────────────────────────────────────────────────────────────

export type Superficie =
  | 'oclusal'
  | 'vestibular'
  | 'palatino'
  | 'mesial'
  | 'distal';

export type Condicion =
  | 'caries'
  | 'obturacion'
  | 'corona'
  | 'ausente'
  | 'fractura'
  | 'implante'
  | 'endodoncia'
  | 'sellante'
  | 'sano';

export interface OdontogramaCommand {
  numero_diente: number;
  superficie: Superficie;
  condicion: Condicion;
  transcript_original: string;
}

// ── SINÓNIMOS ─────────────────────────────────────────────────────────────────

const SINONIMOS_SUPERFICIE: Record<string, Superficie> = {
  // oclusal
  oclusal: 'oclusal',
  masticatoria: 'oclusal',
  oclusion: 'oclusal',
  'cara de mordida': 'oclusal',
  central: 'oclusal',
  centro: 'oclusal',
  // vestibular
  vestibular: 'vestibular',
  'de frente': 'vestibular',
  frontal: 'vestibular',
  bucal: 'vestibular',
  labial: 'vestibular',
  anterior: 'vestibular',
  // palatino / lingual
  palatino: 'palatino',
  lingual: 'palatino',
  posterior: 'palatino',
  palatal: 'palatino',
  interno: 'palatino',
  // mesial
  mesial: 'mesial',
  izquierdo: 'mesial',
  izquierda: 'mesial',
  proximal: 'mesial',
  // distal
  distal: 'distal',
  derecho: 'distal',
  derecha: 'distal',
  alejado: 'distal',
};

const SINONIMOS_CONDICION: Record<string, Condicion> = {
  // caries
  caries: 'caries',
  carie: 'caries',
  karies: 'caries',
  cavidad: 'caries',
  hueco: 'caries',
  lesion: 'caries',
  // obturación
  obturacion: 'obturacion',
  obturación: 'obturacion',
  empaste: 'obturacion',
  relleno: 'obturacion',
  resina: 'obturacion',
  amalgama: 'obturacion',
  restauracion: 'obturacion',
  restauración: 'obturacion',
  // corona
  corona: 'corona',
  funda: 'corona',
  casquillo: 'corona',
  // ausente
  ausente: 'ausente',
  extraido: 'ausente',
  extraído: 'ausente',
  perdido: 'ausente',
  'no está': 'ausente',
  falta: 'ausente',
  // fractura
  fractura: 'fractura',
  fracturado: 'fractura',
  partido: 'fractura',
  roto: 'fractura',
  rajado: 'fractura',
  // implante
  implante: 'implante',
  tornillo: 'implante',
  // endodoncia
  endodoncia: 'endodoncia',
  conducto: 'endodoncia',
  nervio: 'endodoncia',
  tratamiento: 'endodoncia',
  // sellante
  sellante: 'sellante',
  sello: 'sellante',
  sellado: 'sellante',
  // sano
  sano: 'sano',
  normal: 'sano',
  bien: 'sano',
  sin: 'sano',
};

// ── DISTANCIA DE LEVENSHTEIN (TOLERANCIA FONÉTICA) ────────────────────────────

function levenshtein(a: string, b: string): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

/**
 * Busca la condición más cercana fonéticamente (distancia Levenshtein ≤ 2).
 */
function matchCondicionFonetica(token: string): Condicion | null {
  let mejorMatch: Condicion | null = null;
  let mejorDist = 3;

  for (const [sinonimo, condicion] of Object.entries(SINONIMOS_CONDICION)) {
    const dist = levenshtein(token, sinonimo);
    if (dist < mejorDist) {
      mejorDist = dist;
      mejorMatch = condicion;
    }
  }

  return mejorDist <= 2 ? mejorMatch : null;
}

// ── EXTRACCIÓN ────────────────────────────────────────────────────────────────

function extraerSuperficie(texto: string): Superficie | null {
  const t = texto.toLowerCase();
  for (const [sinonimo, superficie] of Object.entries(SINONIMOS_SUPERFICIE)) {
    if (t.includes(sinonimo)) return superficie;
  }
  return null;
}

function extraerCondicion(texto: string): Condicion | null {
  const t = texto.toLowerCase();

  // Búsqueda exacta primero
  for (const [sinonimo, condicion] of Object.entries(SINONIMOS_CONDICION)) {
    if (t.includes(sinonimo)) return condicion;
  }

  // Búsqueda fonética (por tokens)
  const tokens = t.split(/\s+/);
  for (const token of tokens) {
    const match = matchCondicionFonetica(token);
    if (match) return match;
  }

  return null;
}

// ── VALIDACIÓN FDI ────────────────────────────────────────────────────────────

const DIENTES_VALIDOS = new Set([
  11, 12, 13, 14, 15, 16, 17, 18,
  21, 22, 23, 24, 25, 26, 27, 28,
  31, 32, 33, 34, 35, 36, 37, 38,
  41, 42, 43, 44, 45, 46, 47, 48,
  // Pediátricos
  51, 52, 53, 54, 55,
  61, 62, 63, 64, 65,
  71, 72, 73, 74, 75,
  81, 82, 83, 84, 85,
]);

// ── PARSER PRINCIPAL ──────────────────────────────────────────────────────────

/**
 * Parsea una transcripción de voz y extrae el comando de odontograma.
 *
 * Formatos reconocidos:
 *   "diente 16 oclusal caries"
 *   "diente dieciséis oclusal empaste"
 *   "el 16, cara oclusal, hay caries"
 *   "número treinta y seis, vestibular, fractura"
 *
 * Retorna null si no puede interpretar.
 */
export function parseOdontogramaCommand(
  transcript: string
): OdontogramaCommand | null {
  const texto = transcript.toLowerCase().trim();

  const numero = extractNumber(texto);
  if (!numero || !DIENTES_VALIDOS.has(numero)) return null;

  const superficie = extraerSuperficie(texto);
  if (!superficie) return null;

  const condicion = extraerCondicion(texto);
  if (!condicion) return null;

  return {
    numero_diente: numero,
    superficie,
    condicion,
    transcript_original: transcript,
  };
}

/**
 * Detecta comandos de control del odontograma por voz.
 */
export function parseControlCommand(
  transcript: string
): 'confirmar' | 'cancelar' | 'deshacer' | 'terminar' | null {
  const t = transcript.toLowerCase().trim();

  if (/^(confirmar|sí|si|listo|guardalo|guárdalo|de acuerdo|ok)$/.test(t)) return 'confirmar';
  if (/^(cancelar|no|cancela|borra|borrar)$/.test(t)) return 'cancelar';
  if (/^(deshacer|deshaz|quita el último|borrar último)$/.test(t)) return 'deshacer';
  if (/^(terminar|terminado|fin|finalizar|modo voz apagado|apagar voz|listo terminé)$/.test(t)) {
    return 'terminar';
  }

  return null;
}
