import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  RotateCcw,
  Plane,
  Ship,
  Truck,
  Layers
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Shipment, TransportMode, ShipmentStatus } from '../../types';
import { ShipmentTable } from '../components/ShipmentTable';
import { updatePageSeo } from '../../services/seoService';

export const ShipmentsPage: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [modeFilter, setModeFilter] = useState<string>('ALL');

  const loadData = () => {
    setShipments(storageService.getShipments());
  };

  useEffect(() => {
    updatePageSeo({
      title: 'Active Shipments & Waybills | NEXORA Admin',
      description: 'Filter, inspect, and update consignment status and tracking milestones across all transport corridors.',
    });
    
    // Initial local read
    loadData();

    // Subscribe to real-time Firestore database updates
    const unsubscribe = storageService.subscribeToShipments((liveShipments) => {
      setShipments(liveShipments);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const filteredShipments = shipments.filter((s) => {
    const matchesSearch =
      s.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.origin.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.origin.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.destination.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.destination.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.carrier.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesMode = modeFilter === 'ALL' || s.transportMode === modeFilter;

    return matchesSearch && matchesStatus && matchesMode;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-950 dark:text-white uppercase tracking-tight">
            Shipments &amp; Consignments
          </h1>
          <p className="text-slate-600 dark:text-gray-400 text-xs font-mono-tech mt-1">
            Total of {shipments.length} waybills registered in the cyberfreight database.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 transition-colors"
            title="Refresh Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <Link
            to="/admin/shipments/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#0066FF]/25"
          >
            <Plus className="w-4 h-4" />
            <span>New Shipment</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search */}
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by waybill, customer, origin, destination, or carrier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono-tech text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#0066FF]"
          />
        </div>

        {/* Status Filter */}
        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono-tech text-xs focus:outline-none focus:border-[#0066FF]"
          >
            <option value="ALL">All Statuses ({shipments.length})</option>
            <option value="In Transit">In Transit</option>
            <option value="Customs Clearance">Customs Clearance</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="On Hold">On Hold</option>
            <option value="Booked">Booked</option>
          </select>
        </div>

        {/* Mode Filter */}
        <div className="md:col-span-3">
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono-tech text-xs focus:outline-none focus:border-[#0066FF]"
          >
            <option value="ALL">All Transport Modes</option>
            <option value="Air Freight">Air Freight</option>
            <option value="Ocean Freight">Ocean Freight</option>
            <option value="Road Freight">Road Freight</option>
          </select>
        </div>
      </div>

      {/* Shipments Table */}
      <ShipmentTable shipments={filteredShipments} onDataChange={loadData} />
    </div>
  );
};
