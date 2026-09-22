import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { Copy, Check, Barcode as BarcodeIcon, Download, Printer } from 'lucide-react';
import { triggerBrowserPrint } from '../../utils/pdfGenerator';

interface BarcodeDisplayProps {
  value: string;
  trackingNumber: string;
  className?: string;
}

export const BarcodeDisplay: React.FC<BarcodeDisplayProps> = ({
  value,
  trackingNumber,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [copied, setCopied] = useState(false);

  const barcodeData = value || trackingNumber || 'NEXORA-SHIPMENT';

  useEffect(() => {
    if (!svgRef.current) return;
    try {
      JsBarcode(svgRef.current, barcodeData, {
        format: 'CODE128',
        lineColor: '#0f172a',
        width: 1.9,
        height: 56,
        displayValue: false,
        margin: 8,
        background: '#ffffff',
      });
    } catch (e) {
      console.warn('Barcode rendering error:', e);
    }
  }, [barcodeData]);

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingNumber || barcodeData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `BARCODE-${trackingNumber || 'SHIPMENT'}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  const handlePrint = () => {
    triggerBrowserPrint();
  };

  return (
    <div className={`bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden transition-colors ${className}`}>
      {/* Decorative ambient gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#0066FF]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        {/* Header Tag */}
        <div className="flex items-center justify-between w-full pb-3 mb-3 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2 text-xs font-mono-tech text-[#0066FF] dark:text-[#38bdf8] uppercase tracking-wider font-bold">
            <BarcodeIcon className="w-4 h-4 text-[#0066FF]" />
            <span>AUTHENTICATED CARGO IDENTIFIER</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white text-xs font-mono-tech transition-colors border border-slate-200 dark:border-white/5 cursor-pointer font-semibold"
              title="Copy ID"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'COPIED' : 'COPY'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white text-xs transition-colors border border-slate-200 dark:border-white/5 cursor-pointer"
              title="Download Barcode SVG"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white text-xs transition-colors border border-slate-200 dark:border-white/5 cursor-pointer"
              title="Print Shipment Record"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Crisp Barcode Plaque */}
        <div className="bg-white rounded-xl p-3 shadow-inner max-w-full overflow-x-auto flex justify-center border border-slate-300">
          <svg ref={svgRef} className="max-w-full h-auto" />
        </div>

        {/* Tracking ID immediately underneath */}
        <div className="mt-3">
          <div className="font-mono-tech font-extrabold text-xl sm:text-2xl md:text-3xl text-slate-950 dark:text-white tracking-widest select-all break-all">
            {trackingNumber || barcodeData}
          </div>
          <p className="text-slate-500 dark:text-gray-400 text-xs font-mono-tech mt-1 tracking-wider font-medium">
            OFFICIAL SHIPMENT &amp; AIR/OCEAN WAYBILL REFERENCE
          </p>
        </div>
      </div>
    </div>
  );
};
