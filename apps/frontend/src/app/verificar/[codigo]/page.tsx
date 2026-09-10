'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

interface CensusPublic {
  codigoCenso: string;
  placa: string;
  tipoVehiculo: string;
  actividad: string | null;
  estado: string;
  fechaCenso: string;
}

const TIPO: Record<string, string> = { MOTOCICLETA: 'Motocicleta', MOTOCARRO: 'Motocarro' };
const ACTIVIDAD: Record<string, string> = { MOTOTAXI: 'Mototaxi', FAMILIAR: 'Familiar' };

export default function VerificarPage() {
  const params = useParams();
  const codigo = params.codigo as string;
  const [data, setData] = useState<CensusPublic | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/public/settings`)
      .then((r) => r.json())
      .then((d) => { if (d?.logoUrl) setLogoUrl(d.logoUrl); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!codigo) return;
    fetch(`${API_URL}/api/public/censos/codigo/${encodeURIComponent(codigo)}`)
      .then((r) => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then((d) => setData(d))
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [codigo]);

  const isValid = data?.estado === 'FINALIZADO' || data?.estado === 'CERTIFICADO_GENERADO';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f2460 0%, #1B3C73 60%, #2a5298 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        background: 'white', borderRadius: 16, maxWidth: 420, width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,.4)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: '#1B3C73', padding: '20px 24px', display: 'flex',
          alignItems: 'center', gap: 12,
        }}>
          <div style={{ width: 52, height: 52, flexShrink: 0 }}>
            {logoUrl ? (
              <img src={logoUrl} alt="Escudo Alcaldía" style={{ width: 52, height: 52, objectFit: 'contain', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,.4))' }} />
            ) : (
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 26 }}>🏛️</span>
              </div>
            )}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', letterSpacing: '.08em' }}>
              Alcaldía Municipal de Sabanalarga
            </p>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'white' }}>
              Verificación de Censo
            </p>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '28px 24px' }}>
          {isLoading && (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#5A6E8E' }}>
              <Loader2 style={{ width: 36, height: 36, animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ margin: 0, fontSize: 14 }}>Verificando censo...</p>
            </div>
          )}

          {notFound && !isLoading && (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <XCircle style={{ width: 52, height: 52, color: '#DC2626', margin: '0 auto 16px' }} />
              <p style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 700, color: '#111' }}>
                Censo no encontrado
              </p>
              <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>
                El código <strong>{codigo}</strong> no corresponde a ningún censo aprobado.
              </p>
            </div>
          )}

          {data && !isLoading && (
            <div>
              {/* Status banner */}
              <div style={{
                background: isValid ? '#ECFDF5' : '#FEF2F2',
                border: `1.5px solid ${isValid ? '#6EE7B7' : '#FECACA'}`,
                borderRadius: 10, padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24,
              }}>
                {isValid
                  ? <CheckCircle style={{ width: 24, height: 24, color: '#059669', flexShrink: 0 }} />
                  : <XCircle style={{ width: 24, height: 24, color: '#DC2626', flexShrink: 0 }} />
                }
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: isValid ? '#065F46' : '#991B1B' }}>
                    {isValid ? 'Censo Válido' : 'Censo no aprobado'}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: isValid ? '#047857' : '#B91C1C' }}>
                    {isValid ? 'Registrado y aprobado por la Alcaldía' : 'Este censo está en estado: ' + data.estado}
                  </p>
                </div>
              </div>

              {/* Placa grande */}
              <div style={{
                border: '2px solid #1B3C73', borderRadius: 8,
                padding: '8px 16px 10px', marginBottom: 20, position: 'relative',
                background: 'rgba(27,60,115,.03)',
              }}>
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 4, borderRadius: '6px 6px 0 0',
                  background: 'linear-gradient(90deg,#2D7A30 0% 33%,#FFFFFF 33% 66%,#FCD116 66% 100%)',
                }} />
                <p style={{ margin: '6px 0 0', fontSize: 11, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.1em' }}>Placa</p>
                <p style={{
                  margin: 0, fontSize: 36, fontWeight: 800,
                  color: '#0C1B36', letterSpacing: '.06em', lineHeight: 1.1,
                  fontFamily: '"Arial Narrow", Arial, sans-serif',
                }}>
                  {data.placa}
                </p>
              </div>

              {/* Tipo de vehículo destacado */}
              <div style={{
                background: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: 8,
                padding: '10px 14px', marginBottom: 12,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '.06em' }}>Tipo de Vehículo</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#1D4ED8' }}>{TIPO[data.tipoVehiculo] ?? data.tipoVehiculo}</span>
              </div>

              {/* Fields */}
              {[
                ['Código Censo', data.codigoCenso],
                ['Actividad', data.actividad ? (ACTIVIDAD[data.actividad] ?? data.actividad) : '—'],
                ['Fecha de Censo', format(new Date(data.fechaCenso), "dd 'de' MMMM 'de' yyyy", { locale: es })],
              ].map(([label, value]) => (
                <div key={label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 0', borderBottom: '1px solid #F3F4F6',
                }}>
                  <span style={{ fontSize: 13, color: '#6B7280' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px', background: '#F9FAFB',
          borderTop: '1px solid #E5E7EB', textAlign: 'center',
        }}>
          <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF' }}>
            Alcaldía Municipal de Sabanalarga · Atlántico · Colombia
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
