import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shipment, ShipmentStatus } from '../../types';
import { storageService } from '../../services/storageService';
import { TrackingMap } from './TrackingMap';
import { BarcodeDisplay } from './BarcodeDisplay';
import { ShipperReceiverCard } from './ShipperReceiverCard';
import { ShipmentInfoCard } from './ShipmentInfoCard';
import { DeliveryScheduleCard } from './DeliveryScheduleCard';
import { CommentsCard } from './CommentsCard';
import { PackageDetailsTable } from './PackageDetailsTable';
import { ShipmentHistoryTable } from './ShipmentHistoryTable';
import { PrintableShipmentDossier } from './PrintableShipmentDossier';
import { resolveShipmentTelemetryLocation } from '../../utils/geoUtils';
import { useToast } from '../../context/ToastContext';
import { 
  Search, 
  RefreshCw, 
  ArrowRight, 
  AlertCircle, 
  Share2, 
  Printer, 
  Check, 
  Radio, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Copy,
  FileText,
  Eye
} from 'lucide-react';

interface ShipmentTrackerProps {
  initialTrackingNumber?: string;
  onSelectShipment?: (shipment: Shipment) => void;
}

export const ShipmentTracker: React.FC<ShipmentTrackerProps> = ({
  initialTrackingNumber = '',
}) => {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState(initialTrackingNumber);
  const [currentShipment, setCurrentShipment] = useState<Shipment | null>(() => {
    if (!initialTrackingNumber.trim()) return null;
    return storageService.getShipmentByTracking(initialTrackingNumber);
  });
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(Boolean(initialTrackingNumber.trim()));
  const [shareCopied, setShareCopied] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // Synchronize when initialTrackingNumber changes externally (e.g. navigation or URL search query)
  useEffect(() => {
    if (initialTrackingNumber && initialTrackingNumber.trim()) {
      const cleanNum = initialTrackingNumber.trim();
      setSearchQuery(cleanNum);
      setHasSearched(true);
      setErrorMsg(null);

      const found = storageService.getShipmentByTracking(cleanNum);
      if (found) {
        setCurrentShipment(found);
      } else {
        setIsSearching(true);
        storageService.fetchShipmentByTrackingAsync(cleanNum).then((res) => {
          if (res) {
            setCurrentShipment(res);
          } else {
            setErrorMsg(`No consignment record found for tracking ID "${cleanNum.toUpperCase()}". Please verify the number and try again.`);
          }
          setIsSearching(false);
        });
      }
    } else {
      setSearchQuery('');
      setCurrentShipment(null);
      setHasSearched(false);
      setErrorMsg(null);
    }
  }, [initialTrackingNumber]);

  const handleSearch = async (e?: React.FormEvent, directCode?: string) => {
    if (e) e.preventDefault();
    const queryToUse = (directCode || searchQuery).trim();
    if (!queryToUse) {
      setErrorMsg('Please enter a valid tracking number, Air Waybill (AWB), or container ID.');
      return;
    }

    setIsSearching(true);
    setErrorMsg(null);
    setHasSearched(true);

    try {
      const found = await storageService.fetchShipmentByTrackingAsync(queryToUse);
      if (found) {
        setCurrentShipment(found);
      } else {
        setCurrentShipment(null);
        setErrorMsg(`No consignment record found for "${queryToUse.toUpperCase()}". Ensure the tracking number is entered correctly.`);
      }
    } catch {
      setErrorMsg(`Failed to query database for "${queryToUse.toUpperCase()}". Please try again.`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleShareLink = () => {
    if (!currentShipment) return;
    const url = `${window.location.origin}/tracking?number=${encodeURIComponent(currentShipment.trackingNumber)}`;
    navigator.clipboard.writeText(url);
    setShareCopied(true);
    toast.info(`Direct tracking link copied for #${currentShipment.trackingNumber}.`, 'Link Copied');
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleTriggerPrint = () => {
    setShowPrintPreview(true);
  };

  return (
    <div className="w-full space-y-8">
      {/* Search Bar HUD (Hidden in Print Mode) */}
      <div className="print:hidden bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0066FF]/10 rounded-full blur-3xl pointer-events-none" />

        <form onSubmit={(e) => handleSearch(e)} className="relative z-10">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value.toUpperCase());
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="ENTER CONSIGNMENT / B/L / AIR WAYBILL NUMBER (E.G. NX-4829-2026)"
                className="w-full bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/15 focus:border-[#0066FF] rounded-xl pl-12 pr-4 py-4 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 font-mono-tech text-xs sm:text-sm tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-[#0066FF]/30 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              data-cursor="TRACK"
              className="px-8 py-4 bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0066FF]/25 disabled:opacity-50 active:scale-[0.98] shrink-0 text-sm cursor-pointer"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  QUERYING SATELLITE...
                </>
              ) : (
                <>
                  TRACK SHIPMENT
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs sm:text-sm flex items-center gap-3 font-mono-tech"
          >
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </div>

      {/* When no shipment is searched yet */}
      {!currentShipment && !isSearching && !errorMsg && !hasSearched && (
        <div className="print:hidden bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-8 sm:p-12 text-center shadow-lg transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] flex items-center justify-center mx-auto mb-4 border border-[#0066FF]/20">
            <Radio className="w-8 h-8 animate-pulse" />
          </div>
          <h3 className="font-heading font-black text-xl sm:text-2xl text-slate-950 dark:text-white uppercase tracking-tight">
            Ready to Track Consignment
          </h3>
          <p className="mt-2 text-slate-600 dark:text-gray-400 text-xs sm:text-sm max-w-md mx-auto font-light">
            Enter your real tracking number, Bill of Lading (B/L), or Container ID above to retrieve live GPS telemetry, milestone histories, and customs clearances.
          </p>
        </div>
      )}

      {/* Shipment Results Flow */}
      {currentShipment && (
        <>
          {/* Dedicated Print Version: Rendered during Ctrl+P or window.print() */}
          <div className="hidden print:block">
            <PrintableShipmentDossier shipment={currentShipment} />
          </div>

          {/* Interactive Screen Layout (Hidden during print) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="print:hidden space-y-6"
          >
            {/* Quick Utility Actions Toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-3 px-2 text-xs font-mono-tech">
              <div className="flex items-center gap-2 text-slate-600 dark:text-gray-400">
                <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                <span>LOGISTICS TELEMETRY SYNCED • LAST REFRESH: {currentShipment.lastUpdated}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShareLink}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#070D1D] hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer font-medium shadow-sm"
                  title="Share Tracking Link"
                >
                  {shareCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{shareCopied ? 'LINK COPIED' : 'SHARE TRACKING'}</span>
                </button>
                <button
                  onClick={() => setShowPrintPreview(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#070D1D] hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer font-medium shadow-sm"
                  title="Preview Official Printable Dossier"
                >
                  <Eye className="w-3.5 h-3.5 text-[#0066FF]" />
                  <span>PREVIEW DOSSIER</span>
                </button>
                <button
                  onClick={handleTriggerPrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0066FF] hover:bg-[#0052cc] text-white transition-colors cursor-pointer font-bold shadow-sm"
                  title="Print Full Official Consignment Dossier / PDF"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>PRINT RECORD</span>
                </button>
              </div>
            </div>

            {/* 1. TOP OF TRACKING RESULT — BARCODE + SHIPMENT ID */}
            <BarcodeDisplay
              value={currentShipment.barcodeValue || currentShipment.trackingNumber}
              trackingNumber={currentShipment.trackingNumber}
            />

            {/* 2. OPERATIONAL TIMELINE, SCHEDULE & STATUS BADGE */}
            <DeliveryScheduleCard shipment={currentShipment} />

            {/* 3. SHIPPER & RECEIVER INFORMATION */}
            <ShipperReceiverCard
              shipper={currentShipment.shipper}
              receiver={currentShipment.receiver}
              defaultCustomerName={currentShipment.customerName}
              defaultCustomerCompany={currentShipment.customerCompany}
              defaultCustomerEmail={currentShipment.customerEmail}
            />

            {/* 4. COMPLETE SHIPMENT INFORMATION SECTION */}
            <ShipmentInfoCard shipment={currentShipment} />

            {/* 5. COMMENTS / SHIPMENT NOTES */}
            <CommentsCard comments={currentShipment.comments} />

            {/* 6. PACKAGE DETAILS & PACKAGE DIMENSION SUMMARY */}
            <PackageDetailsTable
              packages={currentShipment.packages}
              totals={currentShipment.totals}
              defaultWeightKg={currentShipment.weightKg}
              defaultVolumeCbm={currentShipment.volumeCbm}
              defaultCargoDesc={currentShipment.cargoDescription || currentShipment.product}
              defaultPieces={currentShipment.pieces || currentShipment.quantity}
              defaultPackageType={currentShipment.packageType}
            />

            {/* 7. SHIPMENT LOCATION / INTERACTIVE ROUTE MAP */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg text-slate-950 dark:text-white uppercase flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0066FF] animate-pulse" />
                  <span>Consignment Location &amp; Satellite Route Observability</span>
                </h3>
                <span className="text-xs font-mono-tech text-slate-500 dark:text-gray-400">
                  {resolveShipmentTelemetryLocation(currentShipment).current.locationName}
                </span>
              </div>
              <TrackingMap shipment={currentShipment} height="460px" />
            </div>

            {/* 8. SHIPMENT HISTORY & AUDIT LOG */}
            <ShipmentHistoryTable events={currentShipment.events} />
          </motion.div>

          {/* On-Screen Print Preview Modal */}
          {showPrintPreview && (
            <PrintableShipmentDossier
              shipment={currentShipment}
              isModal={true}
              onClose={() => setShowPrintPreview(false)}
            />
          )}
        </>
      )}
    </div>
  );
};
