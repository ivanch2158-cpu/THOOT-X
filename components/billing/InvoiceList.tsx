// components/billing/InvoiceList.tsx
// Listado de facturas con búsqueda y filtros

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Edit2, Trash2, Eye, Search, Loader2, Download, DollarSign } from 'lucide-react';

interface Invoice {
  id: string;
  numero_factura: number;
  paciente_id: string;
  estado: string;
  total_factura: number;
  monto_pagado?: number;
  fecha_emision: string;
  metodo_pago: string;
  pacientes?: { nombre: string; apellidos: string };
  users?: { full_name: string };
}

interface InvoiceListProps {
  patientId?: string;
}

const estado_colors: Record<string, string> = {
  emitida: 'bg-yellow-100 text-yellow-800',
  parcial: 'bg-orange-100 text-orange-800',
  pagada: 'bg-green-100 text-green-800',
  cancelada: 'bg-red-100 text-red-800',
  anulada: 'bg-gray-100 text-gray-800',
};

export function InvoiceList({ patientId }: InvoiceListProps) {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [estadoFiltro, setEstadoFiltro] = useState<string>('');

  // Cargar facturas
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const url = patientId
          ? `/api/billing/invoices?pacienteId=${patientId}`
          : '/api/billing/invoices';

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Error al cargar facturas');
          return;
        }

        setInvoices(data.invoices || []);
      } catch (err) {
        setError('Error de conexión');
        console.error('Fetch invoices error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [patientId]);

  // Filtrar facturas
  useEffect(() => {
    let filtered = invoices;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (invoice) =>
          invoice.numero_factura.toString().includes(term) ||
          invoice.pacientes?.nombre.toLowerCase().includes(term) ||
          invoice.pacientes?.apellidos.toLowerCase().includes(term)
      );
    }

    if (estadoFiltro) {
      filtered = filtered.filter((invoice) => invoice.estado === estadoFiltro);
    }

    setFilteredInvoices(filtered);
  }, [searchTerm, estadoFiltro, invoices]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/billing/invoices/${deleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Error al eliminar factura');
        return;
      }

      setInvoices(invoices.filter((inv) => inv.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setError('Error de conexión');
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalFacturado = invoices.reduce((sum, inv) => sum + inv.total_factura, 0);
  const totalCobrado = invoices.reduce((sum, inv) => sum + (inv.monto_pagado || 0), 0);

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
      {!patientId && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 font-medium">Total Facturado</p>
            <p className="text-2xl font-bold text-blue-600 font-mono">
              S/. {totalFacturado.toFixed(2)}
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 font-medium">Total Cobrado</p>
            <p className="text-2xl font-bold text-green-600 font-mono">
              S/. {totalCobrado.toFixed(2)}
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 font-medium">Por Cobrar</p>
            <p className="text-2xl font-bold text-orange-600 font-mono">
              S/. {(totalFacturado - totalCobrado).toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Búsqueda y Filtros */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-200">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por número o paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <select
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los estados</option>
          <option value="emitida">Emitida</option>
          <option value="parcial">Parcial</option>
          <option value="pagada">Pagada</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      {/* Alerta de error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Listado */}
      {filteredInvoices.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            {searchTerm || estadoFiltro
              ? 'No se encontraron facturas'
              : 'No hay facturas'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredInvoices.map((invoice) => {
            const pendiente = Math.max(0, invoice.total_factura - (invoice.monto_pagado || 0));
            return (
              <div
                key={invoice.id}
                className="bg-white border rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        Factura Nº {invoice.numero_factura}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded font-medium ${
                          estado_colors[invoice.estado] ||
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {invoice.estado}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      Paciente:{' '}
                      {invoice.pacientes?.nombre} {invoice.pacientes?.apellidos}
                    </p>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-blue-600 font-semibold font-mono">
                        Total: S/. {invoice.total_factura.toFixed(2)}
                      </span>

                      {pendiente > 0 && (
                        <span className="text-orange-600 font-medium font-mono">
                          Pendiente: S/. {pendiente.toFixed(2)}
                        </span>
                      )}

                      <span className="text-gray-600">
                        {new Date(invoice.fecha_emision).toLocaleDateString(
                          'es-PE'
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(`/dashboard/billing/invoices/${invoice.id}`)
                      }
                      className="gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Ver
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                    >
                      <Download className="w-3 h-3" />
                      PDF
                    </Button>

                    {invoice.estado !== 'pagada' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-green-600 border-green-300 hover:bg-green-50"
                      >
                        <DollarSign className="w-3 h-3" />
                        Pagar
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteId(invoice.id)}
                      className="gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Eliminar Factura</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar esta factura? Esta acción no se puede deshacer.
          </AlertDialogDescription>
          <div className="flex gap-3">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
