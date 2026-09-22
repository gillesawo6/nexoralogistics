import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SectionHeading } from '../ui/SectionHeading';
import { Anchor, Plane, Building2, Shield, Radio, Sparkles, Navigation2, Zap, ArrowRight, Globe } from 'lucide-react';

interface NetworkNode {
  id: string;
  name: string;
  type: 'superhub' | 'seaport' | 'airport' | 'coldchain';
  country: string;
  x: number; // percentage on SVG (0 - 100)
  y: number; // percentage on SVG (0 - 100)
  stats: string;
  code: string;
}

interface TradeCorridor {
  id: string;
  from: string;
  to: string;
  fromCode: string;
  toCode: string;
  path: string;
  mode: string;
  speed: string;
  transitTime: string;
  cargoType: string;
  color: string;
  glowColor: string;
  dur: number; // seconds for single run
  delay?: number;
}

export const GlobalNetworkMap: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'superhub' | 'seaport' | 'airport' | 'coldchain'>('all');
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [selectedCorridor, setSelectedCorridor] = useState<TradeCorridor | null>(null);

  const nodes: NetworkNode[] = [
    { id: 'n1', code: 'RTM', name: 'Rotterdam Europort HQ', type: 'superhub', country: 'Netherlands', x: 49.5, y: 29.5, stats: '140,000 m² Automated High-Bay' },
    { id: 'n2', code: 'SHA', name: 'Shanghai Deepwater Port', type: 'seaport', country: 'China', x: 80.5, y: 43.5, stats: 'Annual 120,000 TEU Throughput' },
    { id: 'n3', code: 'DXB', name: 'Dubai Jebel Ali Gateway', type: 'superhub', country: 'UAE', x: 63.5, y: 42.5, stats: 'Multimodal Sea-Air Crossdock' },
    { id: 'n4', code: 'SIN', name: 'Singapore Changi Air Hub', type: 'airport', country: 'Singapore', x: 77.5, y: 56.5, stats: '24/7 Dedicated Jet Charters' },
    { id: 'n5', code: 'ORD', name: 'Chicago Logistics Superhub', type: 'superhub', country: 'USA', x: 23.5, y: 34.5, stats: 'Continental Rail & Road Intermodal' },
    { id: 'n6', code: 'LOS', name: 'Lagos Lekki Deep Sea Port', type: 'seaport', country: 'Nigeria', x: 48.0, y: 53.5, stats: 'West Africa Transit Terminal' },
    { id: 'n7', code: 'FRA', name: 'Frankfurt CEIV Cold Vault', type: 'coldchain', country: 'Germany', x: 51.0, y: 31.0, stats: '-80°C Cryogenic Pharma Center' },
    { id: 'n8', code: 'HND', name: 'Tokyo Haneda Smart Terminal', type: 'airport', country: 'Japan', x: 86.5, y: 38.5, stats: 'Sub-4hr Semiconductor Clearance' },
    { id: 'n9', code: 'SSZ', name: 'Santos Maritime Terminal', type: 'seaport', country: 'Brazil', x: 35.5, y: 71.0, stats: 'South America Agrifood Gateway' },
    { id: 'n10', code: 'SYD', name: 'Sydney Pacific Hub', type: 'airport', country: 'Australia', x: 89.0, y: 77.0, stats: 'Oceania Express Cargo Hub' },
  ];

  const tradeCorridors: TradeCorridor[] = [
    { 
      id: 'c1', 
      from: 'Shanghai', 
      to: 'Dubai', 
      fromCode: 'SHA', 
      toCode: 'DXB', 
      path: 'M 80.5 43.5 Q 72 37 63.5 42.5', 
      mode: 'Ocean / Air Multimodal',
      speed: '19.8 KTS (Sea) / 480 KTS (Air)',
      transitTime: '4.2 Days (Sea-Air)',
      cargoType: 'Consumer Electronics & Solar Arrays',
      color: '#38bdf8',
      glowColor: '#0284c7',
      dur: 4.5,
      delay: 0
    },
    { 
      id: 'c2', 
      from: 'Dubai', 
      to: 'Rotterdam', 
      fromCode: 'DXB', 
      toCode: 'RTM', 
      path: 'M 63.5 42.5 Q 56 31 49.5 29.5', 
      mode: 'Ocean Deep-Sea Express',
      speed: '21.4 KTS Maritime Corridor',
      transitTime: '8.5 Days Suez Express',
      cargoType: 'High-Value Industrial Machinery',
      color: '#0066FF',
      glowColor: '#3b82f6',
      dur: 4.0,
      delay: 0.5
    },
    { 
      id: 'c3', 
      from: 'Rotterdam', 
      to: 'Lagos', 
      fromCode: 'RTM', 
      toCode: 'LOS', 
      path: 'M 49.5 29.5 Q 44.5 41 48.0 53.5', 
      mode: 'Atlantic Maritime Direct',
      speed: '18.2 KTS Atlantic Line',
      transitTime: '6.0 Days Direct Berth',
      cargoType: 'Pharmaceuticals & Automotive Parts',
      color: '#10b981',
      glowColor: '#059669',
      dur: 4.8,
      delay: 1.0
    },
    { 
      id: 'c4', 
      from: 'Rotterdam', 
      to: 'Chicago', 
      fromCode: 'RTM', 
      toCode: 'ORD', 
      path: 'M 49.5 29.5 Q 36 19 23.5 34.5', 
      mode: 'Transatlantic Air/Intermodal',
      speed: '510 KTS Airfreight / Class-1 Rail',
      transitTime: '24-36h Expedited Gate',
      cargoType: 'Cold-Chain Biologics & Aerospace',
      color: '#38bdf8',
      glowColor: '#0066FF',
      dur: 5.2,
      delay: 0.2
    },
    { 
      id: 'c5', 
      from: 'Chicago', 
      to: 'Santos', 
      fromCode: 'ORD', 
      toCode: 'SSZ', 
      path: 'M 23.5 34.5 Q 26 54 35.5 71.0', 
      mode: 'Americas Overland & Ocean',
      speed: 'Class-1 Rail to Gulf Marine',
      transitTime: '5.4 Days Coordinated Intermodal',
      cargoType: 'Precision Agtech & Specialty Chemicals',
      color: '#f59e0b',
      glowColor: '#d97706',
      dur: 5.0,
      delay: 1.2
    },
    { 
      id: 'c6', 
      from: 'Singapore', 
      to: 'Sydney', 
      fromCode: 'SIN', 
      toCode: 'SYD', 
      path: 'M 77.5 56.5 Q 84 66 89.0 77.0', 
      mode: 'Pacific Express Corridor',
      speed: '525 KTS Direct Air Cargo',
      transitTime: '7.8h Dedicated Jet Charter',
      cargoType: 'Semiconductors & Luxury Retail',
      color: '#a855f7',
      glowColor: '#9333ea',
      dur: 4.2,
      delay: 0.8
    },
    { 
      id: 'c7', 
      from: 'Frankfurt', 
      to: 'Tokyo', 
      fromCode: 'FRA', 
      toCode: 'HND', 
      path: 'M 51.0 31.0 Q 68 17 86.5 38.5', 
      mode: 'Trans-Eurasia Air Priority',
      speed: '530 KTS Polar Route Airlift',
      transitTime: '11.5h Temperature-Controlled',
      cargoType: 'Cryo Vaccines & Optical Sensors',
      color: '#06b6d4',
      glowColor: '#0891b2',
      dur: 5.5,
      delay: 0.4
    },
  ];

  // Continuous Trans-Continental Grand Route spanning Asia -> Middle East -> Europe -> North America -> South America
  const grandTranscontinentalRoute = 'M 80.5 43.5 Q 72 37 63.5 42.5 Q 56 31 49.5 29.5 Q 36 19 23.5 34.5 Q 26 54 35.5 71.0';

  const filteredNodes = nodes.filter((n) => activeFilter === 'all' || n.type === activeFilter);

  return (
    <section className="relative py-24 sm:py-32 bg-white dark:bg-[#030712] text-slate-900 dark:text-white overflow-hidden transition-colors duration-200 border-t border-slate-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <SectionHeading
            eyebrow="GLOBAL CONNECTIVITY INFRASTRUCTURE"
            title={
              <>
                INTERCONNECTED <br />
                <span className="text-[#0066FF] dark:text-[#38bdf8]">WORLD TRADE NETWORK</span>
              </>
            }
            subtitle="Real-time synchronized freight conduits. Watch live cargo packets and multi-modal shipments transit seamlessly between 320+ international ports, air hubs, and bonded terminals."
          />

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Gateways' },
              { id: 'superhub', label: 'Superhubs' },
              { id: 'seaport', label: 'Deepwater Ports' },
              { id: 'airport', label: 'Air Charters' },
              { id: 'coldchain', label: 'Pharma Cold Chain' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`font-mono-tech text-xs px-3.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  activeFilter === tab.id
                    ? 'bg-[#0066FF] border-[#0066FF] text-white shadow-lg shadow-[#0066FF]/30 font-bold'
                    : 'bg-slate-100 dark:bg-[#070D1D] border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive World Map Canvas Container */}
        <div className="relative w-full rounded-3xl bg-slate-50 dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 p-4 sm:p-8 shadow-xl dark:shadow-2xl overflow-hidden">
          {/* Subtle Grid overlay */}
          <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

          {/* Active Corridor Telemetry Status Bar */}
          <div className="relative z-10 mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4 text-xs font-mono-tech text-slate-600 dark:text-gray-400">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-slate-900 dark:text-white font-bold tracking-wider uppercase">
                LIVE MOVING DISPATCHES:
              </span>
              <span className="text-slate-700 dark:text-gray-300 font-semibold">
                SHA <span className="text-[#38bdf8]">→</span> DXB <span className="text-[#38bdf8]">→</span> RTM <span className="text-[#38bdf8]">→</span> ORD <span className="text-[#38bdf8]">→</span> SSZ
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-[#0066FF] dark:text-[#38bdf8] font-bold">
                <Radio className="w-3.5 h-3.5 animate-pulse" /> 320+ ONLINE NODES
              </span>
              <span>•</span>
              <span className="text-emerald-500 font-bold">99.98% TELEMETRY LOCK</span>
            </div>
          </div>

          {/* SVG Map Projection */}
          <div className="relative w-full aspect-[16/9] min-h-[380px] max-h-[640px] bg-[#0A1124] dark:bg-[#040814] rounded-2xl border border-slate-700/30 dark:border-white/10 overflow-hidden flex items-center justify-center">
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="w-full h-full object-fill select-none"
            >
              <defs>
                {/* Glowing gradients for trade corridors */}
                <linearGradient id="routeGradientMain" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0066FF" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
                  <stop offset="100%" stopColor="#FF6600" stopOpacity="0.8" />
                </linearGradient>

                <linearGradient id="grandRouteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.9" />
                  <stop offset="40%" stopColor="#0066FF" stopOpacity="1" />
                  <stop offset="70%" stopColor="#8b5cf6" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="1" />
                </linearGradient>

                {/* Continent Fill Gradient */}
                <linearGradient id="continentFill" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#14213d" />
                  <stop offset="50%" stopColor="#101c36" />
                  <stop offset="100%" stopColor="#0e172e" />
                </linearGradient>

                {/* Glow filter for SVG paths and moving laser dots */}
                <filter id="svgGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="0.6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {/* Intense Halo Glow for Cargo Packets */}
                <filter id="intenseGlow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="1.2" result="blur1" />
                  <feGaussianBlur stdDeviation="0.5" result="blur2" />
                  <feMerge>
                    <feMergeNode in="blur1" />
                    <feMergeNode in="blur2" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* 
                ================================================================
                LATITUDE & LONGITUDE NAVIGATION GRATICULES
                ================================================================
              */}
              <g stroke="#1E293B" strokeWidth="0.15" strokeDasharray="1, 2" opacity="0.6">
                {/* Latitudes */}
                <line x1="0" y1="20" x2="100" y2="20" />
                <line x1="0" y1="35" x2="100" y2="35" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="#334155" strokeWidth="0.25" strokeDasharray="2, 2" /> {/* Equator */}
                <line x1="0" y1="65" x2="100" y2="65" />
                <line x1="0" y1="80" x2="100" y2="80" />
                {/* Longitudes */}
                <line x1="20" y1="0" x2="20" y2="100" />
                <line x1="35" y1="0" x2="35" y2="100" />
                <line x1="50" y1="0" x2="50" y2="100" stroke="#334155" strokeWidth="0.25" strokeDasharray="2, 2" /> {/* Prime Meridian */}
                <line x1="65" y1="0" x2="65" y2="100" />
                <line x1="80" y1="0" x2="80" y2="100" />
                <line x1="95" y1="0" x2="95" y2="100" />
              </g>

              {/* 
                ================================================================
                ACTUAL GEOGRAPHIC CONTINENTS VECTOR PATHS
                Detailed, recognizable coastal shapes for North America, Greenland,
                South America, Europe, British Isles, Africa, Asia, Japan, Indonesia,
                Australia & New Zealand.
                ================================================================
              */}
              <g fill="url(#continentFill)" stroke="#223660" strokeWidth="0.35">
                {/* 1. NORTH AMERICA (Alaska, Canada, Hudson Bay, US, Mexico, Central America) */}
                <path d="M 6.5 22.0 L 10.0 18.0 L 14.5 17.5 L 18.0 15.0 L 22.5 16.0 L 24.5 19.5 L 22.0 22.5 L 25.5 22.0 L 27.5 18.0 L 30.5 18.5 L 32.5 23.5 L 30.0 26.0 L 32.0 28.5 L 29.5 32.0 L 28.0 38.0 L 26.5 41.5 L 24.5 41.0 L 23.5 38.5 L 21.0 39.5 L 19.5 44.5 L 22.0 46.5 L 24.0 46.0 L 25.5 48.0 L 24.0 51.5 L 22.0 50.0 L 19.0 47.0 L 17.5 41.0 L 15.5 36.5 L 16.5 33.5 L 14.0 31.0 L 12.0 28.0 L 8.0 26.5 Z" />

                {/* 1b. GREENLAND */}
                <path d="M 36.0 12.0 L 42.5 10.5 L 44.5 14.5 L 42.0 21.0 L 38.0 22.5 L 36.5 17.5 Z" />

                {/* 1c. CUBA & CARIBBEAN */}
                <path d="M 26.0 44.5 L 29.5 45.0 L 28.0 46.0 L 25.5 45.0 Z" />

                {/* 2. SOUTH AMERICA (Colombia, Venezuela, Brazil, Argentina, Chile, Peru) */}
                <path d="M 26.5 51.5 L 29.0 50.5 L 32.5 50.5 L 35.0 53.0 L 38.5 56.5 L 39.5 61.5 L 38.0 66.5 L 36.5 72.0 L 34.0 77.0 L 31.5 83.0 L 29.5 86.5 L 28.5 83.0 L 29.5 76.0 L 28.0 68.0 L 26.5 60.5 L 25.0 55.0 Z" />

                {/* 3. EUROPE (Iberia, France, Germany, Low Countries, Scandinavia, Italy, Balkans, Eastern Europe) */}
                <path d="M 45.0 40.0 L 47.5 37.0 L 46.5 34.5 L 49.0 33.0 L 49.5 29.0 L 51.5 27.5 L 53.5 29.0 L 54.0 33.0 L 52.0 36.0 L 53.5 38.5 L 52.5 40.5 L 55.5 39.5 L 57.5 37.0 L 59.0 32.0 L 56.5 27.0 L 54.5 22.0 L 57.0 16.5 L 59.5 19.0 L 57.5 25.0 L 60.0 27.0 L 57.5 33.0 L 54.0 36.5 L 50.0 37.0 L 48.0 41.5 L 44.5 41.5 Z" />

                {/* 3b. BRITISH ISLES (UK & Ireland) */}
                <path d="M 46.0 28.5 L 48.0 27.0 L 48.5 31.0 L 46.5 33.0 Z" />
                <path d="M 44.0 29.5 L 45.5 29.0 L 45.0 31.5 L 43.5 31.0 Z" />

                {/* 4. AFRICA (North Africa, West Africa Bulge, Horn, South Africa, Madagascar) */}
                <path d="M 44.5 42.0 L 50.0 41.5 L 54.0 43.5 L 58.5 42.0 L 61.5 44.0 L 61.0 48.5 L 66.5 50.5 L 62.0 57.0 L 60.5 64.0 L 57.5 73.0 L 54.0 79.5 L 50.5 78.5 L 48.5 68.0 L 47.0 59.0 L 48.5 54.0 L 45.0 54.5 L 41.5 51.0 L 41.0 46.0 L 44.0 43.0 Z" />

                {/* 4b. MADAGASCAR */}
                <path d="M 64.0 67.5 L 66.0 66.0 L 65.5 74.0 L 63.5 74.5 Z" />

                {/* 5. ASIA (Middle East, Arabia, Russia/Siberia, India, China, Southeast Asia, Korea) */}
                <path d="M 59.0 32.0 L 62.5 30.0 L 66.0 23.0 L 72.0 18.0 L 80.0 17.0 L 88.0 19.5 L 94.0 24.5 L 92.5 30.0 L 88.5 33.0 L 85.0 35.0 L 83.5 38.5 L 84.0 41.5 L 81.0 44.5 L 78.5 49.0 L 79.5 54.0 L 77.0 57.0 L 74.5 51.0 L 76.5 44.0 L 74.0 41.0 L 70.0 44.0 L 68.5 52.0 L 71.5 56.0 L 68.0 54.0 L 65.5 46.0 L 63.0 48.5 L 61.5 45.0 L 64.5 40.0 L 60.5 36.5 Z" />

                {/* 5b. JAPAN (Honshu, Hokkaido, Kyushu) */}
                <path d="M 87.0 34.0 L 89.0 34.5 L 87.5 39.5 L 85.0 41.0 L 85.5 38.0 Z" />

                {/* 5c. SOUTHEAST ASIA & INDONESIA ISLANDS (Sumatra, Java, Borneo, Philippines) */}
                <path d="M 74.5 58.0 L 78.0 60.5 L 76.5 62.5 L 73.5 59.0 Z" /> {/* Sumatra */}
                <path d="M 77.5 63.0 L 82.5 63.5 L 81.5 65.0 L 76.5 64.5 Z" /> {/* Java */}
                <path d="M 79.5 56.5 L 83.5 57.0 L 83.0 61.5 L 79.0 60.5 Z" /> {/* Borneo */}
                <path d="M 83.5 49.0 L 85.5 50.0 L 84.5 55.0 L 83.0 53.5 Z" /> {/* Philippines */}

                {/* 6. AUSTRALIA & OCEANIA */}
                <path d="M 81.0 68.0 L 85.5 67.0 L 87.5 63.5 L 90.0 69.0 L 92.5 74.0 L 90.5 80.5 L 86.5 81.5 L 83.0 79.0 L 80.0 75.0 L 80.0 70.5 Z" />

                {/* 6b. TASMANIA */}
                <path d="M 89.0 84.5 L 91.0 84.5 L 90.5 86.5 L 88.5 86.0 Z" />

                {/* 6c. NEW ZEALAND */}
                <path d="M 94.5 78.5 L 96.5 80.5 L 95.0 85.5 L 93.5 83.5 Z" />

                {/* 6d. PAPUA NEW GUINEA */}
                <path d="M 86.5 60.5 L 91.0 61.5 L 89.5 64.5 L 85.5 63.0 Z" />
              </g>

              {/* High-tech continent contour glow edges */}
              <g fill="none" stroke="#3b82f6" strokeWidth="0.25" opacity="0.5" filter="url(#svgGlow)">
                <path d="M 6.5 22.0 L 10.0 18.0 L 14.5 17.5 L 18.0 15.0 L 22.5 16.0 L 24.5 19.5 L 22.0 22.5 L 25.5 22.0 L 27.5 18.0 L 30.5 18.5 L 32.5 23.5 L 30.0 26.0 L 32.0 28.5 L 29.5 32.0 L 28.0 38.0 L 26.5 41.5 L 24.5 41.0 L 23.5 38.5 L 21.0 39.5 L 19.5 44.5 L 22.0 46.5 L 24.0 46.0 L 25.5 48.0 L 24.0 51.5 L 22.0 50.0 L 19.0 47.0 L 17.5 41.0 L 15.5 36.5 L 16.5 33.5 L 14.0 31.0 L 12.0 28.0 L 8.0 26.5 Z" />
                <path d="M 26.5 51.5 L 29.0 50.5 L 32.5 50.5 L 35.0 53.0 L 38.5 56.5 L 39.5 61.5 L 38.0 66.5 L 36.5 72.0 L 34.0 77.0 L 31.5 83.0 L 29.5 86.5 L 28.5 83.0 L 29.5 76.0 L 28.0 68.0 L 26.5 60.5 L 25.0 55.0 Z" />
                <path d="M 44.5 42.0 L 50.0 41.5 L 54.0 43.5 L 58.5 42.0 L 61.5 44.0 L 61.0 48.5 L 66.5 50.5 L 62.0 57.0 L 60.5 64.0 L 57.5 73.0 L 54.0 79.5 L 50.5 78.5 L 48.5 68.0 L 47.0 59.0 L 48.5 54.0 L 45.0 54.5 L 41.5 51.0 L 41.0 46.0 L 44.0 43.0 Z" />
                <path d="M 59.0 32.0 L 62.5 30.0 L 66.0 23.0 L 72.0 18.0 L 80.0 17.0 L 88.0 19.5 L 94.0 24.5 L 92.5 30.0 L 88.5 33.0 L 85.0 35.0 L 83.5 38.5 L 84.0 41.5 L 81.0 44.5 L 78.5 49.0 L 79.5 54.0 L 77.0 57.0 L 74.5 51.0 L 76.5 44.0 L 74.0 41.0 L 70.0 44.0 L 68.5 52.0 L 71.5 56.0 L 68.0 54.0 L 65.5 46.0 L 63.0 48.5 L 61.5 45.0 L 64.5 40.0 L 60.5 36.5 Z" />
                <path d="M 81.0 68.0 L 85.5 67.0 L 87.5 63.5 L 90.0 69.0 L 92.5 74.0 L 90.5 80.5 L 86.5 81.5 L 83.0 79.0 L 80.0 75.0 L 80.0 70.5 Z" />
              </g>

              {/* 
                ================================================================
                1. CONTINUOUS GRAND TRANS-CONTINENTAL INTERCONNECTED BACKBONE
                A highlighted intermodal path connecting Shanghai -> Dubai -> Rotterdam -> Chicago -> Santos
                ================================================================
              */}
              <path
                d={grandTranscontinentalRoute}
                fill="none"
                stroke="url(#grandRouteGradient)"
                strokeWidth="0.8"
                strokeDasharray="2, 1"
                opacity="0.35"
              />

              {/* Flagship Mega-Cargo Continuous Pulse Traveling across the Globe */}
              <g filter="url(#intenseGlow)">
                {/* Outer pulsing ring traveling the entire route */}
                <circle r="1.8" fill="#38bdf8" opacity="0.3">
                  <animateMotion
                    path={grandTranscontinentalRoute}
                    dur="12s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="r"
                    values="1.2;2.4;1.2"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Bright Cyan Core Dot */}
                <circle r="1.1" fill="#00F0FF">
                  <animateMotion
                    path={grandTranscontinentalRoute}
                    dur="12s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* White Hot Spot */}
                <circle r="0.6" fill="#FFFFFF">
                  <animateMotion
                    path={grandTranscontinentalRoute}
                    dur="12s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>

              {/* 
                ================================================================
                2. INDIVIDUAL CORRIDOR ARCS WITH LIVE TRAVELING CARGO DOTS
                Each corridor renders its trajectory path and moving dots
                ================================================================
              */}
              {tradeCorridors.map((corridor) => {
                const isHighlighted = selectedCorridor?.id === corridor.id;
                return (
                  <g 
                    key={corridor.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedCorridor(corridor)}
                  >
                    {/* Underlying Guide Line */}
                    <path
                      d={corridor.path}
                      fill="none"
                      stroke={corridor.color}
                      strokeWidth={isHighlighted ? '0.8' : '0.4'}
                      strokeDasharray="1.5, 1"
                      opacity={isHighlighted ? 0.9 : 0.35}
                    />

                    {/* Animated Laser Glow Line */}
                    <path
                      d={corridor.path}
                      fill="none"
                      stroke={corridor.color}
                      strokeWidth={isHighlighted ? '0.9' : '0.55'}
                      filter="url(#svgGlow)"
                      opacity={isHighlighted ? 1 : 0.75}
                    />

                    {/* Primary Traveling Cargo Dot (Moving from Location A to Location B) */}
                    <g filter="url(#intenseGlow)">
                      {/* Outer pulse aura */}
                      <circle r="1.4" fill={corridor.color} opacity="0.45">
                        <animateMotion
                          path={corridor.path}
                          dur={`${corridor.dur}s`}
                          repeatCount="indefinite"
                          begin={`${corridor.delay || 0}s`}
                        />
                        <animate
                          attributeName="opacity"
                          values="0.2;0.6;0.2"
                          dur="1.2s"
                          repeatCount="indefinite"
                        />
                      </circle>

                      {/* Main Vivid Colored Dot */}
                      <circle r="0.9" fill={corridor.color}>
                        <animateMotion
                          path={corridor.path}
                          dur={`${corridor.dur}s`}
                          repeatCount="indefinite"
                          begin={`${corridor.delay || 0}s`}
                        />
                      </circle>

                      {/* Super Bright White Core */}
                      <circle r="0.5" fill="#FFFFFF">
                        <animateMotion
                          path={corridor.path}
                          dur={`${corridor.dur}s`}
                          repeatCount="indefinite"
                          begin={`${corridor.delay || 0}s`}
                        />
                      </circle>
                    </g>

                    {/* Secondary Staggered Follower Dot (For rich continuous stream sensation) */}
                    <g filter="url(#svgGlow)" opacity="0.75">
                      <circle r="0.6" fill="#38bdf8">
                        <animateMotion
                          path={corridor.path}
                          dur={`${corridor.dur}s`}
                          repeatCount="indefinite"
                          begin={`${(corridor.delay || 0) + corridor.dur * 0.5}s`}
                        />
                      </circle>
                      <circle r="0.3" fill="#FFFFFF">
                        <animateMotion
                          path={corridor.path}
                          dur={`${corridor.dur}s`}
                          repeatCount="indefinite"
                          begin={`${(corridor.delay || 0) + corridor.dur * 0.5}s`}
                        />
                      </circle>
                    </g>
                  </g>
                );
              })}
            </svg>

            {/* 
              ================================================================
              3. HTML NODE MARKERS OVER SVG PROJECTION
              ================================================================
            */}
            {filteredNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
                  onClick={() => {
                    setSelectedNode(node);
                    setSelectedCorridor(null);
                  }}
                >
                  {/* Ping effect */}
                  <div
                    className={`absolute inset-0 rounded-full animate-ping pointer-events-none ${
                      node.type === 'superhub'
                        ? 'bg-[#0066FF] opacity-60'
                        : node.type === 'coldchain'
                        ? 'bg-sky-400 opacity-60'
                        : 'bg-[#FF6600] opacity-50'
                    }`}
                    style={{ width: '26px', height: '26px', margin: '-7px' }}
                  />

                  {/* Node City Code Tag Label */}
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-slate-900/90 dark:bg-black/90 border border-white/20 text-[9px] font-mono-tech font-bold text-white tracking-wider pointer-events-none shadow-md backdrop-blur-sm">
                    {node.code}
                  </div>

                  {/* Marker Button */}
                  <button
                    data-cursor="HUB"
                    aria-label={`View ${node.name}`}
                    className={`relative w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white flex items-center justify-center shadow-lg transition-transform hover:scale-125 ${
                      node.type === 'superhub'
                        ? 'bg-[#0066FF]'
                        : node.type === 'coldchain'
                        ? 'bg-sky-400'
                        : 'bg-[#FF6600]'
                    } ${isSelected ? 'ring-4 ring-[#38bdf8]' : ''}`}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  </button>

                  {/* Hover Popover */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-8 hidden group-hover:block z-30 w-56 bg-slate-900/95 dark:bg-[#0D1527] border border-[#0066FF]/40 p-3 rounded-xl shadow-2xl backdrop-blur-md pointer-events-none text-left">
                    <div className="flex items-center justify-between text-[10px] font-mono-tech text-gray-400 uppercase border-b border-white/10 pb-1.5">
                      <span className="text-[#38bdf8] font-bold">{node.type}</span>
                      <span>{node.country}</span>
                    </div>
                    <div className="font-heading font-bold text-xs text-white mt-1.5">{node.name}</div>
                    <div className="text-[10px] font-mono-tech text-gray-300 mt-1">{node.stats}</div>
                    <div className="mt-2 text-[9px] font-mono-tech text-emerald-400 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-emerald-400" /> ACTIVE CORRIDOR TRANSIT
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 
            ================================================================
            4. CORRIDOR QUICK SELECTOR TABS
            ================================================================
          */}
          <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none font-mono-tech text-xs">
            <span className="text-[11px] text-slate-500 dark:text-gray-400 shrink-0 uppercase font-bold flex items-center gap-1">
              <Navigation2 className="w-3.5 h-3.5 text-[#0066FF] dark:text-[#38bdf8]" /> Active Corridors:
            </span>
            {tradeCorridors.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCorridor(c);
                  setSelectedNode(null);
                }}
                className={`px-3 py-1.5 rounded-xl border text-[11px] whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md ${
                  selectedCorridor?.id === c.id
                    ? 'bg-[#0066FF] border-[#0066FF] text-white font-bold shadow-lg shadow-[#0066FF]/30'
                    : 'glass-card text-slate-600 dark:text-gray-300 hover:border-[#0066FF]/40'
                }`}
              >
                <span>{c.fromCode}</span>
                <span className="text-[#38bdf8]">→</span>
                <span>{c.toCode}</span>
              </button>
            ))}
          </div>

          {/* 
            ================================================================
            5. DETAIL HUD INSPECTOR CARD (FOR SELECTED NODE OR CORRIDOR)
            ================================================================
          */}
          <AnimatePresence>
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 p-5 rounded-2xl bg-white dark:bg-[#0D1527] border border-[#0066FF]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#0066FF]/15 text-[#0066FF] dark:text-[#38bdf8] text-[10px] font-mono-tech font-bold uppercase">
                      {selectedNode.type} • {selectedNode.code}
                    </span>
                    <span className="text-xs font-mono-tech text-emerald-500 font-bold">24/7 ONLINE DISPATCH</span>
                  </div>
                  <div className="font-heading font-black text-lg text-slate-900 dark:text-white uppercase tracking-tight">
                    {selectedNode.name} ({selectedNode.country})
                  </div>
                  <div className="text-xs font-mono-tech text-slate-600 dark:text-gray-300">{selectedNode.stats}</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-xl text-xs font-mono-tech uppercase text-slate-700 dark:text-white transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            )}

            {selectedCorridor && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 p-5 rounded-2xl bg-white dark:bg-[#0D1527] border border-[#0066FF]/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 text-[10px] font-mono-tech font-bold uppercase">
                      ACTIVE CONDUIT
                    </span>
                    <span className="text-xs font-mono-tech text-slate-900 dark:text-white font-bold">
                      {selectedCorridor.from} ({selectedCorridor.fromCode}) → {selectedCorridor.to} ({selectedCorridor.toCode})
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-gray-300 font-mono-tech">
                    <span className="text-[#0066FF] dark:text-[#38bdf8] font-bold">{selectedCorridor.mode}:</span> {selectedCorridor.cargoType}
                  </div>
                  <div className="flex flex-wrap gap-4 text-[11px] font-mono-tech text-slate-500 dark:text-gray-400 pt-1">
                    <span>Speed / Vector: <strong className="text-slate-900 dark:text-white">{selectedCorridor.speed}</strong></span>
                    <span>Transit SLA: <strong className="text-emerald-500">{selectedCorridor.transitTime}</strong></span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedCorridor(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-xl text-xs font-mono-tech uppercase text-slate-700 dark:text-white transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
