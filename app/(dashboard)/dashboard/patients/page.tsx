// app/(dashboard)/dashboard/patients/page.tsx
// Página de gestión de pacientes

'use client';

import { useState, useEffect } from 'react';
import { PatientList } from '@/components/patients/PatientList';
import { PatientForm } from '@/components/patients/PatientForm';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Patient {
  id: string;
  nombre: string;
  apellidos: string;
  email?: string;
  telefono?: string;
  numero_documento?: string;
  fecha_creacion: string;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Cargar pacientes al montar
  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/patients');
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Error al cargar pacientes');
        return;
      }

      setPatients(result.patients || []);
    } catch (err) {
      console.error('Load patients error:', err);
      setError('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    loadPatients(); // Recargar lista
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
        <p className="text-gray-600 mt-2">
          Gestión completa de la base de datos de pacientes
        </p>
      </div>

      {/* Alerta de error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Formulario modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <PatientForm onClose={handleFormClose} />
          </div>
        </div>
      )}

      {/* Lista de pacientes */}
      {!showForm && (
        <PatientList
          patients={patients}
          onNewPatient={() => setShowForm(true)}
          isLoading={isLoading}
        />
      )}

      {/* Indicador de no hay pacientes */}
      {!isLoading && patients.length === 0 && !error && !showForm && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay pacientes registrados
          </h3>
          <p className="text-gray-600 mb-6">
            Comienza agregando tu primer paciente a la base de datos
          </p>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Crear Primer Paciente
          </Button>
        </div>
      )}
    </div>
  );
}
