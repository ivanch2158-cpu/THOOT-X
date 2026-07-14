// app/(dashboard)/dashboard/patients/[id]/page.tsx
// Página de detalle de paciente

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Edit2, FileText, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Patient {
  id: string;
  nombre: string;
  apellidos: string;
  email?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  direccion?: string;
  ciudad?: string;
  pais?: string;
  numero_documento?: string;
  tipo_documento?: string;
  alergia_medicamentos?: string;
  enfermedades?: string;
  observaciones?: string;
  fecha_creacion: string;
}

export default function PatientDetailPage() {
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

  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const genderLabel = {
    M: 'Masculino',
    F: 'Femenino',
    O: 'Otro',
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
      <div className="flex items-center justify-between">
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
            {patient.nombre} {patient.apellidos}
          </h1>
          <p className="text-gray-600 mt-1">
            Creado el {new Date(patient.fecha_creacion).toLocaleDateString('es-PE')}
          </p>
        </div>
        <Button
          onClick={() => router.push(`/dashboard/patients/${patientId}/edit`)}
          className="bg-blue-600 hover:bg-blue-700 gap-2"
        >
          <Edit2 className="w-4 h-4" />
          Editar
        </Button>
      </div>

      {/* Información Básica */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Edad */}
        {patient.fecha_nacimiento && (
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-600 font-medium">Edad</p>
            <p className="text-2xl font-bold text-gray-900">
              {calculateAge(patient.fecha_nacimiento)} años
            </p>
          </div>
        )}

        {/* Género */}
        {patient.genero && (
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-600 font-medium">Género</p>
            <p className="text-2xl font-bold text-gray-900">
              {genderLabel[patient.genero as keyof typeof genderLabel] || patient.genero}
            </p>
          </div>
        )}

        {/* Email */}
        {patient.email && (
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-600 font-medium">Email</p>
            <p className="text-lg font-mono text-gray-900 break-all">
              {patient.email}
            </p>
          </div>
        )}

        {/* Teléfono */}
        {patient.telefono && (
          <div className="bg-white rounded-lg border p-4">
            <p className="text-sm text-gray-600 font-medium">Teléfono</p>
            <p className="text-xl font-bold text-gray-900">
              {patient.telefono}
            </p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="general" className="bg-white rounded-lg border">
        <TabsList className="border-b w-full justify-start rounded-none px-6 py-0">
          <TabsTrigger value="general" className="gap-2">
            <FileText className="w-4 h-4" />
            Información General
          </TabsTrigger>
          <TabsTrigger value="medical" className="gap-2">
            <FileText className="w-4 h-4" />
            Información Médica
          </TabsTrigger>
          <TabsTrigger value="appointments" className="gap-2">
            <Calendar className="w-4 h-4" />
            Citas
          </TabsTrigger>
        </TabsList>

        {/* Tab: Información General */}
        <TabsContent value="general" className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Datos Personales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {patient.numero_documento && (
                <div>
                  <p className="text-sm text-gray-600 font-medium">Documento</p>
                  <p className="text-gray-900 font-mono">
                    {patient.tipo_documento ? `${patient.tipo_documento}: ` : ''}
                    {patient.numero_documento}
                  </p>
                </div>
              )}

              {patient.fecha_nacimiento && (
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Fecha de Nacimiento
                  </p>
                  <p className="text-gray-900">
                    {new Date(patient.fecha_nacimiento).toLocaleDateString('es-PE')}
                  </p>
                </div>
              )}

              {patient.direccion && (
                <div>
                  <p className="text-sm text-gray-600 font-medium">Dirección</p>
                  <p className="text-gray-900">{patient.direccion}</p>
                </div>
              )}

              {patient.ciudad && (
                <div>
                  <p className="text-sm text-gray-600 font-medium">Ciudad</p>
                  <p className="text-gray-900">{patient.ciudad}</p>
                </div>
              )}

              {patient.pais && (
                <div>
                  <p className="text-sm text-gray-600 font-medium">País</p>
                  <p className="text-gray-900">{patient.pais}</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab: Información Médica */}
        <TabsContent value="medical" className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Historial Médico
            </h3>
            <div className="space-y-6">
              {patient.alergia_medicamentos && (
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-2">
                    Alergias a Medicamentos
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-red-900">{patient.alergia_medicamentos}</p>
                  </div>
                </div>
              )}

              {patient.enfermedades && (
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-2">
                    Enfermedades Relevantes
                  </p>
                  <p className="text-gray-900">{patient.enfermedades}</p>
                </div>
              )}

              {patient.observaciones && (
                <div>
                  <p className="text-sm text-gray-600 font-medium mb-2">
                    Observaciones Generales
                  </p>
                  <p className="text-gray-900">{patient.observaciones}</p>
                </div>
              )}

              {!patient.alergia_medicamentos &&
                !patient.enfermedades &&
                !patient.observaciones && (
                  <p className="text-gray-500 italic">
                    No hay información médica registrada
                  </p>
                )}
            </div>
          </div>
        </TabsContent>

        {/* Tab: Citas */}
        <TabsContent value="appointments" className="p-6">
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              Las citas se cargarán en futuras actualizaciones
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
