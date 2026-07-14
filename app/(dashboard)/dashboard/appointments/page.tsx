// app/(dashboard)/dashboard/appointments/page.tsx
// Página de gestión de citas y agenda

'use client';

import { useState } from 'react';
import { AppointmentCalendar } from '@/components/appointments/AppointmentCalendar';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface Appointment {
  id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  tipo_cita: string;
  estado: string;
  pacientes?: { nombre: string; apellidos: string };
  users?: { full_name: string };
}

export default function AppointmentsPage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const handleDateSelect = (_date: Date) => {
    setShowForm(true);
    setSelectedAppointment(null);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowForm(false);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedAppointment(null);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda de Citas</h1>
          <p className="text-gray-600 mt-2">
            Gestión de citas y calendario de consultas
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedAppointment(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Cita
        </Button>
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="lg:col-span-2">
          <AppointmentCalendar
            onDateSelect={handleDateSelect}
            onAppointmentClick={handleAppointmentClick}
          />
        </div>

        {/* Panel lateral - Formulario o detalles */}
        <div className="space-y-6">
          {showForm ? (
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Nueva Cita
                </h2>
                <button
                  onClick={handleFormClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <AppointmentForm
                onClose={handleFormClose}
                onSuccess={handleFormClose}
              />
            </div>
          ) : selectedAppointment ? (
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Detalles de la Cita
                </h2>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Información de la cita */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Paciente</p>
                  <p className="text-gray-900">
                    {selectedAppointment.pacientes?.nombre}{' '}
                    {selectedAppointment.pacientes?.apellidos}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-medium">Fecha</p>
                  <p className="text-gray-900">
                    {new Date(selectedAppointment.fecha).toLocaleDateString(
                      'es-PE'
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-medium">Horario</p>
                  <p className="text-gray-900">
                    {selectedAppointment.hora_inicio} -{' '}
                    {selectedAppointment.hora_fin}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-medium">Tipo</p>
                  <p className="text-gray-900">
                    {selectedAppointment.tipo_cita}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 font-medium">Estado</p>
                  <p className="text-gray-900 capitalize">
                    {selectedAppointment.estado}
                  </p>
                </div>

                {selectedAppointment.users && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Odontólogo
                    </p>
                    <p className="text-gray-900">
                      {selectedAppointment.users.full_name}
                    </p>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => setShowForm(true)}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => setSelectedAppointment(null)}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border p-6 text-center">
              <p className="text-gray-600 mb-4">
                Haz clic en una fecha o una cita para ver más detalles
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Nueva Cita
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
