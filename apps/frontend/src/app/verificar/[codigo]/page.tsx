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
            <svg viewBox="0 0 80 95" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,.5))' }}>
              <defs><clipPath id="escudo-v"><path d="M8,4 L72,4 L72,52 C72,64 56,78 40,88 C24,78 8,64 8,52 Z"/></clipPath></defs>
              <ellipse cx="4" cy="22" rx="3.5" ry="6" transform="rotate(-35 4 22)" fill="#3A7A2A"/><ellipse cx="2" cy="31" rx="3.5" ry="6" transform="rotate(-22 2 31)" fill="#2D6A22"/><ellipse cx="2" cy="41" rx="3.5" ry="6" transform="rotate(-10 2 41)" fill="#3A7A2A"/><ellipse cx="4" cy="51" rx="3.5" ry="6" transform="rotate(5 4 51)" fill="#2D6A22"/>
              <ellipse cx="76" cy="22" rx="3.5" ry="6" transform="rotate(35 76 22)" fill="#3A7A2A"/><ellipse cx="78" cy="31" rx="3.5" ry="6" transform="rotate(22 78 31)" fill="#2D6A22"/><ellipse cx="78" cy="41" rx="3.5" ry="6" transform="rotate(10 78 41)" fill="#3A7A2A"/><ellipse cx="76" cy="51" rx="3.5" ry="6" transform="rotate(-5 76 51)" fill="#2D6A22"/>
              <rect x="8" y="4" width="64" height="29" fill="#1B3C73" clipPath="url(#escudo-v)"/>
              <rect x="8" y="33" width="64" height="28" fill="#2D7A30" clipPath="url(#escudo-v)"/>
              <path d="M8,61 Q20,57 32,61 Q44,65 56,61 Q64,58 72,61 L72,90 L8,90 Z" fill="#1B4B8C" clipPath="url(#escudo-v)"/>
              <line x1="8" y1="33" x2="72" y2="33" stroke="#C49A28" strokeWidth="1.5" clipPath="url(#escudo-v)"/>
              <line x1="8" y1="61" x2="72" y2="61" stroke="#C49A28" strokeWidth="1" clipPath="url(#escudo-v)"/>
              <g clipPath="url(#escudo-v)" stroke="#FCD116" strokeWidth="1.8" strokeLinecap="round"><line x1="40" y1="8" x2="40" y2="5"/><line x1="40" y1="30" x2="40" y2="33"/><line x1="27" y1="19" x2="24" y2="19"/><line x1="53" y1="19" x2="56" y2="19"/><line x1="31" y1="11" x2="29" y2="9"/><line x1="49" y1="11" x2="51" y2="9"/><line x1="31" y1="27" x2="29" y2="29"/><line x1="49" y1="27" x2="51" y2="29"/></g>
              <circle cx="40" cy="19" r="9" fill="#FCD116" clipPath="url(#escudo-v)"/><circle cx="40" cy="19" r="5.5" fill="#F5A800" clipPath="url(#escudo-v)"/><circle cx="40" cy="19" r="2" fill="#FCD116" clipPath="url(#escudo-v)"/>
              <path d="M38,60 C38.5,52 39,43 40,33 C41,43 41.5,52 42,60 Z" fill="#7A4E1A" clipPath="url(#escudo-v)"/>
              <path d="M40,36 Q35,28 30,25 Q35,31 40,36" fill="#1A7A22" clipPath="url(#escudo-v)"/><path d="M40,36 Q45,28 50,25 Q45,31 40,36" fill="#22882A" clipPath="url(#escudo-v)"/>
              <path d="M40,38 Q31,34 25,32 Q32,37 40,38" fill="#1A7A22" clipPath="url(#escudo-v)"/><path d="M40,38 Q49,34 55,32 Q48,37 40,38" fill="#22882A" clipPath="url(#escudo-v)"/>
              <circle cx="37.5" cy="39" r="2.2" fill="#C49A28" clipPath="url(#escudo-v)"/><circle cx="42" cy="38" r="2.2" fill="#B8850A" clipPath="url(#escudo-v)"/>
              <path d="M8,4 L72,4 L72,52 C72,64 56,78 40,88 C24,78 8,64 8,52 Z" fill="none" stroke="#7A6020" strokeWidth="3.5"/>
              <path d="M8,4 L72,4 L72,52 C72,64 56,78 40,88 C24,78 8,64 8,52 Z" fill="none" stroke="#C49A28" strokeWidth="2"/>
              <path d="M12,89 Q40,97 68,89 L65,94 Q40,101 15,94 Z" fill="#C49A28"/>
              <text x="40" y="97.5" fontFamily="Arial,sans-serif" fontSize="5.2" fontWeight="bold" fill="#0C1B36" textAnchor="middle" letterSpacing="0.8">SABANALARGA</text>
            </svg>
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

              {/* Fields */}
              {[
                ['Código Censo', data.codigoCenso],
                ['Tipo', TIPO[data.tipoVehiculo] ?? data.tipoVehiculo],
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
