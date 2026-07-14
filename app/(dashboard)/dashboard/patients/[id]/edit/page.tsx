// app/(dashboard)/dashboard/patients/[id]/edit/page.tsx
// Página para editar un paciente existente

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PatientForm } from '@/components/patients/PatientForm';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft } from 'lucide-react';

interface Patient {
  id: string;
  nombres: string;
  apellidos: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  sexo?: 'M' | 'F' | 'O';
  direccion?: string;
  numero_documento?: string;
  tipo_documento?: 'DNI' | 'Pasaporte' | 'RUC' | 'CE';
  alergias?: string;
  antecedentes_medicos?: string;
}

export default function EditPatientPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPatient();
  }, [patientId]);

  const loadPatient = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/patients/${patientId}`);
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Error al cargar paciente');
        return;
      }

      setPatient(result);
    } catch (err) {
      console.error('Load patient error:', err);
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormClose = () => {
    router.push(`/dashboard/patients/${patientId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="space-y-4">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
        <Alert variant="destructive">
          <AlertDescription>
            {error || 'Paciente no encontrado'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          Editar Paciente
        </h1>
        <p className="text-gray-600 mt-2">
          {patient.nombres} {patient.apellidos}
        </p>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-lg border p-8">
        <PatientForm
          isEditing={true}
          initialData={patient}
          onClose={handleFormClose}
        />
      </div>
    </div>
  );
}
