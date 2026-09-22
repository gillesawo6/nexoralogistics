import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import { QuoteRequest } from '../../types';
import { storageService } from '../../services/storageService';
import { exportElementToPdf, triggerBrowserPrint } from '../../utils/pdfGenerator';
import { 
  Printer, 
  X, 
  Download,
  Loader2,
  ShieldCheck, 
  Calendar, 
  Globe, 
  Mail, 
  Phone, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Plane,
  Ship,
  Truck,
  Network,
  QrCode
} from 'lucide-react';

interface PrintableQuoteDossierProps {
  quote: QuoteRequest;
  onClose?: () => void;
  isModal?: boolean;
}

export const PrintableQuoteDossier: React.FC<PrintableQuoteDossierProps> = ({
  quote,
  onClose,
  isModal = false,
}) => {
  const documentRef = useRef<HTMLDivElement>(null);
  const barcodeRef = useRef<SVGSVGElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const companyInfo = storageService.getCompanyInfo();
  const ref = quote.referenceNumber || quote.id.toUpperCase();
  const currency = quote.pricing?.currency || 'USD';
  const totalAmount = quote.pricing?.totalAmount ?? quote.estimatedCostUsd ?? 0;
  const lineItems = quote.pricing?.lineItems || [
    {
      id: 'default-line',
      category: 'freight' as const,
      description: `${quote.service} Standard Spot Allocation (${quote.originCity} → ${quote.destCity})`,
      amount: totalAmount,
    },
  ];

  const subtotal = quote.pricing?.subtotal ?? (totalAmount - (quote.pricing?.taxTotal || 0) + (quote.pricing?.discountTotal || 0));
  const discountTotal = quote.pricing?.discountTotal || 0;
  const taxTotal = quote.pricing?.taxTotal || 0;
  const validUntil = quote.validUntil || quote.pricing?.validUntil || '14 Days From Issuance';
  const transitDays = quote.pricing?.transitTimeDays || quote.estimatedTransitDays || 3;

  // Render Barcode
  useEffect(() => {
    if (!barcodeRef.current) return;
    try {
      JsBarcode(barcodeRef.current, ref, {
        format: 'CODE128',
        lineColor: '#000000',
        width: 1.6,
        height: 44,
        displayValue: false,
        margin: 2,
        background: '#ffffff',
      });
    } catch (err) {
      console.warn('Quote barcode render error:', err);
    }
  }, [ref]);

  const handleDownloadPdf = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportSuccess(false);

    const fileName = `NEXORA-Quote-${ref}.pdf`;
    const success = await exportElementToPdf({
      element: documentRef.current,
      elementId: 'official-quote-dossier',
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
      // In sandboxed iframes where window.print() is blocked, fallback to PDF download
      handleDownloadPdf();
    }
  };

  const getServiceIcon = (mode: string) => {
    switch (mode) {
      case 'Air Freight':
        return <Plane className="w-4 h-4 text-[#0066FF]" />;
      case 'Ocean Freight':
        return <Ship className="w-4 h-4 text-[#0066FF]" />;
      case 'Road Transport':
        return <Truck className="w-4 h-4 text-[#0066FF]" />;
      default:
        return <Network className="w-4 h-4 text-[#0066FF]" />;
    }
  };

  const publicQuoteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/quote/${encodeURIComponent(ref)}`
    : `https://nexoralogistics.com/quote/${encodeURIComponent(ref)}`;

  // Local QR Code Generator (no external network dependency)
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(publicQuoteUrl, {
      width: 160,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.warn('Quote QR Code generation error:', err));
  }, [publicQuoteUrl]);

  const dossierContent = (
    <div
      className={`print-quote-wrapper ${
        isModal
          ? 'fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm overflow-y-auto flex items-start justify-center p-2 sm:p-6'
          : 'w-full'
      }`}
    >
      {/* Floating Toolbar (Hidden when printing) */}
      {isModal && (
        <div className="fixed top-4 right-4 z-[10000] flex items-center gap-2 print:hidden bg-slate-900/95 backdrop-blur border border-white/20 p-2 rounded-2xl shadow-2xl">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className={`flex items-center gap-2 px-4 py-2 text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer ${
              exportSuccess 
                ? 'bg-emerald-600 shadow-emerald-600/30' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/30'
            }`}
            title="Generate & Download PDF File"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : exportSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>PDF Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#0066FF]/30 cursor-pointer"
            title="Open Browser Print Dialog"
          >
            <Printer className="w-4 h-4" />
            <span>Print Dossier</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
              title="Close Dossier"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Main Printable Document Container */}
      <div
        ref={documentRef}
        id="official-quote-dossier"
        className="printable-quote-document w-full max-w-4xl bg-white text-slate-900 p-8 sm:p-12 shadow-2xl rounded-2xl my-4 sm:my-8 border border-slate-200 print:border-none print:shadow-none print:m-0 print:p-6 print:w-full print:max-w-none text-xs font-sans relative"
        style={{ colorScheme: 'light' }}
      >
        {/* Top Header Bar */}
        <header className="border-b-2 border-slate-900 pb-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            {/* Company Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#0066FF] text-white flex items-center justify-center font-heading font-black text-lg shadow-sm">
                  NX
                </div>
                <div>
                  <div className="font-heading font-black text-xl tracking-tight text-slate-950 uppercase leading-none">
                    {companyInfo.companyName}
                  </div>
                  <div className="font-mono text-[10px] text-[#0066FF] font-bold tracking-widest uppercase mt-0.5">
                    GLOBAL FREIGHT &amp; SUPPLY CHAIN NETWORK
                  </div>
                </div>
              </div>
              <div className="text-[10px] font-mono text-slate-600 space-y-0.5 pt-1">
                <div>HQ: {companyInfo.hqAddress}</div>
                <div>Licensing: IATA CASS #849204 • FIATA FMC-OTI Reg. #024881</div>
                <div>Direct: {companyInfo.primaryPhone} • Email: {companyInfo.quotesEmail || companyInfo.primaryEmail}</div>
              </div>
            </div>

            {/* Document Reference Block with Barcode */}
            <div className="flex flex-col items-end text-right space-y-1 sm:min-w-[260px]">
              <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded font-mono text-[10px] uppercase font-bold tracking-widest mb-1">
                OFFICIAL RATE QUOTATION
              </div>
              <div className="border border-slate-300 rounded p-1.5 bg-slate-50 flex flex-col items-center">
                <svg ref={barcodeRef} className="max-w-[220px] h-10" />
                <span className="font-mono text-xs font-black text-slate-950 tracking-wider mt-0.5">
                  #{ref}
                </span>
              </div>
              <div className="font-mono text-[10px] text-slate-600 pt-1">
                <span>ISSUED: </span>
                <span className="font-bold text-slate-900">
                  {quote.sentAt ? new Date(quote.sentAt).toLocaleDateString() : new Date(quote.createdAt).toLocaleDateString()}
                </span>
                <span className="mx-1.5">•</span>
                <span className="text-rose-600 font-bold">VALID UNTIL: {validUntil}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Customer & Route Master Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-200">
          {/* Client Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
            <div className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#0066FF]" />
              <span>CLIENT ACCOUNT &amp; CONTACT SPECIFICATION</span>
            </div>
            <div className="space-y-1 text-slate-800">
              <div className="font-bold text-sm text-slate-950 uppercase">{quote.fullName}</div>
              <div className="font-semibold text-slate-700">{quote.companyName || 'Enterprise Account'}</div>
              <div className="font-mono text-[11px] text-slate-600">Email: {quote.email}</div>
              <div className="font-mono text-[11px] text-slate-600">Phone: {quote.phone || 'N/A'}</div>
            </div>
          </div>

          {/* Service & Corridor Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
            <div className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              {getServiceIcon(quote.service)}
              <span>ROUTING CORRIDOR &amp; LOGISTICS PARAMETERS</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-800 font-mono text-[11px]">
              <div>
                <span className="text-slate-400 block text-[9px]">ORIGIN:</span>
                <span className="font-bold text-slate-900">{quote.originCity}, {quote.originCountry}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px]">DESTINATION:</span>
                <span className="font-bold text-slate-900">{quote.destCity}, {quote.destCountry}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px]">FREIGHT MODALITY:</span>
                <span className="font-bold text-[#0066FF]">{quote.service}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[9px]">EST. TRANSIT TIME:</span>
                <span className="font-bold text-emerald-600">{transitDays} Business Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cargo Specification Summary */}
        <div className="py-4 border-b border-slate-200">
          <div className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            CONSIGNMENT SPECIFICATION &amp; DIMENSIONAL ANALYSIS
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-slate-200 font-mono text-[11px]">
            <div>
              <span className="text-slate-400 text-[9px] block">COMMODITY:</span>
              <strong className="text-slate-900 truncate block">{quote.cargoType || 'Industrial Cargo'}</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[9px] block">GROSS WEIGHT:</span>
              <strong className="text-slate-900">{quote.weightKg.toLocaleString()} KG</strong>
            </div>
            <div>
              <span className="text-slate-400 text-[9px] block">DIMENSIONS / VOLUME:</span>
              <strong className="text-slate-900">
                {quote.dimensions?.lengthCm || 0}x{quote.dimensions?.widthCm || 0}x{quote.dimensions?.heightCm || 0} cm
                {quote.volumeCbm ? ` (${quote.volumeCbm.toFixed(2)} CBM)` : ''}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 text-[9px] block">PACKAGE TYPE / PIECES:</span>
              <strong className="text-slate-900">{quote.pieces || 1}x {quote.packageType || 'Pallet / Carton'}</strong>
            </div>
          </div>

          {/* Special requirements badges */}
          {quote.specialRequirements && quote.specialRequirements.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="font-mono text-[9px] text-slate-400 uppercase">Special Compliance:</span>
              {quote.specialRequirements.map((req, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-[#0066FF] font-mono text-[9px] rounded font-semibold"
                >
                  {req}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Itemized Pricing Breakdown Table */}
        <div className="py-6 border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="font-mono text-[11px] font-bold text-slate-950 uppercase tracking-wider">
              ITEMIZED CHARGES &amp; TARIFF BREAKDOWN
            </div>
            <div className="font-mono text-[10px] text-slate-500 uppercase">
              CURRENCY: <strong className="text-slate-900">{currency}</strong>
            </div>
          </div>

          <table className="w-full border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] uppercase tracking-wider">
                <th className="py-2.5 px-3 text-left w-16">Item #</th>
                <th className="py-2.5 px-3 text-left">Charge Description &amp; Category</th>
                <th className="py-2.5 px-3 text-left w-28">Category</th>
                <th className="py-2.5 px-3 text-right w-36">Amount ({currency})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {lineItems.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 text-slate-400 font-bold">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 uppercase">
                    {item.description}
                  </td>
                  <td className="py-2.5 px-3 uppercase text-[10px] text-slate-500">
                    <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 font-bold">
                      {item.category}
                    </span>
                  </td>
                  <td
                    className={`py-2.5 px-3 text-right font-bold font-mono ${
                      item.amount < 0 ? 'text-emerald-600' : 'text-slate-950'
                    }`}
                  >
                    {item.amount < 0 ? '-' : ''}
                    {currency}{' '}
                    {Math.abs(item.amount).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pricing Totals Box */}
          <div className="flex justify-end pt-4">
            <div className="w-full sm:w-80 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                <span>SUBTOTAL:</span>
                <span className="font-bold text-slate-900">
                  {currency} {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-600">
                  <span>DISCOUNT APPLIED:</span>
                  <span className="font-bold">
                    -{currency} {discountTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              {taxTotal > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span>DUTIES &amp; REGULATORY TAXES:</span>
                  <span className="font-bold text-slate-900">
                    +{currency} {taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-2.5 px-3 bg-slate-950 text-white rounded-lg text-sm font-bold mt-2">
                <span className="uppercase tracking-wider">TOTAL BINDING QUOTE:</span>
                <span className="text-[#38bdf8] font-black text-base">
                  {currency} {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Notes & Payment Terms */}
        <div className="py-4 border-b border-slate-200 font-mono text-[10px] text-slate-600 space-y-2">
          {quote.pricing?.pricingNotes && (
            <div>
              <strong className="text-slate-900 uppercase">Pricing Desk Notes: </strong>
              <span>{quote.pricing.pricingNotes}</span>
            </div>
          )}
          <div>
            <strong className="text-slate-900 uppercase">Payment Terms: </strong>
            <span>{quote.pricing?.paymentTerms || 'Net 30 Days on Approved Credit / Pre-Departure Settlement'}</span>
          </div>
          <div>
            <strong className="text-slate-900 uppercase">Standard Conditions: </strong>
            <span>
              Subject to space availability, bunker &amp; currency adjustment factors, and standard IATA/FIATA cargo trading terms. Quote valid until {validUntil}.
            </span>
          </div>
        </div>

        {/* Official Sign-off & Acceptance Footer */}
        <footer className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end pb-4 border-b border-slate-200">
            {/* Carrier Signature */}
            <div className="space-y-4 font-mono text-[10px]">
              <div className="text-slate-500 font-bold uppercase">Authorized Carrier Underwriter</div>
              <div className="border-b border-dashed border-slate-400 h-8 flex items-end">
                <span className="font-script text-base text-[#0066FF] font-bold">NEXORA Operations Lead</span>
              </div>
              <div className="text-slate-400">Date: {new Date().toLocaleDateString()} • Dispatch Hub</div>
            </div>

            {/* Customer Sign-off Block */}
            <div className="space-y-4 font-mono text-[10px]">
              <div className="text-slate-500 font-bold uppercase">Customer Sign-off / Acceptance</div>
              <div className="border-b border-dashed border-slate-400 h-8 flex items-end">
                {quote.status === 'Accepted' ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ACCEPTED BY {quote.acceptedByName?.toUpperCase() || quote.fullName.toUpperCase()} ({new Date(quote.acceptedAt || Date.now()).toLocaleDateString()})
                  </span>
                ) : (
                  <span className="text-slate-400 italic">Signature &amp; Corporate Stamp</span>
                )}
              </div>
              <div className="text-slate-400">Authorized Name &amp; PO Reference</div>
            </div>

            {/* Live QR Verification Badge */}
            <div className="flex items-center justify-end gap-3 text-right">
              <div className="space-y-0.5 font-mono text-[9px] text-slate-500">
                <div className="font-bold text-slate-900 uppercase">Live Quote Portal</div>
                <div>Scan to view / accept online</div>
                <div className="text-[8px] text-slate-400 truncate max-w-[130px]">#{ref}</div>
              </div>
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Quote Verification QR"
                  className="w-14 h-14 border border-slate-300 rounded p-0.5 bg-white shrink-0"
                />
              ) : (
                <div className="w-14 h-14 border border-slate-300 rounded bg-slate-100 flex items-center justify-center shrink-0 text-[8px] font-mono text-slate-400">
                  QR
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-[9px] font-mono text-slate-400 gap-2">
            <div>Document Ref: {ref} • NEXORA Official Freight Quotation • Generated electronically</div>
            <div>Confidential &amp; Proprietary • IATA/FIATA Standard • Page 1 of 1</div>
          </div>
        </footer>
      </div>
    </div>
  );

  if (isModal && typeof document !== 'undefined') {
    return createPortal(dossierContent, document.body);
  }

  return dossierContent;
};
