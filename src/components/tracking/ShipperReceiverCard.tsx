import React from 'react';
import { ShipperInfo, ReceiverInfo } from '../../types';
import { Building2, User, MapPin, Phone, Mail, Send, CheckCircle2 } from 'lucide-react';

interface ShipperReceiverCardProps {
  shipper?: ShipperInfo;
  receiver?: ReceiverInfo;
  defaultCustomerName?: string;
  defaultCustomerCompany?: string;
  defaultCustomerEmail?: string;
}

export const ShipperReceiverCard: React.FC<ShipperReceiverCardProps> = ({
  shipper,
  receiver,
  defaultCustomerName,
  defaultCustomerCompany,
  defaultCustomerEmail,
}) => {
  // Graceful fallbacks
  const displayShipperName = shipper?.name || defaultCustomerCompany || defaultCustomerName || 'Authorized Consignor';
  const displayShipperAddress = shipper?.address || 'Origin Logistics Hub Facility';
  const displayShipperLocation = [shipper?.city, shipper?.country].filter(Boolean).join(', ') || 'Origin Terminal';
  const displayShipperPhone = shipper?.phone || 'Not Disclosed';
  const displayShipperEmail = shipper?.email || defaultCustomerEmail || 'dispatch@logistics-network.com';

  const displayReceiverName = receiver?.name || defaultCustomerName || 'Authorized Consignee';
  const displayReceiverAddress = receiver?.address || 'Destination Receiving Hub';
  const displayReceiverLocation = [receiver?.city, receiver?.country].filter(Boolean).join(', ') || 'Destination Terminal';
  const displayReceiverPostal = receiver?.postalCode;
  const displayReceiverPhone = receiver?.phone || 'On File';
  const displayReceiverEmail = receiver?.email || defaultCustomerEmail || 'consignee@destination.com';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Shipper Card */}
      <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-lg group hover:border-slate-300 dark:hover:border-white/20 transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-mono-tech text-xs uppercase tracking-wider font-bold">
            <Send className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span>Shipper Information (Consignor)</span>
          </div>
          <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
            ORIGIN
          </span>
        </div>

        <div className="space-y-3 font-mono-tech text-xs">
          <div>
            <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase font-bold">Shipper Name / Entity</div>
            <div className="font-heading font-bold text-slate-950 dark:text-white text-base mt-0.5">
              {displayShipperName}
            </div>
          </div>

          <div>
            <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase flex items-center gap-1 font-bold">
              <MapPin className="w-3 h-3 text-slate-400" /> Address &amp; Location
            </div>
            <div className="text-slate-700 dark:text-gray-200 mt-0.5 leading-relaxed">
              {displayShipperAddress}
            </div>
            <div className="text-[#0066FF] dark:text-[#38bdf8] font-bold mt-0.5">
              {displayShipperLocation}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-white/5">
            <div>
              <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase flex items-center gap-1 font-bold">
                <Phone className="w-3 h-3 text-slate-400" /> Contact Phone
              </div>
              <div className="text-slate-800 dark:text-gray-300 mt-0.5 truncate">{displayShipperPhone}</div>
            </div>
            <div>
              <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase flex items-center gap-1 font-bold">
                <Mail className="w-3 h-3 text-slate-400" /> Contact Email
              </div>
              <div className="text-slate-800 dark:text-gray-300 mt-0.5 truncate">{displayShipperEmail}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Receiver Card */}
      <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-lg group hover:border-slate-300 dark:hover:border-white/20 transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0066FF]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-4">
          <div className="flex items-center gap-2 text-[#0066FF] dark:text-[#38bdf8] font-mono-tech text-xs uppercase tracking-wider font-bold">
            <User className="w-4 h-4 text-[#0066FF]" />
            <span>Receiver Information (Consignee)</span>
          </div>
          <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] border border-[#0066FF]/20 font-bold">
            FINAL DESTINATION
          </span>
        </div>

        <div className="space-y-3 font-mono-tech text-xs">
          <div>
            <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase font-bold">Receiver Name / Consignee</div>
            <div className="font-heading font-bold text-slate-950 dark:text-white text-base mt-0.5">
              {displayReceiverName}
            </div>
          </div>

          <div>
            <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase flex items-center gap-1 font-bold">
              <MapPin className="w-3 h-3 text-slate-400" /> Delivery Street Address
            </div>
            <div className="text-slate-700 dark:text-gray-200 mt-0.5 leading-relaxed">
              {displayReceiverAddress}
            </div>
            <div className="text-[#0066FF] dark:text-[#38bdf8] font-bold mt-0.5">
              {displayReceiverLocation} {displayReceiverPostal ? `(${displayReceiverPostal})` : ''}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-white/5">
            <div>
              <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase flex items-center gap-1 font-bold">
                <Phone className="w-3 h-3 text-slate-400" /> Receiver Phone
              </div>
              <div className="text-slate-800 dark:text-gray-300 mt-0.5 truncate">{displayReceiverPhone}</div>
            </div>
            <div>
              <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase flex items-center gap-1 font-bold">
                <Mail className="w-3 h-3 text-slate-400" /> Receiver Email
              </div>
              <div className="text-slate-800 dark:text-gray-300 mt-0.5 truncate">{displayReceiverEmail}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
