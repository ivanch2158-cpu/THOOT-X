// app/(dashboard)/dashboard/treatment-plans/page.tsx
// Página de planes de tratamiento

'use client';

import { useState } from 'react';
import { TreatmentPlanList } from '@/components/treatment/TreatmentPlanList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function TreatmentPlansPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planes de Tratamiento</h1>
          <p className="text-gray-600 mt-2">
            Gestión de planes de tratamiento por paciente
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Plan
        </Button>
      </div>

      {/* Contenido */}
      <TreatmentPlanList onNewPlan={() => setShowForm(true)} />
    </div>
  );
}
