// app/(dashboard)/dashboard/settings/page.tsx
// Panel de configuración del consultorio — tabs: datos, identidad, horarios, usuarios, notificaciones

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Settings,
  Building2,
  Palette,
  Clock,
  Users,
  Bell,
  Save,
  Loader2,
  UserPlus,
  Trash2,
  Mail,
  Check,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { applyTenantTheme } from '@/lib/theme/applyTenantTheme';

// ── SCHEMAS ───────────────────────────────────────────────────────────────────

const datosSchema = z.object({
  nombre: z.string().min(2).max(200),
  ruc: z.string().optional(),
  telefono: z.string().min(7).max(20),
  direccion: z.string().max(300).optional(),
});

const invitarSchema = z.object({
  nombre: z.string().min(2),
  email: z.string().email(),
  rol: z.enum(['odontologist', 'secretary']),
});

type DatosInput = z.infer<typeof datosSchema>;
type InvitarInput = z.infer<typeof invitarSchema>;

// ── TIPOS ─────────────────────────────────────────────────────────────────────

interface Tenant {
  id: string;
  name: string;
  ruc?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  font_family: string;
}

interface Usuario {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

const ROL_ETIQUETAS: Record<string, string> = {
  admin: 'Admin',
  odontologist: 'Odontólogo',
  secretary: 'Secretaria',
};

const ROL_COLORES: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800',
  odontologist: 'bg-blue-100 text-blue-800',
  secretary: 'bg-green-100 text-green-800',
};

// ── TAB DATOS ─────────────────────────────────────────────────────────────────

