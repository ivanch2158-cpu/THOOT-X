// components/billing/InvoiceForm.tsx
// Formulario para crear facturas

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { facturaSchema, type FacturaInput, type FacturaItemInput } from '@/lib/financial/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, X, Plus, Trash2 } from 'lucide-react';

interface InvoiceFormProps {
  patientId?: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

export function InvoiceForm({
  patientId,
  onClose,
  onSuccess,
}: InvoiceFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totales, setTotales] = useState({
    subtotal: 0,
    descuentos: 0,
    total: 0,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm<FacturaInput>({
    resolver: zodResolver(facturaSchema),
    defaultValues: {
      paciente_id: patientId || '',
      metodo_pago: 'efectivo',
      items: [{ descripcion: '', cantidad: 1, precio_unitario: 0, descuento_porcentaje: 0, descuento_monto: 0 }],
      descuento_global: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const items = watch('items');
  const descuentoGlobal = watch('descuento_global');

  // Calcular totales
  useEffect(() => {
    let subtotal = 0;
    let descuentos = 0;

    items?.forEach((item) => {
      if (item && item.cantidad && item.precio_unitario) {
        const subtotalItem = item.cantidad * item.precio_unitario;
        const descuentoItem =
          ((item.descuento_porcentaje || 0) / 100) * subtotalItem +
          (item.descuento_monto || 0);
        subtotal += subtotalItem;
        descuentos += descuentoItem;
      }
    });

    const total = Math.max(0, subtotal - descuentos - (descuentoGlobal || 0));

    setTotales({
      subtotal,
      descuentos: descuentos + (descuentoGlobal || 0),
      total,
    });
  }, [items, descuentoGlobal]);

  const onSubmit = async (data: FacturaInput) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch('/api/billing/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Error al crear factura');
        return;
      }

      onSuccess?.();
      onClose?.();
      router.refresh();
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
      console.error('Invoice form error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Nueva Factura</h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Alerta de Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Datos Básicos */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="paciente_id" className="text-sm font-medium text-gray-700">
            Paciente *
          </label>
          <Input
            id="paciente_id"
            placeholder="ID del paciente"
            disabled={isLoading || !!patientId}
            {...register('paciente_id')}
            className={errors.paciente_id ? 'border-red-500' : ''}
          />
          {errors.paciente_id && (
            <p className="text-xs text-red-500">{errors.paciente_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="metodo_pago" className="text-sm font-medium text-gray-700">
            Método de Pago *
          </label>
          <select
            id="metodo_pago"
            disabled={isLoading}
            {...register('metodo_pago')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="cuotas">Cuotas</option>
          </select>
        </div>
      </div>

      {/* Ítems de Factura */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Ítems de Factura *</h3>
          <Button
            type="button"
            onClick={() =>
              append({ descripcion: '', cantidad: 1, precio_unitario: 0, descuento_porcentaje: 0, descuento_monto: 0 })
            }
            variant="outline"
            size="sm"
            disabled={isLoading}
            className="gap-2"
          >
            <Plus className="w-3 h-3" />
            Agregar Ítem
          </Button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Ítem {index + 1}
                </span>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => remove(index)}
                    variant="destructive"
                    size="sm"
                    disabled={isLoading}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">
                  Descripción
                </label>
                <Input
                  placeholder="Ej: Limpieza dental"
                  disabled={isLoading}
                  {...register(`items.${index}.descripcion`)}
                  className={errors.items?.[index]?.descripcion ? 'border-red-500' : ''}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Cantidad
                  </label>
                  <Input
                    type="number"
                    placeholder="1"
                    disabled={isLoading}
                    {...register(`items.${index}.cantidad`, {
                      valueAsNumber: true,
                    })}
                    min="1"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Precio Unitario (S/.)
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    disabled={isLoading}
                    {...register(`items.${index}.precio_unitario`, {
                      valueAsNumber: true,
                    })}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Subtotal
                  </label>
                  <div className="px-3 py-2 bg-gray-100 rounded border border-gray-300 text-sm font-mono">
                    {(
                      (items[index]?.cantidad || 0) *
                      (items[index]?.precio_unitario || 0)
                    ).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Descuento %
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    disabled={isLoading}
                    {...register(`items.${index}.descuento_porcentaje`, {
                      valueAsNumber: true,
                    })}
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Descuento S/.
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    disabled={isLoading}
                    {...register(`items.${index}.descuento_monto`, {
                      valueAsNumber: true,
                    })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Descuento Global */}
      <div className="space-y-2">
        <label htmlFor="descuento_global" className="text-sm font-medium text-gray-700">
          Descuento Global (S/.)
        </label>
        <Input
          id="descuento_global"
          type="number"
          placeholder="0.00"
          step="0.01"
          disabled={isLoading}
          {...register('descuento_global', { valueAsNumber: true })}
        />
      </div>

      {/* Notas */}
      <div className="space-y-2">
        <label htmlFor="notas" className="text-sm font-medium text-gray-700">
          Notas
        </label>
        <textarea
          id="notas"
          placeholder="Notas adicionales..."
          disabled={isLoading}
          {...register('notas')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
      </div>

      {/* Resumen de Totales */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 space-y-2 font-mono">
        <div className="flex justify-between text-sm">
          <span className="text-gray-700">Subtotal:</span>
          <span className="font-semibold">S/. {totales.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-700">Descuentos:</span>
          <span className="font-semibold text-red-600">
            -S/. {totales.descuentos.toFixed(2)}
          </span>
        </div>
        <div className="border-t border-blue-200 pt-2 flex justify-between">
          <span className="text-gray-900 font-bold">Total a Pagar:</span>
          <span className="text-lg font-bold text-blue-600">
            S/. {totales.total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-6 border-t">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creando...
            </>
          ) : (
            'Crear Factura'
          )}
        </Button>

        {onClose && (
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
