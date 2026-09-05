'use client';

import { useEffect, useRef, useState } from 'react';
import { Settings, Save, Image as ImageIcon, Loader2, Building2, User, MapPin, Hash, Upload, X } from 'lucide-react';
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
  selloUrl: string;
}

const EMPTY: AlcaldiaConfig = {
  nombre: '',
  nit: '',
  municipio: '',
  departamento: '',
  alcalde: '',
  cargo: '',
  logoUrl: '',
  selloUrl: '',
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
  const logoInputRef = useRef<HTMLInputElement>(null);
  const selloInputRef = useRef<HTMLInputElement>(null);

  const makeFileHandler = (field: 'logoUrl' | 'selloUrl') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        toast.error('Solo se permiten archivos JPG o PNG');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setForm((prev) => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    };

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
          selloUrl: d.selloUrl ?? '',
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
        selloUrl: form.selloUrl || undefined,
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

        {/* Secretario */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
            <User className="w-4 h-4" /> Secretario de Tránsito
          </h2>
          <Field
            label="Nombre del Secretario"
            icon={<User className="w-4 h-4" />}
            id="alcalde"
            value={form.alcalde}
            onChange={set('alcalde')}
            placeholder="Nombre completo del secretario"
          />
          <Field
            label="Cargo"
            icon={<User className="w-4 h-4" />}
            id="cargo"
            value={form.cargo}
            onChange={set('cargo')}
            placeholder="Secretario de Interior con Funciones de Tránsito"
          />
        </div>

        {/* Logo */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
            <ImageIcon className="w-4 h-4" /> Escudo / Logo
          </h2>

          <input ref={logoInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={makeFileHandler('logoUrl')} />
          <input ref={selloInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={makeFileHandler('selloUrl')} />

          {/* Escudo membrete */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Escudo del municipio — aparece en el membrete del certificado</p>
            {form.logoUrl ? (
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.logoUrl} alt="Escudo membrete" className="w-24 h-24 object-contain rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2" />
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => logoInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <Upload className="w-3.5 h-3.5" /> Cambiar
                    </button>
                    <button type="button" onClick={() => setForm((prev) => ({ ...prev, logoUrl: '' }))} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <X className="w-3.5 h-3.5" /> Quitar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => logoInputRef.current?.click()} className="w-full flex flex-col items-center justify-center gap-2 h-28 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors text-gray-500 dark:text-gray-400">
                <Upload className="w-5 h-5" />
                <span className="text-sm font-medium">Subir escudo del municipio</span>
                <span className="text-xs text-gray-400">JPG o PNG</span>
              </button>
            )}
          </div>

          {/* Sello oficial */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Logo institucional — aparece como sello oficial en el certificado</p>
            {form.selloUrl ? (
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.selloUrl} alt="Sello oficial" className="w-24 h-24 object-contain rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-2" />
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => selloInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <Upload className="w-3.5 h-3.5" /> Cambiar
                    </button>
                    <button type="button" onClick={() => setForm((prev) => ({ ...prev, selloUrl: '' }))} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      <X className="w-3.5 h-3.5" /> Quitar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => selloInputRef.current?.click()} className="w-full flex flex-col items-center justify-center gap-2 h-28 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors text-gray-500 dark:text-gray-400">
                <Upload className="w-5 h-5" />
                <span className="text-sm font-medium">Subir logo institucional (sello)</span>
                <span className="text-xs text-gray-400">JPG o PNG</span>
              </button>
            )}
          </div>
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
