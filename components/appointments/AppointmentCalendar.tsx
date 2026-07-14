// components/appointments/AppointmentCalendar.tsx
// Calendario simple para visualizar citas

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

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

interface AppointmentCalendarProps {
  onDateSelect?: (date: Date) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
  patientId?: string;
}

export function AppointmentCalendar({
  onDateSelect,
  onAppointmentClick,
  patientId,
}: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar citas para el mes actual
  useEffect(() => {
    loadAppointments();
  }, [currentDate, patientId]);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams();

      if (patientId) {
        params.append('patientId', patientId);
      }

      const response = await fetch(`/api/appointments?${params.toString()}`);
      const result = await response.json();

      if (response.ok) {
        // Filtrar citas del mes actual
        const monthAppointments = (result.appointments || []).filter(
          (apt: Appointment) => {
            const aptDate = new Date(apt.fecha);
            return (
              aptDate.getMonth() === currentDate.getMonth() &&
              aptDate.getFullYear() === currentDate.getFullYear()
            );
          }
        );
        setAppointments(monthAppointments);
      }
    } catch (err) {
      console.error('Load appointments error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener citas para un día específico
  const getAppointmentsForDate = (date: Date): Appointment[] => {
    return appointments.filter((apt) => apt.fecha === date.toISOString().split('T')[0]);
  };

  // Generar días del mes
  const getDaysInMonth = (date: Date): (number | null)[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (number | null)[] = [];

    // Espacios vacíos antes del primer día
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Días del mes
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const handleDateClick = (day: number) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    onDateSelect?.(date);
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const days = getDaysInMonth(currentDate);

  return (
    <div className="bg-white rounded-lg border p-6">
      {/* Encabezado del calendario */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevMonth}
            disabled={isLoading}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            disabled={isLoading}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Días de semana */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-gray-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid de días */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const date = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            day
          );
          const dayAppointments = getAppointmentsForDate(date);
          const isToday =
            date.toDateString() === new Date().toDateString();

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={`aspect-square rounded border p-2 text-sm transition ${
                isToday
                  ? 'bg-blue-50 border-blue-300'
                  : 'hover:bg-gray-50 border-gray-200'
              }`}
            >
              <div className="font-semibold text-gray-900">{day}</div>
              {dayAppointments.length > 0 && (
                <div className="mt-1 space-y-1">
                  {dayAppointments.slice(0, 2).map((apt) => (
                    <button
                      key={apt.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentClick?.(apt);
                      }}
                      className="block text-xs bg-blue-600 text-white rounded px-1 py-0.5 truncate hover:bg-blue-700"
                      title={`${apt.hora_inicio} - ${apt.tipo_cita}`}
                    >
                      {apt.hora_inicio}
                    </button>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div className="text-xs text-gray-600">
                      +{dayAppointments.length - 2} más
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Indicador de carga */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
        </div>
      )}
    </div>
  );
}
