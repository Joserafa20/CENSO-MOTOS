'use client';

import { useEffect, useState } from 'react';
import { Settings, Save, Image as ImageIcon, Loader2, Building2, User, MapPin, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardWrapper from '../components/dashboard-wrapper';
import { settingsApi } from '@/lib/api-client';

interface AlcaldiaConfig {
  nombre: string;
  nit: string;
  municipio: string;
  departamento: string;
  alcalde: string;
  cargo: string;
  logoUrl: string;
}

const EMPTY: AlcaldiaConfig = {
  nombre: '',
  nit: '',
  municipio: '',
  departamento: '',
  alcalde: '',
  cargo: '',
  logoUrl: '',
};

function Field({
  label,
  icon,
  id,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  icon: React.ReactNode;
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-11 pl-10 pr-4 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
      </div>
    </div>
  );
}

function ConfiguracionPage() {
  const [form, setForm] = useState<AlcaldiaConfig>(EMPTY);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    settingsApi.get()
      .then((res) => {
        const d = res.data;
        setForm({
          nombre: d.nombre ?? '',
          nit: d.nit ?? '',
          municipio: d.municipio ?? '',
          departamento: d.departamento ?? '',
          alcalde: d.alcalde ?? '',
          cargo: d.cargo ?? '',
          logoUrl: d.logoUrl ?? '',
        });
      })
      .catch(() => toast.error('Error cargando la configuración'))
      .finally(() => setIsLoading(false));
  }, []);

  const set = (key: keyof AlcaldiaConfig) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await settingsApi.update({
        nombre: form.nombre || undefined,
        nit: form.nit || undefined,
        municipio: form.municipio || undefined,
        departamento: form.departamento || undefined,
        alcalde: form.alcalde || undefined,
        cargo: form.cargo || undefined,
        logoUrl: form.logoUrl || undefined,
      });
      toast.success('Configuración guardada correctamente');
    } catch {
      toast.error('Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Configuración de la Alcaldía</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Estos datos aparecen en los certificados generados</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Institución */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Institución
          </h2>

          <Field
            label="Nombre de la Alcaldía"
            icon={<Building2 className="w-4 h-4" />}
            id="nombre"
            value={form.nombre}
            onChange={set('nombre')}
            placeholder="Alcaldía Municipal de Sabanalarga"
          />
          <Field
            label="NIT"
            icon={<Hash className="w-4 h-4" />}
            id="nit"
            value={form.nit}
            onChange={set('nit')}
            placeholder="000-000000-0"
          />
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Municipio"
              icon={<MapPin className="w-4 h-4" />}
              id="municipio"
              value={form.municipio}
              onChange={set('municipio')}
              placeholder="Sabanalarga"
            />
            <Field
              label="Departamento"
              icon={<MapPin className="w-4 h-4" />}
              id="departamento"
              value={form.departamento}
              onChange={set('departamento')}
              placeholder="Atlántico"
            />
          </div>
        </div>

        {/* Alcalde */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
            <User className="w-4 h-4" /> Alcalde / Representante
          </h2>
          <Field
            label="Nombre del Alcalde"
            icon={<User className="w-4 h-4" />}
            id="alcalde"
            value={form.alcalde}
            onChange={set('alcalde')}
            placeholder="Nombre completo del alcalde"
          />
          <Field
            label="Cargo"
            icon={<User className="w-4 h-4" />}
            id="cargo"
            value={form.cargo}
            onChange={set('cargo')}
            placeholder="Alcalde Municipal"
          />
        </div>

        {/* Logo */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Escudo / Logo
          </h2>
          <Field
            label="URL del logo o escudo"
            icon={<ImageIcon className="w-4 h-4" />}
            id="logoUrl"
            type="url"
            value={form.logoUrl}
            onChange={set('logoUrl')}
            placeholder="https://ejemplo.com/escudo.png"
          />
          {form.logoUrl && (
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.logoUrl}
                alt="Vista previa del escudo"
                className="w-20 h-20 object-contain rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">Vista previa del escudo que aparecerá en los certificados</p>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          {isSaving ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Guardando…</>
          ) : (
            <><Save className="w-5 h-5" /> Guardar configuración</>
          )}
        </button>
      </form>
    </div>
  );
}

export default function ConfiguracionWrapper() {
  return (
    <DashboardWrapper>
      <ConfiguracionPage />
    </DashboardWrapper>
  );
}
