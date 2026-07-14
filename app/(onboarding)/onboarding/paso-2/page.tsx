// app/(onboarding)/onboarding/paso-2/page.tsx
// Wizard paso 2 — Identidad visual: logo, colores y tipografía

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Palette, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { applyTenantTheme } from '@/lib/theme/applyTenantTheme';

// ── TIPOS ─────────────────────────────────────────────────────────────────────

interface IdentidadVisual {
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  font_family: string;
}

const FUENTES = [
  { valor: 'Inter', etiqueta: 'Inter (por defecto)' },
  { valor: "'Plus Jakarta Sans'", etiqueta: 'Plus Jakarta Sans' },
  { valor: 'Nunito', etiqueta: 'Nunito' },
  { valor: 'Poppins', etiqueta: 'Poppins' },
  { valor: "'DM Sans'", etiqueta: 'DM Sans' },
];

// ── VISTA PREVIA ──────────────────────────────────────────────────────────────

function VistaPrevia({
  primary_color,
  secondary_color,
  font_family,
  logo_url,
  nombre,
}: IdentidadVisual & { nombre?: string }) {
  return (
    <div
      className="border border-gray-200 rounded-xl overflow-hidden shadow-sm"
      style={{ fontFamily: font_family }}
    >
      {/* Sidebar simulado */}
      <div className="flex" style={{ minHeight: '140px' }}>
        <div
          className="w-16 flex flex-col items-center gap-3 py-4"
          style={{ backgroundColor: '#0F172A' }}
        >
          {logo_url ? (
            <img src={logo_url} alt="Logo" className="w-8 h-8 rounded object-cover" />
          ) : (
            <div
              className="w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: primary_color }}
            >
              TX
            </div>
          )}
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-6 h-1.5 rounded"
              style={{
                backgroundColor: i === 0 ? primary_color : 'rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </div>
        {/* Contenido simulado */}
        <div className="flex-1 p-4 bg-gray-50">
          <div
            className="h-6 w-1/2 rounded mb-3"
            style={{ backgroundColor: primary_color + '33' }}
          />
          <div className="grid grid-cols-3 gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-3 border border-gray-200">
                <div
                  className="h-3 w-3/4 rounded mb-1.5"
                  style={{ backgroundColor: i === 0 ? primary_color : '#E2E8F0' }}
                />
                <div className="h-2 w-1/2 rounded bg-gray-200" />
              </div>
            ))}
          </div>
          {/* Botón de muestra */}
          <div className="mt-3">
            <div
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-white text-xs font-semibold"
              style={{ backgroundColor: primary_color }}
            >
              Nueva cita
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────

export default function Paso2Page() {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);
  const [subiendoLogo, setSubiendoLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [valores, setValores] = useState<IdentidadVisual>({
    logo_url: null,
    primary_color: '#2563EB',
    secondary_color: '#0F766E',
    font_family: 'Inter',
  });

  // Aplicar tema en tiempo real
  useEffect(() => {
    applyTenantTheme({
      primary_color: valores.primary_color,
      secondary_color: valores.secondary_color,
      font_family: valores.font_family,
    } as any);
  }, [valores.primary_color, valores.secondary_color, valores.font_family]);

  const handleLogoUpload = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        alert('Solo se permiten imágenes PNG o JPG.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('El archivo no puede superar 2 MB.');
        return;
      }

      setSubiendoLogo(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/tenant/upload-logo', {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error();
        const { url } = await res.json();
        setValores((v) => ({ ...v, logo_url: url }));
      } catch {
        alert('Error al subir el logo. Intenta de nuevo.');
      } finally {
        setSubiendoLogo(false);
      }
    },
    []
  );

  const onSubmit = async () => {
    setGuardando(true);
    try {
      const res = await fetch('/api/tenant/onboarding/paso-2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(valores),
      });
      if (!res.ok) throw new Error();
      router.push('/onboarding/paso-3');
    } catch {
      alert('Error al guardar. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        {/* Encabezado */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <Palette className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Identidad visual</h1>
            <p className="text-sm text-gray-500">
              Personaliza los colores y tipografía de tu consultorio
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo del consultorio (opcional)
            </label>
            <div className="flex items-center gap-4">
              {valores.logo_url ? (
                <div className="relative">
                  <img
                    src={valores.logo_url}
                    alt="Logo"
                    className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                  />
                  <button
                    onClick={() => setValores((v) => ({ ...v, logo_url: null }))}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                  <Upload className="w-5 h-5 text-gray-400" />
                </div>
              )}
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={subiendoLogo}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {subiendoLogo ? 'Subiendo...' : 'Subir logo'}
                </Button>
                <p className="text-xs text-gray-400 mt-1">PNG o JPG, máx. 2 MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleLogoUpload(file);
                }}
              />
            </div>
          </div>

          {/* Colores */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color primario
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={valores.primary_color}
                  onChange={(e) =>
                    setValores((v) => ({ ...v, primary_color: e.target.value }))
                  }
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                />
                <span className="text-sm font-mono text-gray-600">
                  {valores.primary_color.toUpperCase()}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color secundario
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={valores.secondary_color}
                  onChange={(e) =>
                    setValores((v) => ({ ...v, secondary_color: e.target.value }))
                  }
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
                />
                <span className="text-sm font-mono text-gray-600">
                  {valores.secondary_color.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Tipografía */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipografía
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FUENTES.map((fuente) => (
                <label
                  key={fuente.valor}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    valores.font_family === fuente.valor
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="fuente"
                    value={fuente.valor}
                    checked={valores.font_family === fuente.valor}
                    onChange={() =>
                      setValores((v) => ({ ...v, font_family: fuente.valor }))
                    }
                    className="sr-only"
                  />
                  <span style={{ fontFamily: fuente.valor }} className="text-sm text-gray-900">
                    {fuente.etiqueta}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Vista previa en tiempo real */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Vista previa
        </p>
        <VistaPrevia {...valores} />
      </div>

      {/* Botones */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => router.push('/onboarding/paso-1')}
        >
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={guardando}
          className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
        >
          {guardando ? 'Guardando...' : 'Continuar'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
