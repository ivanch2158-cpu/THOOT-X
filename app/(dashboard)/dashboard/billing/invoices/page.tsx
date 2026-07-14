// app/(dashboard)/dashboard/billing/invoices/page.tsx
// Página de gestión de facturas

'use client';

import { useState } from 'react';
import { InvoiceList } from '@/components/billing/InvoiceList';
import { InvoiceForm } from '@/components/billing/InvoiceForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function InvoicesPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facturas</h1>
          <p className="text-gray-600 mt-2">
            Gestión de facturas y cobros
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Factura
        </Button>
      </div>

      {/* Formulario modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <InvoiceForm onClose={() => setShowForm(false)} onSuccess={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {/* Contenido */}
      <InvoiceList />
    </div>
  );
}
