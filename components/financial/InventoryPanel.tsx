// components/financial/InventoryPanel.tsx
// Panel de inventario: equipos e insumos del consultorio

'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Package,
  Wrench,
  AlertTriangle,
  Plus,
  Loader2,
  AlertCircle,
  Box,
  TrendingDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// ── TIPOS ─────────────────────────────────────────────────────────────────────

interface Equipo {
  id: string;
  nombre: string;
  marca?: string;
  modelo?: string;
  serial?: string;
  categoria?: string;
  fecha_compra?: string;
  valor_compra?: number;
  valor_residual?: number;
  vida_util_anios?: number;
  estado: 'activo' | 'mantenimiento' | 'dado_de_baja';
  depreciacion_acumulada?: number;
  valor_en_libros?: number;
}

interface Insumo {
  id: string;
  nombre: string;
  categoria?: string;
  unidad_medida?: string;
  stock_minimo?: number;
  stock_actual: number;
  precio_unitario?: number;
  observaciones?: string;
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function formatMoneda(valor: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(valor);
}

function badgeEstado(estado: string) {
  const map: Record<string, { texto: string; clase: string }> = {
    activo: { texto: 'Activo', clase: 'bg-green-100 text-green-800' },
    mantenimiento: { texto: 'Mantenimiento', clase: 'bg-amber-100 text-amber-800' },
    dado_de_baja: { texto: 'Dado de baja', clase: 'bg-gray-100 text-gray-500' },
  };
  const b = map[estado] ?? { texto: estado, clase: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${b.clase}`}>
      {b.texto}
    </span>
  );
}

// ── PANEL EQUIPOS ─────────────────────────────────────────────────────────────

function PanelEquipos() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch('/api/inventory/equipment');
      if (!res.ok) throw new Error('Error al cargar');
      const json = await res.json();
      setEquipos(json.equipos ?? []);
    } catch {
      setError('No se pudieron cargar los equipos');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-500 text-sm">Cargando equipos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-red-500" />
        <span className="text-red-700 text-sm">{error}</span>
      </div>
    );
  }

  if (equipos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <Wrench className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No hay equipos registrados</p>
        <p className="text-xs mt-1">Registra el equipamiento del consultorio para calcular la depreciación</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase font-semibold">
              Equipo
            </th>
            <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase font-semibold">
              Categoría
            </th>
            <th className="text-right py-3 px-4 text-xs text-gray-500 uppercase font-semibold">
              Valor Compra
            </th>
            <th className="text-right py-3 px-4 text-xs text-gray-500 uppercase font-semibold">
              Dep. Acumulada
            </th>
            <th className="text-right py-3 px-4 text-xs text-gray-500 uppercase font-semibold">
              Valor en Libros
            </th>
            <th className="text-center py-3 px-4 text-xs text-gray-500 uppercase font-semibold">
              Estado
            </th>
          </tr>
        </thead>
        <tbody>
          {equipos.map((eq) => (
            <tr key={eq.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4">
                <div className="font-medium text-gray-900">{eq.nombre}</div>
                {(eq.marca || eq.modelo) && (
                  <div className="text-xs text-gray-400">
                    {[eq.marca, eq.modelo].filter(Boolean).join(' · ')}
                  </div>
                )}
              </td>
              <td className="py-3 px-4 text-gray-600">{eq.categoria ?? '—'}</td>
              <td className="py-3 px-4 text-right font-mono text-gray-700">
                {eq.valor_compra ? formatMoneda(eq.valor_compra) : '—'}
              </td>
              <td className="py-3 px-4 text-right font-mono text-red-600">
                {eq.depreciacion_acumulada
                  ? `- ${formatMoneda(eq.depreciacion_acumulada)}`
                  : '—'}
              </td>
              <td className="py-3 px-4 text-right font-mono font-semibold text-gray-900">
                {eq.valor_en_libros ? formatMoneda(eq.valor_en_libros) : '—'}
              </td>
              <td className="py-3 px-4 text-center">
                {badgeEstado(eq.estado)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── PANEL INSUMOS ─────────────────────────────────────────────────────────────

function PanelInsumos() {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroBajoStock, setFiltroBajoStock] = useState(false);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const params = filtroBajoStock ? '?bajo_stock=true' : '';
      const res = await fetch(`/api/inventory/supplies${params}`);
      if (!res.ok) throw new Error('Error al cargar');
      const json = await res.json();
      setInsumos(json.insumos ?? []);
    } catch {
      setError('No se pudieron cargar los insumos');
    } finally {
      setCargando(false);
    }
  }, [filtroBajoStock]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const insumosAlerta = insumos.filter(
    (i) => i.stock_actual <= (i.stock_minimo ?? 0)
  );

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-500 text-sm">Cargando insumos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-red-500" />
        <span className="text-red-700 text-sm">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alerta de stock bajo */}
      {insumosAlerta.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              {insumosAlerta.length} insumo{insumosAlerta.length !== 1 ? 's' : ''} con stock bajo
            </p>
            <p className="text-xs text-amber-600 mt-1">
              {insumosAlerta.map((i) => i.nombre).join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Filtro */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={filtroBajoStock}
            onChange={(e) => setFiltroBajoStock(e.target.checked)}
            className="rounded border-gray-300"
          />
          Ver solo stock bajo
        </label>
      </div>

      {insumos.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Box className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p className="text-sm">
            {filtroBajoStock ? 'No hay insumos con stock bajo' : 'No hay insumos registrados'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase font-semibold">
                  Insumo
                </th>
                <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase font-semibold">
                  Categoría
                </th>
                <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase font-semibold">
                  Unidad
                </th>
                <th className="text-center py-3 px-4 text-xs text-gray-500 uppercase font-semibold">
                  Stock Actual
                </th>
                <th className="text-center py-3 px-4 text-xs text-gray-500 uppercase font-semibold">
                  Stock Mínimo
                </th>
                <th className="text-right py-3 px-4 text-xs text-gray-500 uppercase font-semibold">
                  Precio Unit.
                </th>
              </tr>
            </thead>
            <tbody>
              {insumos.map((ins) => {
                const esBajoStock =
                  ins.stock_actual <= (ins.stock_minimo ?? 0);
                return (
                  <tr
                    key={ins.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${
                      esBajoStock ? 'bg-amber-50' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {esBajoStock && (
                          <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
                        )}
                        <span className="font-medium text-gray-900">
                          {ins.nombre}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {ins.categoria ?? '—'}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {ins.unidad_medida ?? '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-mono font-semibold ${
                          esBajoStock ? 'text-red-600' : 'text-gray-900'
                        }`}
                      >
                        {ins.stock_actual}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-gray-500">
                      {ins.stock_minimo ?? 0}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-gray-700">
                      {ins.precio_unitario
                        ? formatMoneda(ins.precio_unitario)
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────

export function InventoryPanel() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="equipos">
        <TabsList className="grid w-full max-w-sm grid-cols-2">
          <TabsTrigger value="equipos" className="gap-2">
            <Wrench className="w-4 h-4" />
            Equipos
          </TabsTrigger>
          <TabsTrigger value="insumos" className="gap-2">
            <Package className="w-4 h-4" />
            Insumos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="equipos" className="mt-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-900 text-sm">
                  Equipos del Consultorio
                </span>
              </div>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 gap-1 text-xs">
                <Plus className="w-3 h-3" />
                Nuevo Equipo
              </Button>
            </div>
            <PanelEquipos />
          </div>
        </TabsContent>

        <TabsContent value="insumos" className="mt-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-900 text-sm">
                  Insumos y Stock
                </span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="gap-1 text-xs">
                  <TrendingDown className="w-3 h-3" />
                  Registrar Salida
                </Button>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1 text-xs">
                  <Plus className="w-3 h-3" />
                  Nuevo Insumo
                </Button>
              </div>
            </div>
            <div className="p-4">
              <PanelInsumos />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
