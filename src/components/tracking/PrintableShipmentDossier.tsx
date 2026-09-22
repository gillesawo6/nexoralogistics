import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { Shipment } from '../../types';
import { storageService } from '../../services/storageService';
import { exportElementToPdf, triggerBrowserPrint } from '../../utils/pdfGenerator';
import { resolveShipmentTelemetryLocation } from '../../utils/geoUtils';
import { Download, Printer, Loader2, CheckCircle2, X, ZoomIn, ZoomOut } from 'lucide-react';

interface PrintableShipmentDossierProps {
  shipment: Shipment;
  onClose?: () => void;
  isModal?: boolean;
}

export const PrintableShipmentDossier: React.FC<PrintableShipmentDossierProps> = ({
  shipment,
  onClose,
  isModal = false,
}) => {
  const documentRef = useRef<HTMLDivElement>(null);
  const barcodeRef = useRef<SVGSVGElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [previewMode, setPreviewMode] = useState<'fit' | 'full'>('fit');
  const [scale, setScale] = useState<number>(1);
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(false);
  const [documentHeight, setDocumentHeight] = useState<number>(1150);

  const companyInfo = storageService.getCompanyInfo();
  const resolvedLocations = resolveShipmentTelemetryLocation(shipment);

  const {
    trackingNumber,
    barcodeValue,
    carrierReference,
    status,
    origin,
    destination,
    carrier = 'FedEx',
    serviceLevel,
    transportMode = 'Land transport',
    packageType = 'CARTON',
    product = 'SEALED FRAGILE CARTON',
    cargoDescription,
    quantity = 1,
    pieces = 1,
    weightKg = 3,
    weightUnit = 'kg',
    paymentMode = 'Bank Transfer',
    totalFreight,
    dates,
    comments = 'Dear client please ensure that your details on the website are correct, as no changes can be made once delivery has begun. Thank you.',
    shipper,
    receiver,
    packages = [],
    totals,
    events = [],
    currentLocation,
    dispatchedDate,
    estimatedDelivery,
  } = shipment;

  const activeBarcode = barcodeValue || trackingNumber || 'NEXORA-CARGO';
  const displayProduct = product || cargoDescription || 'SEALED FRAGILE CARTON';
  const displayQty = quantity !== undefined ? quantity : (pieces || 1);
  const displayPackageType = packageType || 'CARTON';

  const departureDate = dates?.departureDate || (dispatchedDate ? dispatchedDate.split(' ')[0] : '2026-08-21');
  const departureTime = dates?.departureTime || (dispatchedDate?.includes(':') ? dispatchedDate.split(' ').slice(1).join(' ') : '19:00 pm');
  const pickupDate = dates?.pickupDate || dates?.departureDate || '2026-08-24';
  const pickupTime = dates?.pickupTime || '17:00 pm';
  const expectedDeliveryDate = dates?.expectedDeliveryDate || estimatedDelivery || '2026-08-24';

  // Package breakdown items
  const packageList = (packages && packages.length > 0)
    ? packages
    : [
        {
          packageNumber: 1,
          type: displayPackageType,
          description: displayProduct,
          length: 70,
          width: 40,
          height: 25,
          weight: weightKg || 3,
        },
      ];

  // Calculated totals
  const totalActWeight = totals?.actualWeight !== undefined
    ? totals.actualWeight
    : packageList.reduce((acc, p) => acc + (p.weight || 0), 0) || weightKg;

  const totalVol = totals?.volume !== undefined
    ? totals.volume
    : packageList.reduce((acc, p) => acc + ((p.length * p.width * p.height) / 1000000), 0);

  const totalVolWeight = totals?.volumetricWeight !== undefined
    ? totals.volumetricWeight
    : packageList.reduce((acc, p) => acc + ((p.length * p.width * p.height) / 5000), 0);

  // Measure document height and window width to support responsive A4 preview scaling
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      const isMobile = width < 880;
      setIsMobileScreen(isMobile);

      if (isMobile) {
        const availableWidth = Math.max(280, width - 24);
        const calculatedScale = Math.min(1, availableWidth / 840);
        setScale(calculatedScale);
      } else {
        setScale(1);
      }

      if (documentRef.current) {
        setDocumentHeight(documentRef.current.offsetHeight || 1150);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isModal]);

  useEffect(() => {
    if (documentRef.current) {
      setDocumentHeight(documentRef.current.offsetHeight || 1150);
    }
  }, [shipment, activeBarcode]);

  // Render high-precision Barcode
  useEffect(() => {
    if (!barcodeRef.current) return;
    try {
      JsBarcode(barcodeRef.current, activeBarcode, {
        format: 'CODE128',
        lineColor: '#000000',
        width: 1.8,
        height: 52,
        displayValue: false,
        margin: 4,
        background: '#ffffff',
      });
    } catch (err) {
      console.warn('Barcode render error:', err);
    }
  }, [activeBarcode]);

  const handleDownloadPdf = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportSuccess(false);

    const fileName = `NEXORA-Consignment-${trackingNumber || 'Manifest'}.pdf`;
    const success = await exportElementToPdf({
      element: documentRef.current,
      elementId: 'printable-shipment-dossier',
      fileName,
      onComplete: () => setIsExporting(false),
      onError: () => setIsExporting(false),
    });

    if (success) {
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    }
  };

  const handlePrint = () => {
    const triggered = triggerBrowserPrint();
    if (!triggered) {
      handleDownloadPdf();
    }
  };

  const getStatusColor = (st: string) => {
    const s = st.toLowerCase();
    if (s.includes('delivered')) return { text: '#059669', bg: '#ecfdf5', border: '#10b981' };
    if (s.includes('hold')) return { text: '#d97706', bg: '#fffbeb', border: '#f59e0b' };
    if (s.includes('transit') || s.includes('departed')) return { text: '#0284c7', bg: '#f0f9ff', border: '#0284c7' };
    if (s.includes('customs')) return { text: '#7c3aed', bg: '#f5f3ff', border: '#8b5cf6' };
    if (s.includes('exception') || s.includes('cancel')) return { text: '#dc2626', bg: '#fef2f2', border: '#ef4444' };
    return { text: '#4b5563', bg: '#f3f4f6', border: '#9ca3af' };
  };

  const statusStyle = getStatusColor(status);

  // Local QR Code Generator (no external network dependency)
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    const trackingUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/tracking?number=${encodeURIComponent(trackingNumber)}`
      : `https://nexoralogistics.com/tracking?number=${encodeURIComponent(trackingNumber)}`;
    
    QRCode.toDataURL(trackingUrl, {
      width: 160,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.warn('QR Code generation error:', err));
  }, [trackingNumber]);

  const isScaled = isModal && isMobileScreen && previewMode === 'fit' && scale < 1;

  const dossierContent = (
    <div
      className={`printable-shipment-wrapper ${
        isModal
          ? 'fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md overflow-y-auto overflow-x-hidden p-2 sm:p-6 flex flex-col items-center'
          : 'w-full'
      }`}
    >
      {/* Modal Toolbar for on-screen preview */}
      {isModal && (
        <div className="sticky top-2 z-[10000] flex flex-wrap items-center justify-between gap-2 print:hidden bg-slate-900/95 backdrop-blur border border-white/20 px-3 py-2 rounded-2xl shadow-2xl w-full max-w-3xl mb-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-[11px] text-white/90 bg-white/10 px-2 py-1 rounded-lg">
              A4 PHYSICAL DOSSIER
            </span>
            {isMobileScreen && (
              <button
                type="button"
                onClick={() => setPreviewMode(previewMode === 'fit' ? 'full' : 'fit')}
                className="flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-sky-400 font-mono font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                title="Toggle Mobile View Scale"
              >
                {previewMode === 'fit' ? (
                  <>
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>FIT PAGE ({Math.round(scale * 100)}%)</span>
                  </>
                ) : (
                  <>
                    <ZoomOut className="w-3.5 h-3.5" />
                    <span>100% SIZE (SCROLL)</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer ${
                exportSuccess 
                  ? 'bg-emerald-600 shadow-emerald-600/30' 
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/30'
              }`}
              title="Generate & Download PDF File"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden sm:inline">Generating...</span>
                </>
              ) : exportSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#0066FF]/30 cursor-pointer"
              title="Open Browser Print Dialog"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
                title="Close Dossier"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Screen Preview Viewport & Scale Wrapper */}
      <div
        className="print-preview-viewport w-full flex justify-center overflow-x-auto"
        style={{
          minHeight: isScaled ? `${Math.ceil(documentHeight * scale) + 24}px` : undefined,
        }}
      >
        <div
          className="print-preview-scale-wrapper origin-top transition-transform duration-200"
          style={{
            transform: isScaled ? `scale(${scale})` : 'none',
            width: '840px',
            minWidth: '840px',
            maxWidth: '840px',
          }}
        >
          {/* Main Printable Document Page Container */}
          <div 
            ref={documentRef}
            id="printable-shipment-dossier"
            className="printable-dossier-document bg-white text-slate-900 w-[840px] max-w-[840px] min-w-[840px] mx-auto p-8 shadow-2xl rounded-none font-sans text-[12px] leading-normal border border-slate-200 print:border-none print:shadow-none print:p-0 print:m-0 print:w-[190mm] print:max-w-[190mm] print:min-w-[190mm]"
          >
            {/* =========================================================================
                HEADER SECTION: CORPORATE BRANDING, BARCODE & OFFICIAL WAYBILL IDENTITY
               ========================================================================= */}
            <header className="border-b-2 border-slate-900 pb-5 mb-6">
              <div className="dossier-header-row flex flex-row items-center justify-between gap-6">
                
                {/* Corporate Brand Identity */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-[#0066FF] text-white flex items-center justify-center font-black text-lg font-mono">
                      NX
                    </div>
                    <div>
                      <h1 className="text-xl font-black font-mono tracking-tight text-slate-950 uppercase leading-none">
                        {companyInfo.companyName || 'NEXORA GLOBAL LOGISTICS'}
                      </h1>
                      <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
                        International Multi-Modal Freight Network
                      </span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-600 font-mono space-y-0.5 pt-1">
                    <div>HQ: {companyInfo.hqAddress || 'Wilhelminakade 902, 3072 AP Rotterdam, Netherlands'}</div>
                    <div>Support: {companyInfo.primaryPhone || '+31 10 892 4000'} | Web: {companyInfo.website || 'nexoralogistics.com'}</div>
                    <div>Official Certs: IATA / AEO-F Certified • ISO 9001:2015 Registered</div>
                  </div>
                </div>

                {/* Barcode & Tracking Identifier Box */}
                <div className="dossier-barcode-box flex flex-col items-center justify-center p-2.5 border border-slate-300 rounded-lg bg-slate-50/70 min-w-[260px] text-center shrink-0">
                  <span className="text-[9px] font-mono uppercase font-bold tracking-wider text-slate-500 mb-1">
                    Official Consignment Barcode
                  </span>
                  <svg ref={barcodeRef} className="max-w-full h-11" />
                  <span className="font-mono font-black text-xs tracking-wider text-slate-950 mt-1 uppercase select-all">
                    {activeBarcode}
                  </span>
                </div>
              </div>

              {/* Subheader Title Strip & Official Status Ribbon */}
              <div className="mt-4 pt-3 border-t border-slate-200 flex flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="bg-slate-900 text-white font-mono font-bold text-[10px] px-2.5 py-1 rounded uppercase tracking-wider">
                    WAYBILL / CONSIGNMENT DOSSIER
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    Printed: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Official Status Stamp */}
                <div
                  className="px-3 py-1 rounded-md border font-mono font-black text-xs uppercase tracking-widest flex items-center gap-1.5 shadow-sm"
                  style={{
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.text,
                    borderColor: statusStyle.border,
                  }}
                >
                  <span className="w-2 h-2 rounded-full bg-current" />
                  <span>SHIPMENT STATUS: {status.toUpperCase()}</span>
                </div>
              </div>
            </header>


        {/* =========================================================================
            PARTIES SECTION: SHIPPER (CONSIGNOR) & RECEIVER (CONSIGNEE)
           ========================================================================= */}
        <section className="dossier-parties-grid grid grid-cols-2 gap-4 mb-6 break-inside-avoid">
          {/* Shipper Box */}
          <div className="border border-slate-300 rounded-lg p-4 bg-slate-50/40 relative">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2.5">
              <h2 className="font-mono font-bold text-xs uppercase text-slate-950 tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Shipper Information (Consignor)
              </h2>
              <span className="text-[9px] font-mono font-bold text-emerald-700 uppercase bg-emerald-100 px-1.5 py-0.5 rounded">
                ORIGIN
              </span>
            </div>
            
            <div className="font-mono text-[11px] space-y-1 text-slate-800">
              <div className="font-bold text-slate-950 text-[13px]">
                {shipper?.name || 'Minos Herman'}
              </div>
              {shipper?.address && (
                <div className="text-slate-700">{shipper.address}</div>
              )}
              <div className="font-semibold text-slate-900">
                {[shipper?.city || 'Milan', shipper?.country || 'Italy'].filter(Boolean).join(', ')}
              </div>
              {shipper?.phone && (
                <div className="text-slate-600">Tel: {shipper.phone}</div>
              )}
              {shipper?.email && (
                <div className="text-slate-600">Email: {shipper.email}</div>
              )}
            </div>
          </div>

          {/* Receiver Box */}
          <div className="border border-slate-300 rounded-lg p-4 bg-slate-50/40 relative">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2.5">
              <h2 className="font-mono font-bold text-xs uppercase text-slate-950 tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0066FF]" />
                Receiver Information (Consignee)
              </h2>
              <span className="text-[9px] font-mono font-bold text-[#0066FF] uppercase bg-blue-100 px-1.5 py-0.5 rounded">
                DESTINATION
              </span>
            </div>
            
            <div className="font-mono text-[11px] space-y-1 text-slate-800">
              <div className="font-bold text-slate-950 text-[13px]">
                {receiver?.name || 'Letiza Affuso'}
              </div>
              <div className="text-slate-700">
                {receiver?.address || 'Via Reggio Calabria 6, Rocca Imperiale (CS)'}
              </div>
              <div className="font-semibold text-slate-900">
                {[receiver?.city, receiver?.country || 'Italy'].filter(Boolean).join(', ')} {receiver?.postalCode ? `(${receiver.postalCode})` : ''}
              </div>
              <div className="text-slate-600">
                Tel: {receiver?.phone || '327/1869248'}
              </div>
              <div className="text-slate-600">
                Email: {receiver?.email || 'letiziaaffuso@gmail.com'}
              </div>
            </div>
          </div>
        </section>


        {/* =========================================================================
            SHIPMENT INFORMATION GRID (ORIGIN, DESTINATION, CARRIER, MODE, SPECS)
           ========================================================================= */}
        <section className="border border-slate-300 rounded-lg overflow-hidden mb-6 break-inside-avoid">
          <div className="bg-slate-900 text-white font-mono font-bold text-xs px-4 py-2.5 uppercase tracking-wider flex items-center justify-between">
            <span>Shipment Information</span>
            <span className="text-[10px] text-slate-300 font-normal">AIR / OCEAN / ROAD MANIFEST</span>
          </div>

          <div className="dossier-specs-grid p-4 grid grid-cols-4 gap-y-4 gap-x-6 font-mono text-[11px]">
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Origin:</div>
              <div className="font-bold text-slate-950 text-[12px] mt-0.5">{origin?.country || 'Italy'}</div>
              <div className="text-slate-600 text-[10px]">{origin?.city || 'Milan'} {origin?.code ? `(${origin.code})` : ''}</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Destination:</div>
              <div className="font-bold text-slate-950 text-[12px] mt-0.5">{destination?.country || 'Italy'}</div>
              <div className="text-slate-600 text-[10px]">{destination?.city || 'Rocca Imperiale'} {destination?.code ? `(${destination.code})` : ''}</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Carrier:</div>
              <div className="font-bold text-slate-950 text-[12px] mt-0.5">{carrier || 'FedEx'}</div>
              <div className="text-slate-600 text-[10px]">{shipment.vesselOrFlightNumber || 'Scheduled Transit Route'}</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Status:</div>
              <div className="font-bold text-[12px] mt-0.5" style={{ color: statusStyle.text }}>{status || 'On Hold'}</div>
              <div className="text-slate-600 text-[10px]">Verified Milestone</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Package:</div>
              <div className="font-bold text-slate-950 text-[12px] mt-0.5 uppercase">{displayPackageType}</div>
              <div className="text-slate-600 text-[10px]">Industrial Standard</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Type of Shipment:</div>
              <div className="font-bold text-slate-950 text-[12px] mt-0.5">{serviceLevel || 'Road Freight'}</div>
              <div className="text-slate-600 text-[10px]">Priority Cargo</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Weight:</div>
              <div className="font-bold text-slate-950 text-[12px] mt-0.5">{weightKg} {weightUnit.toUpperCase()}</div>
              <div className="text-slate-600 text-[10px]">Gross Mass (VGM)</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Shipment Mode:</div>
              <div className="font-bold text-slate-950 text-[12px] mt-0.5">{transportMode}</div>
              <div className="text-slate-600 text-[10px]">Ground Intermodal</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Carrier Reference No.:</div>
              <div className="font-bold text-slate-950 text-[12px] mt-0.5">{carrierReference || trackingNumber || '—'}</div>
              <div className="text-slate-600 text-[10px]">Master Air / BOL #</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Product / Cargo:</div>
              <div className="font-bold text-slate-950 text-[12px] mt-0.5 truncate" title={displayProduct}>{displayProduct}</div>
              <div className="text-slate-600 text-[10px]">Documented Commodity</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Qty:</div>
              <div className="font-bold text-slate-950 text-[12px] mt-0.5">{displayQty}</div>
              <div className="text-slate-600 text-[10px]">Piece Count</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Payment Mode:</div>
              <div className="font-bold text-slate-950 text-[12px] mt-0.5">{paymentMode}</div>
              <div className="text-slate-600 text-[10px]">Terms Confirmed</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Total Freight:</div>
              <div className="font-bold text-slate-950 text-[12px] mt-0.5">
                {totalFreight?.amount ? `${totalFreight.currency || '$'} ${totalFreight.amount.toLocaleString()}` : 'Included in Service Agreement'}
              </div>
              <div className="text-slate-600 text-[10px]">All Tariffs Settled</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Departure Time:</div>
              <div className="font-bold text-slate-950 text-[12px] mt-0.5">{departureTime}</div>
              <div className="text-slate-600 text-[10px]">Dep. Date: {departureDate}</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Pick-up Date:</div>
              <div className="font-bold text-slate-950 text-[12px] mt-0.5">{pickupDate}</div>
              <div className="text-slate-600 text-[10px]">Pick-up: {pickupTime}</div>
            </div>

            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Expected Delivery Date:</div>
              <div className="font-bold text-[#0066FF] text-[12px] mt-0.5">{expectedDeliveryDate}</div>
              <div className="text-slate-600 text-[10px]">Target ETA</div>
            </div>
          </div>
        </section>


        {/* =========================================================================
            SPECIAL HANDLING COMMENTS & CLIENT INSTRUCTIONS
           ========================================================================= */}
        {comments && (
          <section className="border border-amber-300 bg-amber-50/80 rounded-lg p-3.5 mb-6 break-inside-avoid">
            <div className="flex items-start gap-2.5">
              <div className="text-amber-600 font-bold text-sm">⚠</div>
              <div className="font-mono">
                <span className="font-bold uppercase text-[10px] text-amber-900 tracking-wider block mb-0.5">
                  Comments / Special Handling Instructions:
                </span>
                <p className="text-slate-800 text-[11px] leading-relaxed">
                  {comments}
                </p>
              </div>
            </div>
          </section>
        )}


        {/* =========================================================================
            ITEMIZED PACKAGES TABLE & DIMENSION TOTALS
           ========================================================================= */}
        <section className="border border-slate-300 rounded-lg overflow-hidden mb-6 break-inside-avoid">
          <div className="bg-slate-900 text-white font-mono font-bold text-xs px-4 py-2.5 uppercase tracking-wider flex items-center justify-between">
            <span>Packages</span>
            <span className="text-[10px] text-slate-300 font-normal">{packageList.length} LINE {packageList.length === 1 ? 'ITEM' : 'ITEMS'}</span>
          </div>

          <table className="dossier-table table-fixed w-full text-left font-mono text-[11px]">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3 w-[8%]">Qty.</th>
                <th className="py-2.5 px-3 w-[17%]">Piece Type</th>
                <th className="py-2.5 px-3 w-[27%]">Description</th>
                <th className="py-2.5 px-3 text-center w-[12%]">Length(cm)</th>
                <th className="py-2.5 px-3 text-center w-[12%]">Width(cm)</th>
                <th className="py-2.5 px-3 text-center w-[12%]">Height(cm)</th>
                <th className="py-2.5 px-3 text-right w-[12%]">Weight (kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {packageList.map((pkg, idx) => (
                <tr key={idx} className="bg-white">
                  <td className="py-2.5 px-3 font-bold text-slate-950">
                    {displayQty || 1}
                  </td>
                  <td className="py-2.5 px-3 uppercase text-slate-800">
                    {pkg.type || displayPackageType}
                  </td>
                  <td className="py-2.5 px-3 text-slate-900 font-medium">
                    {pkg.description || displayProduct}
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-800">
                    {pkg.length}
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-800">
                    {pkg.width}
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-800">
                    {pkg.height}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-950">
                    {pkg.weight}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Package Totals Summary Strip */}
          <div className="bg-slate-50 border-t border-slate-300 p-3 flex flex-wrap items-center justify-end gap-x-8 gap-y-2 font-mono text-[11px] font-bold text-slate-900">
            <div>
              <span className="text-slate-500 uppercase font-normal text-[10px] mr-1">Total Volumetric Weight:</span>
              <span className="text-slate-950">{totalVolWeight.toFixed(2)}kg.</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase font-normal text-[10px] mr-1">Total Volume:</span>
              <span className="text-slate-950">{totalVol.toFixed(2)}cu. m.</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase font-normal text-[10px] mr-1">Total Actual Weight:</span>
              <span className="text-slate-950">{totalActWeight.toFixed(2)}kg.</span>
            </div>
          </div>
        </section>


        {/* =========================================================================
            MAP & ROUTE VISUAL TELEMETRY SUMMARY
           ========================================================================= */}
        <section className="border border-slate-300 rounded-lg overflow-hidden mb-6 break-inside-avoid">
          <div className="bg-slate-900 text-white font-mono font-bold text-xs px-4 py-2.5 uppercase tracking-wider flex items-center justify-between">
            <span>Route &amp; Telemetry Waypoint</span>
            <span className="text-[10px] text-slate-300 font-normal">SATELLITE POSITIONING ACTIVE</span>
          </div>

          <div className="p-4 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px]">
            <div className="space-y-1">
              <div className="text-slate-600">
                <strong className="text-slate-950">Current Position:</strong> {resolvedLocations.current.locationName}
              </div>
              <div className="text-slate-500 text-[10px]">
                Coordinates: {resolvedLocations.current.lat.toFixed(4)}° N, {resolvedLocations.current.lng.toFixed(4)}° E • Transit corridor monitored
              </div>
            </div>

            <div className="flex items-center gap-3 border border-slate-300 bg-white p-2.5 rounded-lg text-center">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Transit Progress</div>
              <div className="text-base font-black font-mono text-[#0066FF]">{shipment.progressPercent || 35}%</div>
            </div>
          </div>
        </section>


        {/* =========================================================================
            SHIPMENT HISTORY & AUDIT TRAIL TABLE
           ========================================================================= */}
        <section className="border border-slate-300 rounded-lg overflow-hidden mb-6 break-inside-avoid">
          <div className="bg-slate-900 text-white font-mono font-bold text-xs px-4 py-2.5 uppercase tracking-wider flex items-center justify-between">
            <span>Shipment History</span>
            <span className="text-[10px] text-slate-300 font-normal">OFFICIAL TIME-STAMPED AUDIT LOG</span>
          </div>

          <table className="dossier-table table-fixed w-full text-left font-mono text-[11px]">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3 w-[13%]">Date</th>
                <th className="py-2.5 px-3 w-[11%]">Time</th>
                <th className="py-2.5 px-3 w-[28%]">Location</th>
                <th className="py-2.5 px-3 w-[14%]">Status</th>
                <th className="py-2.5 px-3 w-[12%]">Updated By</th>
                <th className="py-2.5 px-3 w-[22%]">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {events.length > 0 ? (
                events.map((ev, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="py-2.5 px-3 font-semibold text-slate-950 whitespace-nowrap">
                      {ev.date}
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                      {ev.time}
                    </td>
                    <td className="py-2.5 px-3 text-slate-900">
                      {ev.location}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-900 uppercase">
                        {ev.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {ev.updatedBy || 'admin'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-800">
                      {ev.remarks || ev.description || 'Pacco Registrato'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="bg-white">
                  <td className="py-2.5 px-3 font-semibold text-slate-950">2026-08-21</td>
                  <td className="py-2.5 px-3 text-slate-700">17:00 pm</td>
                  <td className="py-2.5 px-3 text-slate-900">Via Alberico Albricci, 10, Milan, Metropolitan City of Milan, Italy</td>
                  <td className="py-2.5 px-3 font-bold text-amber-700">On Hold</td>
                  <td className="py-2.5 px-3 text-slate-600">admin</td>
                  <td className="py-2.5 px-3 text-slate-800">Pacco Registrato</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>


        {/* =========================================================================
            OFFICIAL VALIDATION, SIGN-OFF LINES & QR AUTHENTICATION FOOTER
           ========================================================================= */}
        <footer className="border-t-2 border-slate-900 pt-5 mt-6 break-inside-avoid">
          <div className="dossier-footer-grid grid grid-cols-3 gap-6 items-end pb-4 border-b border-slate-200">
            
            {/* Dispatch Officer Signoff */}
            <div className="space-y-4">
              <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                Authorized Dispatcher / Carrier Agent
              </div>
              <div className="border-b border-dashed border-slate-400 h-6"></div>
              <div className="text-[9px] font-mono text-slate-500">
                Signature &amp; Stamp / Date: {new Date().toLocaleDateString()}
              </div>
            </div>

            {/* Consignee Acceptance */}
            <div className="space-y-4">
              <div className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                Consignee / Receiver Acceptance
              </div>
              <div className="border-b border-dashed border-slate-400 h-6"></div>
              <div className="text-[9px] font-mono text-slate-500">
                Name &amp; Signature / Delivery Date
              </div>
            </div>

            {/* Live QR Verification Badge */}
            <div className="flex items-center justify-end gap-3 text-right">
              <div className="space-y-0.5 font-mono text-[9px] text-slate-500">
                <div className="font-bold text-slate-900 uppercase">Official Verification QR</div>
                <div>Scan to verify live status</div>
                <div className="text-[8px] text-slate-400 truncate max-w-[150px]">{trackingNumber}</div>
              </div>
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  className="w-14 h-14 border border-slate-300 rounded p-0.5 bg-white shrink-0"
                />
              ) : (
                <div className="w-14 h-14 border border-slate-300 rounded bg-slate-100 flex items-center justify-center shrink-0 text-[8px] font-mono text-slate-400">
                  QR
                </div>
              )}
            </div>
          </div>

          {/* Legal Compliance Disclaimer */}
          <div className="pt-3 flex flex-row items-center justify-between gap-2 text-[9px] font-mono text-slate-400">
            <div>
              This official cargo manifest is issued under Standard Carrier Trading Conditions &amp; IATA/FIATA rules.
            </div>
            <div>
              Document ID: {activeBarcode} • Page 1 of 1 (Consolidated)
            </div>
          </div>
        </footer>

          </div>
        </div>
      </div>
    </div>
  );

  if (isModal && typeof document !== 'undefined') {
    return createPortal(dossierContent, document.body);
  }

  return dossierContent;
};
