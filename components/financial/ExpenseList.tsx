// components/financial/ExpenseList.tsx
// Listado de gastos con filtros

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, Loader2, Trash2, Edit2 } from 'lucide-react';

interface Expense {
  id: string;
  categoria: string;
  tipo: string;
  descripcion: string;
  monto: number;
  fecha: string;
  recurrente: boolean;
}

interface ExpenseListProps {
  mes?: string;
  ano?: number;
}

const categoriaColors: Record<string, string> = {
  arriendo: 'bg-red-100 text-red-800',
  sueldos: 'bg-blue-100 text-blue-800',
  servicios_publicos: 'bg-yellow-100 text-yellow-800',
  seguros: 'bg-purple-100 text-purple-800',
  suscripciones: 'bg-green-100 text-green-800',
  laboratorio_dental: 'bg-orange-100 text-orange-800',
  mantenimiento: 'bg-pink-100 text-pink-800',
  marketing: 'bg-indigo-100 text-indigo-800',
  capacitacion: 'bg-teal-100 text-teal-800',
  otro: 'bg-gray-100 text-gray-800',
};

export function ExpenseList({ mes, ano }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tipoFiltro, setTipoFiltro] = useState<string>('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('');
  const [totales, setTotales] = useState({
    total: 0,
    fijos: 0,
    variables: 0,
  });

  // Cargar gastos
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (mes && ano) {
          const primerDia = `${ano}-${String(parseInt(mes)).padStart(2, '0')}-01`;
          const ultimoDia = new Date(ano, parseInt(mes), 0)
            .toISOString()
            .split('T')[0];
          params.append('desde', primerDia);
          params.append('hasta', ultimoDia);
        }

        const response = await fetch(`/api/financial/expenses?${params}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Error al cargar gastos');
          return;
        }

        setExpenses(data.gastos || []);
        setTotales({
          total: data.total || 0,
          fijos: data.gastos_fijos || 0,
          variables: data.gastos_variables || 0,
        });
      } catch (err) {
        setError('Error de conexión');
        console.error('Fetch expenses error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, [mes, ano]);

  // Filtrar gastos
  useEffect(() => {
    let filtered = expenses;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (expense) =>
          expense.descripcion.toLowerCase().includes(term) ||
          expense.categoria.toLowerCase().includes(term)
      );
    }

    if (tipoFiltro) {
      filtered = filtered.filter((expense) => expense.tipo === tipoFiltro);
    }

    if (categoriaFiltro) {
      filtered = filtered.filter(
        (expense) => expense.categoria === categoriaFiltro
      );
    }

    setFilteredExpenses(filtered);
  }, [searchTerm, tipoFiltro, categoriaFiltro, expenses]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 font-medium">Total Gastos</p>
          <p className="text-2xl font-bold text-blue-600 font-mono">
            S/. {totales.total.toFixed(2)}
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 font-medium">Gastos Fijos</p>
          <p className="text-2xl font-bold text-green-600 font-mono">
            S/. {totales.fijos.toFixed(2)}
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 font-medium">Gastos Variables</p>
          <p className="text-2xl font-bold text-orange-600 font-mono">
            S/. {totales.variables.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Búsqueda y Filtros */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-200">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar gastos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <select
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los tipos</option>
          <option value="fijo">Fijos</option>
          <option value="variable">Variables</option>
        </select>

        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las categorías</option>
          <option value="arriendo">Arriendo</option>
          <option value="sueldos">Sueldos</option>
          <option value="servicios_publicos">Servicios Públicos</option>
          <option value="seguros">Seguros</option>
          <option value="suscripciones">Suscripciones</option>
          <option value="laboratorio_dental">Laboratorio Dental</option>
          <option value="mantenimiento">Mantenimiento</option>
          <option value="marketing">Marketing</option>
          <option value="capacitacion">Capacitación</option>
          <option value="otro">Otro</option>
        </select>
      </div>

      {/* Alerta de error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Listado */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            {searchTerm || tipoFiltro || categoriaFiltro
              ? 'No se encontraron gastos'
              : 'No hay gastos registrados'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredExpenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-white border rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {expense.descripcion}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        categoriaColors[expense.categoria] ||
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {expense.categoria}
                    </span>
                    {expense.recurrente && (
                      <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 font-medium">
                        Recurrente
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-red-600 font-semibold font-mono">
                      -S/. {expense.monto.toFixed(2)}
                    </span>
                    <span className="text-gray-600">
                      {new Date(expense.fecha).toLocaleDateString('es-PE')}
                    </span>
                    <span className="text-gray-600 text-xs">
                      ({expense.tipo === 'fijo' ? 'Fijo' : 'Variable'})
                    </span>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    className="gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