function TabDatos({ tenant }: { tenant: Tenant | null }) {
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<DatosInput>({
    resolver: zodResolver(datosSchema),
    defaultValues: {
      nombre: tenant?.name ?? '',
      ruc: tenant?.ruc ?? '',
      telefono: tenant?.phone ?? '',
      direccion: tenant?.address ?? '',
    },
  });

  const onSubmit = async (data: DatosInput) => {
    setGuardando(true);
    setOk(false);
    try {
      const res = await fetch('/api/tenant/onboarding/paso-1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, especialidad: '' }),
      });
      if (res.ok) setOk(true);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre del consultorio</label>
        <Input {...register('nombre')} className={errors.nombre ? 'border-red-400' : ''} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">RUC</label>
        <Input {...register('ruc')} placeholder="Opcional" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono</label>
        <Input {...register('telefono')} className={errors.telefono ? 'border-red-400' : ''} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Dirección</label>
        <Input {...register('direccion')} />
      </div>
      <Button type="submit" disabled={guardando} className="gap-2 bg-blue-600 hover:bg-blue-700">
        {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : ok ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        {ok ? '¡Guardado!' : 'Guardar cambios'}
      </Button>
    </form>
  );
}

// ── TAB IDENTIDAD VISUAL ──────────────────────────────────────────────────────

function TabIdentidad({ tenant }: { tenant: Tenant | null }) {
  const [primary, setPrimary] = useState(tenant?.primary_color ?? '#2563EB');
  const [secondary, setSecondary] = useState(tenant?.secondary_color ?? '#0F766E');
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    applyTenantTheme({ primary_color: primary, secondary_color: secondary } as any);
  }, [primary, secondary]);

  const guardar = async () => {
    setGuardando(true);
    setOk(false);
    try {
      const res = await fetch('/api/tenant/onboarding/paso-2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logo_url: tenant?.logo_url ?? null,
          primary_color: primary,
          secondary_color: secondary,
          font_family: tenant?.font_family ?? 'Inter',
        }),
      });
      if (res.ok) setOk(true);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-5 max-w-lg">
      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Color primario</label>
          <div className="flex items-center gap-3">
            <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)}
              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
            <span className="text-sm font-mono text-gray-600">{primary.toUpperCase()}</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Color secundario</label>
          <div className="flex items-center gap-3">
            <input type="color" value={secondary} onChange={(e) => setSecondary(e.target.value)}
              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
            <span className="text-sm font-mono text-gray-600">{secondary.toUpperCase()}</span>
          </div>
        </div>
      </div>
      <div
        className="h-12 rounded-xl border border-gray-200 flex items-center px-4 gap-3"
        style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})` }}
      >
        <span className="text-white text-sm font-semibold">Vista previa del gradiente</span>
      </div>
      <Button onClick={guardar} disabled={guardando} className="gap-2 bg-blue-600 hover:bg-blue-700">
        {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : ok ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        {ok ? '¡Guardado!' : 'Guardar colores'}
      </Button>
    </div>
  );
}

// ── TAB USUARIOS ──────────────────────────────────────────────────────────────

function TabUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [invitando, setInvitando] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InvitarInput>({
    resolver: zodResolver(invitarSchema),
    defaultValues: { rol: 'odontologist' },
  });

  const cargar = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) setUsuarios((await res.json()).usuarios ?? []);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const invitar = async (data: InvitarInput) => {
    setInvitando(true);
    try {
      await fetch('/api/tenant/onboarding/paso-4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarios: [data] }),
      });
      reset();
      setMostrarForm(false);
      cargar();
    } finally {
      setInvitando(false);
    }
  };

  const desactivar = async (id: string) => {
    if (!confirm('¿Desactivar este usuario?')) return;
    await fetch(`/api/users/${id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: false }),
    });
    cargar();
  };

  if (cargando) return <div className="flex items-center gap-2 text-gray-500 text-sm"><Loader2 className="w-4 h-4 animate-spin" />Cargando...</div>;

  return (
    <div className="space-y-4">
      {/* Lista de usuarios */}
      <div className="space-y-2">
        {usuarios.map((u) => (
          <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
              {u.full_name[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{u.full_name}</p>
              <p className="text-xs text-gray-500 truncate">{u.email}</p>
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROL_COLORES[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
              {ROL_ETIQUETAS[u.role] ?? u.role}
            </span>
            {u.is_active ? (
              <button onClick={() => desactivar(u.id)} className="text-gray-400 hover:text-red-500 p-1" title="Desactivar">
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <span className="text-xs text-gray-400">Inactivo</span>
            )}
          </div>
        ))}
      </div>

      {/* Formulario invitar */}
      {mostrarForm ? (
        <form onSubmit={handleSubmit(invitar)} className="border border-blue-200 rounded-xl p-4 bg-blue-50 space-y-3">
          <h3 className="text-sm font-semibold text-blue-800">Invitar usuario</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input {...register('nombre')} placeholder="Nombre completo" className={errors.nombre ? 'border-red-400' : ''} />
            <Input {...register('email')} type="email" placeholder="Email" className={errors.email ? 'border-red-400' : ''} />
          </div>
          <div className="flex gap-4">
            {['odontologist', 'secretary'].map((r) => (
              <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" {...register('rol')} value={r} />
                {ROL_ETIQUETAS[r]}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={invitando} className="gap-1 bg-blue-600 hover:bg-blue-700">
              {invitando ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
              Invitar
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => { reset(); setMostrarForm(false); }}>
              Cancelar
            </Button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setMostrarForm(true)}
          className="flex items-center gap-2 justify-center w-full p-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm font-medium"
        >
          <UserPlus className="w-4 h-4" />
          Invitar nuevo usuario
        </button>
      )}
    </div>
  );
}

// ── TAB NOTIFICACIONES ────────────────────────────────────────────────────────

function TabNotificaciones() {
  const [email, setEmail] = useState(true);
  const [whatsapp, setWhatsapp] = useState(true);
  const [waNumero, setWaNumero] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk] = useState(false);

  const guardar = async () => {
    setGuardando(true);
    setOk(false);
    try {
      const res = await fetch('/api/tenant/notificaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notif_email_activo: email, notif_whatsapp_activo: whatsapp, whatsapp_numero: waNumero }),
      });
      if (res.ok) setOk(true);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div className="space-y-3">
        <label className="flex items-center justify-between p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Notificaciones por Email</p>
              <p className="text-xs text-gray-500">Confirmaciones y recordatorios vía email</p>
            </div>
          </div>
          <div
            onClick={() => setEmail(!email)}
            className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors ${email ? 'bg-blue-600' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${email ? 'translate-x-5' : ''}`} />
          </div>
        </label>

        <label className="flex items-center justify-between p-4 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Notificaciones por WhatsApp</p>
              <p className="text-xs text-gray-500">Mensajes automáticos vía WhatsApp Business</p>
            </div>
          </div>
          <div
            onClick={() => setWhatsapp(!whatsapp)}
            className={`relative w-10 h-5 rounded-full cursor-pointer transition-colors ${whatsapp ? 'bg-green-600' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${whatsapp ? 'translate-x-5' : ''}`} />
          </div>
        </label>
      </div>

      {whatsapp && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Número de WhatsApp Business
          </label>
          <Input
            value={waNumero}
            onChange={(e) => setWaNumero(e.target.value)}
            placeholder="51987654321 (con código de país)"
          />
          <p className="text-xs text-gray-400 mt-1">
            Configura primero tu cuenta en Meta Business Manager
          </p>
        </div>
      )}

      <Button onClick={guardar} disabled={guardando} className="gap-2 bg-blue-600 hover:bg-blue-700">
        {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : ok ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        {ok ? '¡Guardado!' : 'Guardar configuración'}
      </Button>
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────

export default function SettingsPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    fetch('/api/tenant/configuracion').then((r) => r.json()).then((d) => setTenant(d.tenant ?? null));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
          <Settings className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-sm text-gray-500">Personaliza tu consultorio</p>
        </div>
      </div>

      <Tabs defaultValue="datos">
        <TabsList className="flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="datos" className="gap-2">
            <Building2 className="w-4 h-4" /> Datos
          </TabsTrigger>
          <TabsTrigger value="identidad" className="gap-2">
            <Palette className="w-4 h-4" /> Identidad
          </TabsTrigger>
          <TabsTrigger value="horarios" className="gap-2">
            <Clock className="w-4 h-4" /> Horarios
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="gap-2">
            <Users className="w-4 h-4" /> Usuarios
          </TabsTrigger>
          <TabsTrigger value="notificaciones" className="gap-2">
            <Bell className="w-4 h-4" /> Notificaciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="datos" className="mt-6">
          <TabDatos tenant={tenant} />
        </TabsContent>
        <TabsContent value="identidad" className="mt-6">
          <TabIdentidad tenant={tenant} />
        </TabsContent>
        <TabsContent value="horarios" className="mt-6">
          <p className="text-sm text-gray-500">Editar horarios — usa el mismo formulario del paso 3 del onboarding.</p>
        </TabsContent>
        <TabsContent value="usuarios" className="mt-6">
          <TabUsuarios />
        </TabsContent>
        <TabsContent value="notificaciones" className="mt-6">
          <TabNotificaciones />
        </TabsContent>
      </Tabs>
    </div>
  );
}
