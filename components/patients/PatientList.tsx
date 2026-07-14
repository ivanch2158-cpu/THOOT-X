// components/patients/PatientList.tsx
// Lista de pacientes con opciones CRUD

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Edit2,
  Trash2,
  Eye,
  Plus,
  Search,
  Loader2,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Patient {
  id: string;
  nombre: string;
  apellidos: string;
  email?: string;
  telefono?: string;
  numero_documento?: string;
  fecha_creacion: string;
}

interface PatientListProps {
  patients: Patient[];
  onNewPatient?: () => void;
  isLoading?: boolean;
}

export function PatientList({
  patients,
  onNewPatient,
  isLoading = false,
}: PatientListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtrar pacientes por búsqueda
  const filteredPatients = patients.filter((patient) => {
    const fullName = `${patient.nombre} ${patient.apellidos}`.toLowerCase();
    const search = searchTerm.toLowerCase();
    return (
      fullName.includes(search) ||
      patient.email?.toLowerCase().includes(search) ||
      patient.telefono?.includes(search) ||
      patient.numero_documento?.includes(search)
    );
  });

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);

      const response = await fetch(`/api/patients/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        alert(result.error || 'Error al eliminar paciente');
        return;
      }

      router.refresh();
      setDeletingId(null);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error de conexión');
    } finally {
      setIsDeleting(false);
    }
  };

  // Estado vacío
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No hay pacientes registrados</p>
        {onNewPatient && (
          <Button
            onClick={onNewPatient}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Primer Paciente
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre, email, teléfono o documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {onNewPatient && (
          <Button
            onClick={onNewPatient}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Paciente
          </Button>
        )}
      </div>

      {/* Tabla de pacientes */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Teléfono
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Documento
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredPatients.map((patient) => (
              <tr key={patient.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">
                    {patient.nombre} {patient.apellidos}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(patient.fecha_creacion).toLocaleDateString('es-PE')}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {patient.email || '—'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {patient.telefono || '—'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {patient.numero_documento || '—'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/dashboard/patients/${patient.id}`)}
                      className="text-blue-600 hover:bg-blue-50"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/dashboard/patients/${patient.id}/edit`)}
                      className="text-green-600 hover:bg-green-50"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingId(patient.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resultado de búsqueda vacío */}
      {searchTerm && filteredPatients.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">
            No se encontraron pacientes que coincidan con "{searchTerm}"
          </p>
        </div>
      )}

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Paciente</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar este paciente? Esta acción se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end mt-4">
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDelete(deletingId)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
