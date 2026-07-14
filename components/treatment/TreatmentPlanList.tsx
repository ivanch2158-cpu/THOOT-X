// components/treatment/TreatmentPlanList.tsx
// Listado de planes de tratamiento

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
import { Edit2, Trash2, Eye, Search, Loader2 } from 'lucide-react';

interface TreatmentPlan {
  id: string;
  paciente_id: string;
  descripcion: string;
  costo_total: number;
  estado: string;
  fecha_inicio_estimada?: string;
  fecha_fin_estimada?: string;
  pacientes?: { nombre: string; apellidos: string };
}

interface TreatmentPlanListProps {
  patientId?: string;
  onNewPlan?: () => void;
}

const estado_colors: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  en_proceso: 'bg-blue-100 text-blue-800',
  completado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
};

export function TreatmentPlanList({
  patientId,
  onNewPlan,
}: TreatmentPlanListProps) {
  const router = useRouter();
  const [plans, setPlans] = useState<TreatmentPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<TreatmentPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cargar planes de tratamiento
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const url = patientId
          ? `/api/treatment-plans?patientId=${patientId}`
          : '/api/treatment-plans';

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Error al cargar planes');
          return;
        }

        setPlans(data.plans || []);
      } catch (err) {
        setError('Error de conexión');
        console.error('Fetch plans error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, [patientId]);

  // Filtrar planes según búsqueda
  useEffect(() => {
    if (!searchTerm) {
      setFilteredPlans(plans);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = plans.filter(
      (plan) =>
        plan.descripcion.toLowerCase().includes(term) ||
        plan.pacientes?.nombre.toLowerCase().includes(term) ||
        plan.pacientes?.apellidos.toLowerCase().includes(term)
    );

    setFilteredPlans(filtered);
  }, [searchTerm, plans]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/treatment-plans/${deleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Error al eliminar plan');
        return;
      }

      setPlans(plans.filter((p) => p.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      setError('Error de conexión');
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Búsqueda */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar plan por descripción o paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Alerta de error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Listado */}
      {filteredPlans.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            {searchTerm
              ? 'No se encontraron planes de tratamiento'
              : 'No hay planes de tratamiento'}
          </p>
          {onNewPlan && (
            <Button onClick={onNewPlan} className="bg-blue-600 hover:bg-blue-700">
              Crear Primer Plan
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white border rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {plan.descripcion.substring(0, 50)}
                      {plan.descripcion.length > 50 ? '...' : ''}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        estado_colors[plan.estado] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {plan.estado}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    Paciente:{' '}
                    {plan.pacientes?.nombre} {plan.pacientes?.apellidos}
                  </p>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-blue-600 font-semibold">
                      S/. {plan.costo_total.toFixed(2)}
                    </span>
                    {plan.fecha_inicio_estimada && (
                      <span className="text-gray-600">
                        Inicio: {new Date(plan.fecha_inicio_estimada).toLocaleDateString('es-PE')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      router.push(`/dashboard/treatment-plans/${plan.id}`)
                    }
                    className="gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    Ver
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      router.push(`/dashboard/treatment-plans/${plan.id}/edit`)
                    }
                    className="gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    Editar
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteId(plan.id)}
                    className="gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>Eliminar Plan de Tratamiento</AlertDialogTitle>
          <AlertDialogDescription>
            ¿Estás seguro de que deseas eliminar este plan? Esta acción no se puede deshacer.
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
