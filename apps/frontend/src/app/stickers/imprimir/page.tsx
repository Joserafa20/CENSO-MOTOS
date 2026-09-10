'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Printer, ArrowLeft, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';
import apiClient from '@/lib/api-client';
import { settingsApi } from '@/lib/api-client';

interface CensusSticker {
  id: string;
  codigoCenso: string;
  placa: string;
  tipoVehiculo: string;
  actividad: string | null;
  fechaCenso: string;
  qrDataUrl?: string;
}

const ACTIVIDAD_LABEL: Record<string, string> = {
  MOTOTAXI: 'Mototaxi',
  FAMILIAR: 'Familiar',
};

const TIPO_LABEL: Record<string, string> = {
  MOTOCICLETA: 'Motocicleta',
  MOTOCARRO: 'Motocarro',
};

function StickerCard({ census, logoUrl }: { census: CensusSticker; logoUrl: string | null }) {
  const year = new Date(census.fechaCenso).getFullYear();

  return (
    <div className="sticker-card">
      {/* Gold top line */}
      <div className="gold-top" />

      {/* Left blue column */}
      <div className="sticker-left">
        <div className="seal-wrap">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo Alcaldía" className="seal-logo" />
          ) : (
            <svg className="seal-svg" viewBox="0 0 80 95" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <clipPath id={`sc-${census.id}`}>
                  <path d="M8,4 L72,4 L72,52 C72,64 56,78 40,88 C24,78 8,64 8,52 Z"/>
                </clipPath>
              </defs>
              <ellipse cx="4"  cy="22" rx="3.5" ry="6" transform="rotate(-35 4 22)"  fill="#3A7A2A"/>
              <ellipse cx="2"  cy="31" rx="3.5" ry="6" transform="rotate(-22 2 31)"  fill="#2D6A22"/>
              <ellipse cx="2"  cy="41" rx="3.5" ry="6" transform="rotate(-10 2 41)"  fill="#3A7A2A"/>
              <ellipse cx="4"  cy="51" rx="3.5" ry="6" transform="rotate(5 4 51)"    fill="#2D6A22"/>
              <path d="M5,20 C3,28 2,38 4,55" fill="none" stroke="#2D6A22" stroke-width="1"/>
              <ellipse cx="76" cy="22" rx="3.5" ry="6" transform="rotate(35 76 22)"  fill="#3A7A2A"/>
              <ellipse cx="78" cy="31" rx="3.5" ry="6" transform="rotate(22 78 31)"  fill="#2D6A22"/>
              <ellipse cx="78" cy="41" rx="3.5" ry="6" transform="rotate(10 78 41)"  fill="#3A7A2A"/>
              <ellipse cx="76" cy="51" rx="3.5" ry="6" transform="rotate(-5 76 51)"  fill="#2D6A22"/>
              <path d="M75,20 C77,28 78,38 76,55" fill="none" stroke="#2D6A22" stroke-width="1"/>
              <rect x="8" y="4" width="64" height="29" fill="#1B3C73" clipPath={`url(#sc-${census.id})`}/>
              <rect x="8" y="33" width="64" height="28" fill="#2D7A30" clipPath={`url(#sc-${census.id})`}/>
              <path d="M8,61 Q20,57 32,61 Q44,65 56,61 Q64,58 72,61 L72,90 L8,90 Z" fill="#1B4B8C" clipPath={`url(#sc-${census.id})`}/>
              <line x1="8" y1="33" x2="72" y2="33" stroke="#C49A28" strokeWidth="1.5" clipPath={`url(#sc-${census.id})`}/>
              <line x1="8" y1="61" x2="72" y2="61" stroke="#C49A28" strokeWidth="1" clipPath={`url(#sc-${census.id})`}/>
              <g clipPath={`url(#sc-${census.id})`} stroke="#FCD116" strokeWidth="1.8" strokeLinecap="round">
                <line x1="40" y1="8"  x2="40" y2="5"/>
                <line x1="40" y1="30" x2="40" y2="33"/>
                <line x1="27" y1="19" x2="24" y2="19"/>
                <line x1="53" y1="19" x2="56" y2="19"/>
                <line x1="31" y1="11" x2="29" y2="9"/>
                <line x1="49" y1="11" x2="51" y2="9"/>
                <line x1="31" y1="27" x2="29" y2="29"/>
                <line x1="49" y1="27" x2="51" y2="29"/>
              </g>
              <circle cx="40" cy="19" r="9"   fill="#FCD116" clipPath={`url(#sc-${census.id})`}/>
              <circle cx="40" cy="19" r="5.5" fill="#F5A800" clipPath={`url(#sc-${census.id})`}/>
              <circle cx="40" cy="19" r="2"   fill="#FCD116" clipPath={`url(#sc-${census.id})`}/>
              <path d="M38,60 C38.5,52 39,43 40,33 C41,43 41.5,52 42,60 Z" fill="#7A4E1A" clipPath={`url(#sc-${census.id})`}/>
              <path d="M40,36 Q35,28 30,25 Q35,31 40,36" fill="#1A7A22" clipPath={`url(#sc-${census.id})`}/>
              <path d="M40,36 Q45,28 50,25 Q45,31 40,36" fill="#22882A" clipPath={`url(#sc-${census.id})`}/>
              <path d="M40,38 Q31,34 25,32 Q32,37 40,38" fill="#1A7A22" clipPath={`url(#sc-${census.id})`}/>
              <path d="M40,38 Q49,34 55,32 Q48,37 40,38" fill="#22882A" clipPath={`url(#sc-${census.id})`}/>
              <path d="M40,40 Q30,42 24,41 Q31,42 40,40" fill="#1A7A22" clipPath={`url(#sc-${census.id})`}/>
              <path d="M40,40 Q50,42 56,41 Q49,42 40,40" fill="#22882A" clipPath={`url(#sc-${census.id})`}/>
              <circle cx="37.5" cy="39" r="2.2" fill="#C49A28" clipPath={`url(#sc-${census.id})`}/>
              <circle cx="42"   cy="38" r="2.2" fill="#B8850A" clipPath={`url(#sc-${census.id})`}/>
              <g clipPath={`url(#sc-${census.id})`} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" strokeLinecap="round">
                <path d="M14,68 Q22,64 30,68 Q38,72 46,68 Q54,64 62,68"/>
                <path d="M14,74 Q22,70 30,74 Q38,78 46,74 Q54,70 62,74"/>
              </g>
              <path d="M8,4 L72,4 L72,52 C72,64 56,78 40,88 C24,78 8,64 8,52 Z" fill="none" stroke="#7A6020" strokeWidth="3.5"/>
              <path d="M8,4 L72,4 L72,52 C72,64 56,78 40,88 C24,78 8,64 8,52 Z" fill="none" stroke="#C49A28" strokeWidth="2"/>
              <path d="M11,7 L69,7 L69,51.5 C69,62 54.5,75 40,84 C25.5,75 11,62 11,51.5 Z" fill="none" stroke="rgba(240,216,122,0.35)" strokeWidth="0.8"/>
              <path d="M12,89 Q40,97 68,89 L65,94 Q40,101 15,94 Z" fill="#C49A28"/>
              <text x="40" y="97.5" fontFamily="Arial,sans-serif" fontSize="5.2" fontWeight="bold" fill="#0C1B36" textAnchor="middle" letterSpacing="0.8">SABANALARGA</text>
            </svg>
          )}
        </div>
        <div className="col-text">
          <span className="col-alcaldia">Alcaldía Municipal</span>
          <span className="col-muni">Sabanalarga</span>
          <span className="col-dept">Atlántico</span>
        </div>
      </div>

      {/* Gold vertical separator */}
      <div className="gold-sep" />

      {/* Right content */}
      <div className="sticker-right">
        <div className="main-body">
          {/* Placa */}
          <div className="placa-block">
            <span className="field-label">Placa</span>
            <div className="placa-box">
              <div className="tricolor" />
              <span className="placa-value">{census.placa}</span>
            </div>
            <div className="consec-row">
              <span className="consec-label">Consecutivo</span>
              <span className="consec-value">{census.codigoCenso}</span>
            </div>
            <div className="actividad-row">
              <span className="consec-label">Tipo</span>
              <span className="actividad-value">{TIPO_LABEL[census.tipoVehiculo] ?? census.tipoVehiculo}</span>
            </div>
            {census.actividad && (
              <div className="actividad-row">
                <span className="consec-label">Actividad</span>
                <span className="actividad-value">{ACTIVIDAD_LABEL[census.actividad] ?? census.actividad}</span>
              </div>
            )}
          </div>
          {/* QR */}
          <div className="qr-block">
            <div className="qr-wrap">
              {census.qrDataUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={census.qrDataUrl} alt="QR" width={56} height={56} />
              )}
            </div>
            <span className="qr-label">Escanear</span>
          </div>
        </div>
        {/* Footer */}
        <div className="sticker-footer">
          <span className="footer-text">Registro de Censo de Motos</span>
          <span className="footer-year">{year}</span>
        </div>
      </div>

      {/* Holographic strip */}
      <div className="holo-strip" />
    </div>
  );
}

function ImprimirStickersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [censuses, setCensuses] = useState<CensusSticker[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const ids = searchParams.get('ids')?.split(',').filter(Boolean) ?? [];
    if (ids.length === 0) { setIsLoading(false); return; }
    loadData(ids);
  }, [searchParams]);

  const loadData = async (ids: string[]) => {
    try {
      const [settingsRes, ...censusResults] = await Promise.all([
        settingsApi.get().catch(() => ({ data: null })),
        ...ids.map((id) => apiClient.get(`/api/censuses/${id}`)),
      ]);

      if (settingsRes.data?.logoUrl) setLogoUrl(settingsRes.data.logoUrl);

      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const loaded: CensusSticker[] = await Promise.all(
        censusResults.map(async (res) => {
          const c = res.data;
          const url = `${origin}/verificar/${c.codigoCenso}`;
          const qrDataUrl = await QRCode.toDataURL(url, {
            width: 112,
            margin: 1,
            color: { dark: '#0C1B36', light: '#FFFFFF' },
          });
          return { ...c, qrDataUrl };
        })
      );

      setCensuses(loaded);
    } catch {
      // silently fail — sticker renders without QR if needed
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => window.print();

  return (
    <>
      {/* Screen-only controls */}
      <div className="print:hidden screen-controls">
        <button onClick={() => router.back()} className="back-btn">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <div className="controls-center">
          <p className="controls-title">Vista previa de impresión — {censuses.length} sticker{censuses.length !== 1 ? 's' : ''}</p>
          <p className="controls-sub">Hoja A4 · 2 columnas · 4 filas = 8 stickers por página</p>
        </div>
        <button onClick={handlePrint} className="print-btn">
          <Printer className="w-4 h-4" />
          Imprimir / Guardar PDF
        </button>
      </div>

      {/* Print sheet */}
      <div className="sheet">
        {isLoading ? (
          <div className="loading-state print:hidden">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p>Generando stickers...</p>
          </div>
        ) : (
          <div className="sticker-grid">
            {censuses.map((c) => (
              <StickerCard key={c.id} census={c} logoUrl={logoUrl} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        /* ── Screen wrapper ── */
        body { margin: 0; padding: 0; background: #DDE3ED; font-family: sans-serif; }

        .screen-controls {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: #1B3C73; color: white;
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 24px; gap: 16px; box-shadow: 0 2px 8px rgba(0,0,0,.3);
        }
        .back-btn {
          display: flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.2);
          color: white; font-size: 13px; font-weight: 600; padding: 6px 14px;
          border-radius: 8px; cursor: pointer;
        }
        .back-btn:hover { background: rgba(255,255,255,.2); }
        .controls-center { text-align: center; }
        .controls-title { font-size: 14px; font-weight: 700; margin: 0; }
        .controls-sub { font-size: 11px; color: rgba(255,255,255,.6); margin: 2px 0 0; }
        .print-btn {
          display: flex; align-items: center; gap: 6px;
          background: #C49A28; border: none; color: #0C1B36;
          font-size: 13px; font-weight: 700; padding: 8px 18px;
          border-radius: 8px; cursor: pointer;
        }
        .print-btn:hover { background: #D4AA38; }
        .loading-state {
          display: flex; flex-direction: column; align-items: center;
          gap: 12px; padding: 60px; color: #5A6E8E; font-size: 14px;
        }

        /* ── Sheet ── */
        .sheet {
          padding-top: 72px; /* space for fixed controls on screen */
          display: flex; justify-content: center; padding-bottom: 40px;
        }

        /* ── Sticker grid: 2 columns on screen preview ── */
        .sticker-grid {
          display: grid;
          grid-template-columns: repeat(2, 340px);
          gap: 8mm;
          padding: 10mm;
          background: white;
          box-shadow: 0 4px 24px rgba(0,0,0,.15);
          border-radius: 4px;
        }

        /* ── Individual sticker: 90mm × 58mm ≈ 340px × 219px ── */
        .sticker-card {
          width: 340px; height: 219px;
          border-radius: 6px; overflow: hidden;
          position: relative;
          background: #FFFFFF;
          background-image: repeating-linear-gradient(
            -45deg, transparent, transparent 6px,
            rgba(27,60,115,.025) 6px, rgba(27,60,115,.025) 7px
          );
          box-shadow: 0 1px 4px rgba(0,0,0,.12);
        }

        .gold-top {
          position: absolute; top: 0; left: 0; right: 0; height: 3px; z-index: 10;
          background: linear-gradient(90deg, #C49A28 0%, #F0D87A 50%, #C49A28 100%);
        }

        /* Left column */
        .sticker-left {
          position: absolute; top: 0; left: 0; bottom: 0; width: 90px;
          background: #1B3C73;
          background-image: repeating-linear-gradient(
            -55deg, transparent, transparent 8px,
            rgba(255,255,255,.03) 8px, rgba(255,255,255,.03) 9px
          );
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 4px; padding: 10px 6px 8px;
        }
        .seal-wrap { width: 66px; flex-shrink: 0; }
        .seal-svg { width: 66px; height: auto; filter: drop-shadow(0 1px 2px rgba(0,0,0,.4)); }
        .seal-logo { width: 52px; height: 52px; object-fit: contain; border-radius: 50%; border: 2px solid #C49A28; }
        .col-text { display: flex; flex-direction: column; align-items: center; gap: 1px; }
        .col-alcaldia { font-size: 8px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: rgba(255,255,255,.7); text-align: center; line-height: 1.2; }
        .col-muni { font-size: 10px; font-weight: 900; letter-spacing: .03em; text-transform: uppercase; color: #F0D87A; text-align: center; line-height: 1.1; }
        .col-dept { font-size: 7px; font-weight: 500; color: rgba(255,255,255,.4); text-align: center; letter-spacing: .06em; text-transform: uppercase; margin-top: 1px; }

        /* Gold separator */
        .gold-sep {
          position: absolute; top: 3px; bottom: 0; left: 90px; width: 2px;
          background: linear-gradient(180deg, #C49A28 0%, #F0D87A 50%, #C49A28 100%);
        }

        /* Right area */
        .sticker-right {
          position: absolute; top: 3px; left: 92px; right: 0; bottom: 0;
          display: flex; flex-direction: column;
        }
        .main-body {
          flex: 1; display: flex; align-items: center;
          padding: 10px 10px 8px 14px; gap: 10px;
        }

        /* Placa */
        .placa-block { flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0; }
        .field-label { font-size: 7px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: #5A6E8E; padding-left: 2px; }
        .placa-box {
          border: 1.5px solid #1B3C73; border-radius: 5px;
          padding: 3px 6px 4px; background: rgba(27,60,115,.04);
          position: relative; overflow: visible;
        }
        .tricolor {
          position: absolute; top: 0; left: 0; right: 0; height: 3px; border-radius: 3px 3px 0 0;
          background: linear-gradient(90deg, #2D7A30 0% 33.3%, #FFFFFF 33.3% 66.6%, #FCD116 66.6% 100%);
        }
        .placa-value {
          font-family: 'Oswald', 'Arial Narrow', Arial, sans-serif;
          font-size: 30px; font-weight: 700; color: #0C1B36;
          letter-spacing: .02em; line-height: 1; padding-top: 4px;
          font-variant-numeric: tabular-nums; white-space: nowrap;
        }
        .consec-row, .actividad-row {
          display: flex; align-items: center; gap: 4px;
          margin-top: 2px; padding-left: 2px;
        }
        .consec-label { font-size: 6.5px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #5A6E8E; white-space: nowrap; }
        .consec-value { font-family: 'Arial Narrow', Arial, sans-serif; font-size: 10px; font-weight: 700; color: #1B3C73; letter-spacing: .04em; }
        .actividad-value { font-size: 9px; font-weight: 600; color: #1B3C73; }

        /* QR */
        .qr-block { flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .qr-wrap { border: 1.5px solid rgba(27,60,115,.2); border-radius: 4px; padding: 3px; background: white; }
        .qr-wrap img { display: block; }
        .qr-label { font-size: 6px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #5A6E8E; }

        /* Footer */
        .sticker-footer {
          height: 24px; background: #1B3C73;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 10px 0 14px; flex-shrink: 0;
        }
        .footer-text { font-size: 8px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.7); }
        .footer-year { font-size: 11px; font-weight: 700; color: #F0D87A; letter-spacing: .06em; }

        /* Holographic strip */
        .holo-strip {
          position: absolute; right: 0; top: 3px; bottom: 0; width: 8px;
          background: repeating-linear-gradient(
            -60deg,
            rgba(196,154,40,.6) 0px, rgba(240,216,122,.8) 2px,
            rgba(36,80,153,.5) 4px, rgba(196,154,40,.6) 6px
          );
          border-left: 1px solid rgba(196,154,40,.3);
        }

        /* ── PRINT STYLES ── */
        @page { size: A4; margin: 10mm; }

        @media print {
          /* Force browsers to print background colors and images */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body { background: white !important; }
          .screen-controls { display: none !important; }
          .sheet { padding-top: 0 !important; padding-bottom: 0 !important; display: block !important; }
          .sticker-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 90mm) !important;
            gap: 5mm !important;
            padding: 0 !important;
            background: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .sticker-card {
            width: 90mm !important;
            height: 58mm !important;
            box-shadow: none !important;
            break-inside: avoid !important;
          }
          .placa-value { font-size: 7.5mm !important; white-space: nowrap !important; }
        }
      `}</style>
    </>
  );
}

export default function ImprimirStickersPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '12px', color: '#5A6E8E' }}>
        <Loader2 style={{ width: 32, height: 32, animation: 'spin 1s linear infinite' }} />
        <span>Cargando...</span>
      </div>
    }>
      <ImprimirStickersContent />
    </Suspense>
  );
}
