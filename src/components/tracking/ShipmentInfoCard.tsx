import React from 'react';
import { Shipment } from '../../types';
import { 
  Package, 
  MapPin, 
  Truck, 
  Plane, 
  Ship, 
  CreditCard, 
  Scale, 
  Layers, 
  Barcode, 
  FileText, 
  DollarSign, 
  CheckCircle2 
} from 'lucide-react';

interface ShipmentInfoCardProps {
  shipment: Shipment;
}

export const ShipmentInfoCard: React.FC<ShipmentInfoCardProps> = ({ shipment }) => {
  const {
    origin,
    destination,
    packageType,
    carrier,
    transportMode,
    serviceLevel,
    weightKg,
    weightUnit = 'kg',
    carrierReference,
    product,
    cargoDescription,
    pieces,
    quantity,
    paymentMode,
    totalFreight,
    trackingNumber,
  } = shipment;

  const displayPackageType = packageType || (pieces > 1 ? 'MULTI-PACKAGE' : 'PARCEL / CARTON');
  const displayCarrierRef = carrierReference || trackingNumber;
  const displayProduct = product || cargoDescription || 'General Air/Ocean Freight Consignment';
  const displayQty = quantity !== undefined ? quantity : (pieces || 1);
  const displayPayment = paymentMode || 'Prepaid Corporate Account';

  const formatCurrency = (amount?: number, curr: string = 'USD') => {
    if (amount === undefined || amount === null) return 'Standard Contract Tariff';
    const symbolMap: Record<string, string> = {
      EUR: '€',
      USD: '$',
      GBP: '£',
      JPY: '¥',
      CHF: 'CHF ',
    };
    const sym = symbolMap[curr.toUpperCase()] || `${curr} `;
    return `${sym}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getModeIcon = () => {
    switch (transportMode) {
      case 'Air Freight':
      case 'Air Transport':
        return <Plane className="w-4 h-4 text-sky-400" />;
      case 'Ocean Freight':
      case 'Sea Transport':
        return <Ship className="w-4 h-4 text-sky-400" />;
      case 'Road Transport':
      case 'Land Transport':
        return <Truck className="w-4 h-4 text-sky-400" />;
      default:
        return <Package className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden transition-colors">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-6">
        <div className="flex items-center gap-2 text-slate-950 dark:text-white font-heading font-bold text-base uppercase tracking-wider">
          <FileText className="w-5 h-5 text-[#0066FF]" />
          <span>Complete Shipment Information Record</span>
        </div>
        <span className="text-[11px] font-mono-tech px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 font-bold">
          OFFICIAL LOGISTICS MANIFEST
        </span>
      </div>

      {/* Grid of Key Shipment Attributes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-mono-tech text-xs">
        {/* Origin */}
        <div className="bg-slate-50 dark:bg-[#0D1527] p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
          <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase flex items-center gap-1 font-bold">
            <MapPin className="w-3 h-3 text-emerald-500" /> Origin
          </div>
          <div className="text-slate-950 dark:text-white font-bold text-sm">
            {origin.country}
          </div>
          <div className="text-slate-700 dark:text-gray-300 text-xs">
            {origin.city} {origin.code ? `(${origin.code})` : ''}
          </div>
          {origin.facility && (
            <div className="text-slate-500 dark:text-gray-400 text-[11px] pt-1 border-t border-slate-200 dark:border-white/5 truncate">
              {origin.facility}
            </div>
          )}
        </div>

        {/* Destination */}
        <div className="bg-slate-50 dark:bg-[#0D1527] p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
          <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase flex items-center gap-1 font-bold">
            <MapPin className="w-3 h-3 text-[#FF8533]" /> Destination
          </div>
          <div className="text-slate-950 dark:text-white font-bold text-sm">
            {destination.country}
          </div>
          <div className="text-slate-700 dark:text-gray-300 text-xs">
            {destination.city} {destination.code ? `(${destination.code})` : ''}
          </div>
          {destination.facility && (
            <div className="text-slate-500 dark:text-gray-400 text-[11px] pt-1 border-t border-slate-200 dark:border-white/5 truncate">
              {destination.facility}
            </div>
          )}
        </div>

        {/* Carrier */}
        <div className="bg-slate-50 dark:bg-[#0D1527] p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
          <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase flex items-center gap-1 font-bold">
            <Truck className="w-3 h-3 text-[#0066FF] dark:text-[#38bdf8]" /> Carrier
          </div>
          <div className="text-slate-950 dark:text-white font-bold text-sm">
            {carrier || 'NEXORA Global Logistics'}
          </div>
          <div className="text-[#0066FF] dark:text-[#38bdf8] text-xs font-semibold">
            {shipment.vesselOrFlightNumber || 'Scheduled Transit Route'}
          </div>
        </div>

        {/* Type of Shipment */}
        <div className="bg-slate-50 dark:bg-[#0D1527] p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
          <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase font-bold">Type of Shipment</div>
          <div className="text-slate-950 dark:text-white font-bold text-sm">
            {serviceLevel || transportMode}
          </div>
          <div className="text-slate-500 dark:text-gray-400 text-xs">
            International Priority Handling
          </div>
        </div>

        {/* Weight */}
        <div className="bg-slate-50 dark:bg-[#0D1527] p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
          <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase flex items-center gap-1 font-bold">
            <Scale className="w-3 h-3 text-slate-400" /> Total Weight
          </div>
          <div className="text-slate-950 dark:text-white font-bold text-sm">
            {weightKg.toLocaleString()} {weightUnit}
          </div>
          <div className="text-slate-500 dark:text-gray-400 text-xs">
            Gross Verified Mass (VGM)
          </div>
        </div>

        {/* Shipment Mode */}
        <div className="bg-slate-50 dark:bg-[#0D1527] p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
          <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase flex items-center gap-1 font-bold">
            {getModeIcon()}
            <span>Shipment Mode</span>
          </div>
          <div className="text-slate-950 dark:text-white font-bold text-sm">
            {transportMode}
          </div>
          <div className="text-slate-500 dark:text-gray-400 text-xs">
            Dynamic Telemetric Route Tracking
          </div>
        </div>

        {/* Carrier Reference No. */}
        <div className="bg-slate-50 dark:bg-[#0D1527] p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
          <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase flex items-center gap-1 font-bold">
            <Barcode className="w-3 h-3 text-slate-400" /> Carrier Reference No.
          </div>
          <div className="text-[#0066FF] dark:text-[#38bdf8] font-bold text-xs truncate select-all" title={displayCarrierRef}>
            {displayCarrierRef}
          </div>
          <div className="text-slate-500 dark:text-gray-400 text-[10px]">
            Master Waybill / BOL ID
          </div>
        </div>

        {/* Package Type */}
        <div className="bg-slate-50 dark:bg-[#0D1527] p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
          <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase flex items-center gap-1 font-bold">
            <Package className="w-3 h-3 text-slate-400" /> Package Type
          </div>
          <div className="text-slate-950 dark:text-white font-bold text-sm uppercase">
            {displayPackageType}
          </div>
          <div className="text-slate-500 dark:text-gray-400 text-xs">
            Industrial Grade Protective Outer
          </div>
        </div>

        {/* Product / Cargo Description */}
        <div className="bg-slate-50 dark:bg-[#0D1527] p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
          <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase flex items-center gap-1 font-bold">
            <Layers className="w-3 h-3 text-slate-400" /> Product / Commodity
          </div>
          <div className="text-slate-950 dark:text-white font-bold text-xs truncate" title={displayProduct}>
            {displayProduct}
          </div>
          <div className="text-slate-500 dark:text-gray-400 text-[10px]">
            Sealed &amp; Documented Cargo
          </div>
        </div>

        {/* Quantity (Qty) */}
        <div className="bg-slate-50 dark:bg-[#0D1527] p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
          <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase font-bold">Quantity (Qty)</div>
          <div className="text-slate-950 dark:text-white font-bold text-sm">
            {displayQty} {displayQty === 1 ? 'Unit / Piece' : 'Units / Pieces'}
          </div>
          <div className="text-slate-500 dark:text-gray-400 text-xs">
            Itemized Manifest Count
          </div>
        </div>

        {/* Payment Mode */}
        <div className="bg-slate-50 dark:bg-[#0D1527] p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
          <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase flex items-center gap-1 font-bold">
            <CreditCard className="w-3 h-3 text-emerald-500" /> Payment Mode
          </div>
          <div className="text-slate-950 dark:text-white font-bold text-sm">
            {displayPayment}
          </div>
          <div className="text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3 h-3" /> Settled / Authorized
          </div>
        </div>

        {/* Total Freight */}
        <div className="bg-slate-50 dark:bg-[#0D1527] p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
          <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase flex items-center gap-1 font-bold">
            <DollarSign className="w-3 h-3 text-[#0066FF] dark:text-[#38bdf8]" /> Total Freight
          </div>
          <div className="text-[#0066FF] dark:text-[#38bdf8] font-bold text-base">
            {totalFreight ? formatCurrency(totalFreight.amount, totalFreight.currency) : 'Included in Service Agreement'}
          </div>
          <div className="text-slate-500 dark:text-gray-400 text-[10px]">
            All International Tariffs &amp; Fees
          </div>
        </div>
      </div>
    </div>
  );
};
