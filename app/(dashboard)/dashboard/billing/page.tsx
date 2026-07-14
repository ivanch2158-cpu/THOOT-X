// app/(dashboard)/dashboard/billing/page.tsx
// Página principal de facturación y finanzas

'use client';

import { InvoiceList } from '@/components/billing/InvoiceList';
import { ExpenseList } from '@/components/financial/ExpenseList';
import { FinancialMetrics } from '@/components/financial/FinancialMetrics';
import { IncomeStatement } from '@/components/financial/IncomeStatement';
import { InventoryPanel } from '@/components/financial/InventoryPanel';
import { Button } from '@/components/ui/button';
import {
  Plus,
  DollarSign,
  TrendingDown,
  BarChart2,
  FileText,
  Package,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function BillingPage() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Facturación y Finanzas</h1>
          <p className="text-gray-600 mt-2">
            Gestión de facturas, gastos, inventario y resultados del consultorio
          </p>
        </div>
      </div>

      {/* Tabs — 5 secciones */}
      <Tabs defaultValue="metricas" className="w-full">
        <TabsList className="flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="metricas" className="gap-2">
            <BarChart2 className="w-4 h-4" />
            Métricas
          </TabsTrigger>
          <TabsTrigger value="facturas" className="gap-2">
            <DollarSign className="w-4 h-4" />
            Facturas
          </TabsTrigger>
          <TabsTrigger value="gastos" className="gap-2">
            <TrendingDown className="w-4 h-4" />
            Gastos
          </TabsTrigger>
          <TabsTrigger value="inventario" className="gap-2">
            <Package className="w-4 h-4" />
            Inventario
          </TabsTrigger>
          <TabsTrigger value="resultados" className="gap-2">
            <FileText className="w-4 h-4" />
            Estado de Resultados
          </TabsTrigger>
        </TabsList>

        {/* Tab: Métricas del Dashboard */}
        <TabsContent value="metricas" className="space-y-4 mt-6">
          <FinancialMetrics />
        </TabsContent>

        {/* Tab: Facturas */}
        <TabsContent value="facturas" className="space-y-4 mt-6">
          <div className="flex justify-end">
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus className="w-4 h-4" />
              Nueva Factura
            </Button>
          </div>
          <InvoiceList />
        </TabsContent>

        {/* Tab: Gastos */}
        <TabsContent value="gastos" className="space-y-4 mt-6">
          <div className="flex justify-end">
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus className="w-4 h-4" />
              Registrar Gasto
            </Button>
          </div>
          <ExpenseList mes={currentMonth.toString()} ano={currentYear} />
        </TabsContent>

        {/* Tab: Inventario */}
        <TabsContent value="inventario" className="mt-6">
          <InventoryPanel />
        </TabsContent>

        {/* Tab: Estado de Resultados (P&L) */}
        <TabsContent value="resultados" className="mt-6">
          <IncomeStatement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
