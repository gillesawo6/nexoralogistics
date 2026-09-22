import React from 'react';
import { MapPin, Globe2, Phone, Mail, Clock, Building2, ShieldCheck } from 'lucide-react';
import { updatePageSeo } from '../../services/seoService';

const GLOBAL_OFFICES = [
  {
    id: 'loc-01',
    city: 'Rotterdam',
    label: 'Global Maritime & Intermodal HQ',
    country: 'Netherlands',
    region: 'Europe',
    code: 'RTM-HQ',
    address: 'Wilhelminakade 902, 3072 AP Rotterdam',
    facilityName: 'NEXORA Deepwater Terminal & Automated High-Bay Hub',
    phone: '+31 10 892 4000',
    email: 'rotterdam.ops@nexoralogistics.com',
    hours: '24/7 Deepwater Command',
    type: 'Global Corporate HQ',
    lat: 51.9054,
    lng: 4.4925,
  },
  {
    id: 'loc-02',
    city: 'Singapore',
    label: 'Asia-Pacific Supergateway',
    country: 'Singapore',
    region: 'Asia-Pacific',
    code: 'SIN-AIR',
    address: '10 Changi Coast Road, ALPS Logistics Park',
    facilityName: 'Changi Airport Bonded Free Trade Airfreight Hub',
    phone: '+65 6789 2100',
    email: 'singapore.ops@nexoralogistics.com',
    hours: '24/7 Air Freight Control Tower',
    type: 'Regional Air Gateway',
    lat: 1.3644,
    lng: 103.9915,
  },
  {
    id: 'loc-03',
    city: 'Chicago',
    label: 'Americas Intermodal Superhub',
    country: 'United States',
    region: 'North America',
    code: 'ORD-CHI',
    address: '400 S Wacker Dr & O\'Hare Cargo Sector 4, Chicago, IL',
    facilityName: 'O\'Hare Logistics Central & BNSF Class-1 Rail Yard',
    phone: '+1 312 555 0199',
    email: 'americas.ops@nexoralogistics.com',
    hours: '24/7 Rail & Overland Intermodal',
    type: 'Continental Superhub',
    lat: 41.8781,
    lng: -87.6298,
  },
  {
    id: 'loc-04',
    city: 'Dubai',
    label: 'Middle East & Africa Crossroads',
    country: 'United Arab Emirates',
    region: 'Middle East',
    code: 'DXB-DWC',
    address: 'Dubai South Aviation City, Jebel Ali Free Zone',
    facilityName: 'Al Maktoum International Logistics Corridor',
    phone: '+971 4 800 6396',
    email: 'dubai.ops@nexoralogistics.com',
    hours: '24/7 Multimodal Free Zone Hub',
    type: 'Crossroads Hub',
    lat: 25.2048,
    lng: 55.2708,
  },
  {
    id: 'loc-05',
    city: 'Tokyo',
    label: 'East Asia Tech & Cold-Chain Gateway',
    country: 'Japan',
    region: 'Asia',
    code: 'HND-TYO',
    address: 'Narita & Haneda Air Cargo Center, Ota-ku, Tokyo',
    facilityName: 'Haneda Precision Electronics & Pharma Logistics Center',
    phone: '+81 3 5555 0142',
    email: 'tokyo.ops@nexoralogistics.com',
    hours: '24/7 High-Tech Dispatch',
    type: 'High-Tech Cargo Hub',
    lat: 35.5494,
    lng: 139.7798,
  },
  {
    id: 'loc-06',
    city: 'Frankfurt',
    label: 'Central European Airfreight Core',
    country: 'Germany',
    region: 'Europe',
    code: 'FRA-HUB',
    address: 'CargoCity Süd, Frankfurt Airport (FRA), Germany',
    facilityName: 'IATA CEIV Certified Cold-Chain Pharma Station',
    phone: '+49 69 900 1200',
    email: 'frankfurt.ops@nexoralogistics.com',
    hours: '24/7 Pharma Gateway',
    type: 'Pharma & Air Hub',
    lat: 50.0379,
    lng: 8.5622,
  },
];

export const LocationsAdminPage: React.FC = () => {
  React.useEffect(() => {
    updatePageSeo({
      title: 'Global Logistics Hubs | NEXORA Admin',
      description: 'Directory of 320+ international air, maritime, and bonded distribution facilities.',
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-950 dark:text-white uppercase tracking-tight">
            Global Network Nodes &amp; Hubs
          </h1>
          <p className="text-slate-600 dark:text-gray-400 text-xs font-mono-tech mt-1">
            Certified bonded terminals, air gateways, and regional control towers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono-tech text-xs">
        {GLOBAL_OFFICES.map((loc) => (
          <div
            key={loc.id}
            className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#0066FF]" />
                  <span className="font-heading font-black text-lg text-slate-950 dark:text-white uppercase">
                    {loc.city}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 text-slate-500 font-bold">
                  {loc.code}
                </span>
              </div>

              <div className="text-[#0066FF] dark:text-[#38bdf8] font-bold">
                {loc.label}
              </div>

              <div className="text-slate-500 dark:text-gray-400 text-[11px]">
                {loc.facilityName}
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Globe2 className="w-3.5 h-3.5 text-[#0066FF]" />
                  <span>{loc.country} ({loc.region})</span>
                </div>
                {loc.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{loc.phone}</span>
                  </div>
                )}
                {loc.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-purple-500" />
                    <span>{loc.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{loc.hours}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400 uppercase">
              <span>{loc.type}</span>
              <span>{loc.lat.toFixed(2)}°N, {loc.lng.toFixed(2)}°E</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
