import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { Shipment, QuoteRequest, ContactMessage, ShipmentStatus, TransportMode } from '../types';
import { updatePageSeo } from '../services/seoService';
import { 
  Package, 
  Plus, 
  Search, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  Mail, 
  DollarSign, 
  Users, 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  X,
  Send,
  Navigation,
  Globe2,
  Cpu,
  Layers,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ConfirmDeleteModal } from '../admin/components/ConfirmDeleteModal';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shipments' | 'quotes' | 'messages' | 'subscribers'>('shipments');
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [subscribers, setSubscribers] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'shipment' | 'quote' | 'message' | 'subscriber' | 'reset';
    id: string;
    name: string;
    badge: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Edit Shipment State
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [newStatus, setNewStatus] = useState<ShipmentStatus>('In Transit');
  const [newProgress, setNewProgress] = useState<number>(50);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventLoc, setNewEventLoc] = useState('');

  // Create Shipment Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTrackingNumber, setNewTrackingNumber] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCustomerCompany, setNewCustomerCompany] = useState('');
  const [newOriginCity, setNewOriginCity] = useState('');
  const [newOriginCountry, setNewOriginCountry] = useState('');
  const [newDestCity, setNewDestCity] = useState('');
  const [newDestCountry, setNewDestCountry] = useState('');
  const [newMode, setNewMode] = useState<TransportMode>('Air Freight');
  const [newCommodity, setNewCommodity] = useState('Medical Equipment & Pharma');
  const [newWeight, setNewWeight] = useState(3200);
  const [newPieces, setNewPieces] = useState(8);
  const [newCarrier, setNewCarrier] = useState('NEXORA Priority Air');
  const [newVessel, setNewVessel] = useState('NX-7704');
  const [formSuccessMessage, setFormSuccessMessage] = useState('');

  const refreshData = () => {
    setShipments(storageService.getShipments());
    setQuotes(storageService.getQuotes());
    setMessages(storageService.getContactMessages());
    setSubscribers(storageService.getSubscribers());
  };

  useEffect(() => {
    updatePageSeo({
      title: 'Admin Operations Control Desk | NEXORA LOGISTICS',
      description: 'Internal operations desk to monitor shipments, manage real-time tracking events, and review incoming freight quotes.',
    });
    refreshData();
  }, []);

  const handleUpdateShipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShipment) return;

    let updatedEvents = [...editingShipment.events];
    if (newEventTitle.trim()) {
      const now = new Date();
      updatedEvents.unshift({
        id: `ev-${Date.now()}`,
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0] + ' UTC',
        location: newEventLoc.trim() || `${editingShipment.currentLocation.city}, ${editingShipment.currentLocation.country}`,
        status: newStatus,
        description: newEventTitle.trim(),
        completed: true,
      });
    }

    storageService.updateShipment(editingShipment.id, {
      status: newStatus,
      progressPercent: newProgress,
      events: updatedEvents,
    });

    setEditingShipment(null);
    setNewEventTitle('');
    setNewEventLoc('');
    refreshData();
  };

  const handleCreateShipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackingNumber || !newOriginCity || !newDestCity) return;

    storageService.createShipment({
      trackingNumber: newTrackingNumber.trim().toUpperCase(),
      customerName: newCustomerName || 'Enterprise Cargo Client',
      customerEmail: newCustomerEmail || 'ops@enterprise.com',
      customerCompany: newCustomerCompany || 'Global Enterprise Logistics',
      origin: {
        city: newOriginCity,
        country: newOriginCountry || 'Origin Country',
        code: newOriginCity.substring(0, 3).toUpperCase(),
        lat: 31.2304,
        lng: 121.4737,
        facility: `${newOriginCity} Global Freight Terminal`,
      },
      destination: {
        city: newDestCity,
        country: newDestCountry || 'Destination Country',
        code: newDestCity.substring(0, 3).toUpperCase(),
        lat: 51.9244,
        lng: 4.4777,
        facility: `${newDestCity} Distribution Superhub`,
      },
      currentLocation: {
        city: newOriginCity,
        country: newOriginCountry || 'Global Hub',
        lat: 31.2304,
        lng: 121.4737,
        speedKnots: newMode === 'Air Freight' ? 480 : newMode === 'Ocean Freight' ? 22 : 65,
        temperatureCelsius: 18.5,
      },
      transportMode: newMode,
      serviceLevel: 'Express Urgent',
      carrier: newCarrier || `NEXORA ${newMode} Lines`,
      vesselOrFlightNumber: newVessel || `NX-${Math.floor(1000 + Math.random() * 9000)}`,
      cargoDescription: newCommodity,
      weightKg: Number(newWeight) || 3500,
      volumeCbm: 14.5,
      pieces: Number(newPieces) || 6,
      status: 'In Transit',
      progressPercent: 20,
      estimatedDelivery: '2026-09-05 16:00 UTC',
      dispatchedDate: new Date().toISOString().split('T')[0] + ' 08:00 UTC',
      lastUpdated: new Date().toISOString().split('T')[0] + ' 09:15 UTC',
      waypoints: [
        { name: `${newOriginCity} Departure`, lat: 31.2304, lng: 121.4737, type: 'origin', passed: true },
        { name: `${newDestCity} Inbound Port`, lat: 51.9244, lng: 4.4777, type: 'destination', passed: false },
      ],
      events: [
        {
          id: `ev-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          time: '08:00 UTC',
          location: `${newOriginCity} International Terminal`,
          status: 'In Transit',
          description: `Consignment inducted into NEXORA CyberFreight network via ${newMode}.`,
          completed: true,
        },
      ],
    });

    setShowCreateModal(false);
    setNewTrackingNumber('');
    setNewCustomerName('');
    setNewCustomerEmail('');
    setNewCustomerCompany('');
    setNewOriginCity('');
    setNewOriginCountry('');
    setNewDestCity('');
    setNewDestCountry('');
    setFormSuccessMessage('Shipment successfully provisioned into active telemetry grid!');
    setTimeout(() => setFormSuccessMessage(''), 4000);
    refreshData();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'shipment') {
        await storageService.deleteShipment(deleteTarget.id);
      } else if (deleteTarget.type === 'quote') {
        await storageService.deleteQuote(deleteTarget.id);
      } else if (deleteTarget.type === 'message') {
        await storageService.deleteMessage(deleteTarget.id);
      } else if (deleteTarget.type === 'subscriber') {
        await storageService.deleteSubscriber(deleteTarget.id);
      } else if (deleteTarget.type === 'reset') {
        storageService.resetToDefaults();
      }
      refreshData();
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetData = () => {
    setDeleteTarget({
      type: 'reset',
      id: 'factory_reset',
      name: 'All Demo Datasets & Telemetry Logs',
      badge: 'Factory Reset'
    });
  };

  const filteredShipments = shipments.filter((s) => {
    const matchesSearch =
      s.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.origin.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.destination.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.carrier.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="pt-28 pb-24 bg-[#030712] text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0066FF]/30 bg-[#0066FF]/10 text-[#38bdf8] font-mono-tech text-xs tracking-widest uppercase mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>CONTROL TOWER • ADMIN OPERATIONS DESK</span>
            </div>
            <h1 className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-tight text-white">
              DISPATCH &amp; CARGO CONTROL
            </h1>
            <p className="text-gray-400 text-sm font-light mt-2 max-w-xl">
              Internal mission control interface to create shipments, simulate status transitions, append real-time milestone events, and review customer submissions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetData}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-mono-tech text-gray-300 hover:text-white transition-colors flex items-center gap-2"
              title="Reset all demo data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Data</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-2.5 bg-[#0066FF] hover:bg-[#0052cc] rounded-xl text-xs font-heading font-bold uppercase tracking-wider text-white transition-all flex items-center gap-2 shadow-lg shadow-[#0066FF]/20"
            >
              <Plus className="w-4 h-4" />
              <span>New Shipment</span>
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {formSuccessMessage && (
          <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-emerald-400 text-sm font-mono-tech">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{formSuccessMessage}</span>
          </div>
        )}

        {/* System HUD Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          <div className="bg-[#070D1D] border border-white/10 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-mono-tech text-gray-400">
              <span>ACTIVE CONSIGNMENTS</span>
              <Package className="w-4 h-4 text-[#38bdf8]" />
            </div>
            <div className="font-heading font-black text-3xl text-white">
              {shipments.length}
            </div>
            <div className="text-[11px] font-mono-tech text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Telemetry Grid Online</span>
            </div>
          </div>

          <div className="bg-[#070D1D] border border-white/10 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-mono-tech text-gray-400">
              <span>SPOT QUOTE LEADS</span>
              <DollarSign className="w-4 h-4 text-[#0066FF]" />
            </div>
            <div className="font-heading font-black text-3xl text-white">
              {quotes.length}
            </div>
            <div className="text-[11px] font-mono-tech text-gray-400">
              Instant Rate Requests
            </div>
          </div>

          <div className="bg-[#070D1D] border border-white/10 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-mono-tech text-gray-400">
              <span>DESK INQUIRIES</span>
              <Mail className="w-4 h-4 text-purple-400" />
            </div>
            <div className="font-heading font-black text-3xl text-white">
              {messages.length}
            </div>
            <div className="text-[11px] font-mono-tech text-gray-400">
              Transmissions Logged
            </div>
          </div>

          <div className="bg-[#070D1D] border border-white/10 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-mono-tech text-gray-400">
              <span>INTELLIGENCE SUBSCRIBERS</span>
              <Users className="w-4 h-4 text-[#FF6600]" />
            </div>
            <div className="font-heading font-black text-3xl text-white">
              {subscribers.length}
            </div>
            <div className="text-[11px] font-mono-tech text-gray-400">
              Weekly Bulletin Readers
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('shipments')}
            className={`px-5 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'shipments'
                ? 'bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/25'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Shipments Registry ({shipments.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`px-5 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'quotes'
                ? 'bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/25'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Rate Quotes ({quotes.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-5 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'messages'
                ? 'bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/25'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Inquiries ({messages.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('subscribers')}
            className={`px-5 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'subscribers'
                ? 'bg-[#0066FF] text-white shadow-lg shadow-[#0066FF]/25'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Subscribers ({subscribers.length})</span>
          </button>
        </div>

        {/* TAB 1: SHIPMENTS MANAGER */}
        {activeTab === 'shipments' && (
          <div className="space-y-6">
            {/* Search & Status Filters */}
            <div className="bg-[#070D1D] border border-white/10 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by waybill, customer, or route..."
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0D1527] border border-white/10 rounded-xl text-xs font-mono-tech text-white placeholder-gray-500 focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                <span className="text-[11px] font-mono-tech text-gray-400 uppercase mr-1">Status:</span>
                {['ALL', 'In Transit', 'Customs Clearance', 'Delivered', 'Created'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono-tech transition-colors whitespace-nowrap ${
                      statusFilter === st
                        ? 'bg-[#0066FF]/20 text-[#38bdf8] border border-[#0066FF]/50'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Shipments Table */}
            <div className="bg-[#070D1D] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono-tech">
                  <thead className="bg-[#0D1527] text-gray-400 border-b border-white/10 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-4 pl-6">Waybill / Commodity</th>
                      <th className="p-4">Route Corridor</th>
                      <th className="p-4">Mode / Carrier</th>
                      <th className="p-4">Progress</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {filteredShipments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">
                          No shipments match the filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredShipments.map((s) => (
                        <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">{s.trackingNumber}</span>
                              <Link
                                to={`/tracking?number=${s.trackingNumber}`}
                                target="_blank"
                                className="text-[#38bdf8] hover:text-white"
                                title="Open Live HUD"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                            <div className="text-[11px] text-gray-400">{s.cargoDescription} • {s.weightKg} kg</div>
                          </td>
                          <td className="p-4">
                            <div className="text-white font-semibold">{s.origin.city} → {s.destination.city}</div>
                            <div className="text-[11px] text-gray-400">Current: {s.currentLocation.city}, {s.currentLocation.country}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-[#38bdf8]">{s.transportMode}</div>
                            <div className="text-[11px] text-gray-400">{s.vesselOrFlightNumber}</div>
                          </td>
                          <td className="p-4">
                            <div className="w-24 bg-white/10 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-[#0066FF] h-full rounded-full"
                                style={{ width: `${s.progressPercent}%` }}
                              />
                            </div>
                            <div className="text-[10px] text-gray-400 mt-1">{s.progressPercent}% complete</div>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              s.status === 'Delivered'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : s.status === 'Customs Clearance'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-[#0066FF]/20 text-[#38bdf8] border border-[#0066FF]/30'
                            }`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingShipment(s);
                                  setNewStatus(s.status);
                                  setNewProgress(s.progressPercent);
                                }}
                                className="p-2 bg-white/5 hover:bg-[#0066FF]/20 text-gray-300 hover:text-white rounded-lg transition-colors"
                                title="Edit Waybill & Events"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget({
                                  type: 'shipment',
                                  id: s.id,
                                  name: `${s.trackingNumber} (${s.origin.city} → ${s.destination.city})`,
                                  badge: 'Shipment Waybill'
                                })}
                                className="p-2 bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                                title="Delete Waybill"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: QUOTES MANAGER */}
        {activeTab === 'quotes' && (
          <div className="space-y-6">
            <div className="bg-[#070D1D] border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg uppercase text-white">
                  Incoming Commercial Rate Requests
                </h3>
                <span className="text-xs font-mono-tech text-gray-400">Total: {quotes.length} Quotes</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono-tech">
                  <thead className="bg-[#0D1527] text-gray-400 uppercase tracking-wider text-[11px] border-b border-white/10">
                    <tr>
                      <th className="p-4 pl-6">Quote Ref</th>
                      <th className="p-4">Contact Details</th>
                      <th className="p-4">Service &amp; Corridor</th>
                      <th className="p-4">Weight &amp; Cargo</th>
                      <th className="p-4">Estimated Spot Rate</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {quotes.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-500">
                          No quote requests recorded yet.
                        </td>
                      </tr>
                    ) : (
                      quotes.map((q) => (
                        <tr key={q.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 pl-6 font-bold text-white uppercase">{q.id}</td>
                          <td className="p-4">
                            <div className="font-bold text-white">{q.fullName}</div>
                            <div className="text-[11px] text-gray-400">{q.companyName} • {q.email}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-[#38bdf8] font-bold">{q.service}</div>
                            <div className="text-[11px] text-gray-400">{q.originCity} → {q.destCity}</div>
                          </td>
                          <td className="p-4">
                            <div>{q.weightKg} kg</div>
                            <div className="text-[11px] text-gray-400">{q.cargoType}</div>
                          </td>
                          <td className="p-4 font-bold text-emerald-400 text-sm">
                            ${q.estimatedCostUsd?.toLocaleString()} USD
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-full bg-[#0066FF]/20 text-[#38bdf8] text-[10px] uppercase font-bold border border-[#0066FF]/30">
                              {q.status}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            <button
                              onClick={() => setDeleteTarget({
                                type: 'quote',
                                id: q.id,
                                name: `${q.referenceNumber || q.id} — ${q.fullName}`,
                                badge: 'Rate Quotation'
                              })}
                              className="p-2 bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                              title="Delete Quote"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONTACT MESSAGES */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div className="bg-[#070D1D] border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/10">
              <div className="p-5 flex items-center justify-between">
                <h3 className="font-heading font-bold text-lg uppercase text-white">
                  Desk Inquiries &amp; Customer Transmissions
                </h3>
                <span className="text-xs font-mono-tech text-gray-400">Total: {messages.length} Messages</span>
              </div>

              {messages.length === 0 ? (
                <div className="p-8 text-center text-gray-500 font-mono-tech text-xs">
                  No desk transmissions recorded yet.
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className="p-6 hover:bg-white/[0.02] transition-colors space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-heading font-bold text-white text-sm">{m.name}</span>
                        <span className="text-xs font-mono-tech text-gray-400">({m.email})</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono-tech text-[#38bdf8]">
                          {m.department}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-mono-tech text-gray-500">{m.createdAt}</span>
                        <button
                          onClick={() => setDeleteTarget({
                            type: 'message',
                            id: m.id,
                            name: `${m.name} — "${m.subject}"`,
                            badge: 'Customer Inquiry'
                          })}
                          className="p-1.5 bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                          title="Delete Message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="font-heading font-bold text-xs text-gray-300 uppercase tracking-wide">{m.subject}</div>
                    <p className="text-xs text-gray-400 leading-relaxed font-light">{m.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SUBSCRIBERS */}
        {activeTab === 'subscribers' && (
          <div className="space-y-6">
            <div className="bg-[#070D1D] border border-white/10 rounded-2xl p-6">
              <h3 className="font-heading font-bold text-lg uppercase text-white mb-4">
                Trade Intelligence Subscribers ({subscribers.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {subscribers.map((email, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#0D1527] rounded-xl border border-white/5 text-gray-300 font-mono-tech text-xs flex items-center justify-between"
                  >
                    <span className="truncate">{email}</span>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <button
                        onClick={() => setDeleteTarget({
                          type: 'subscriber',
                          id: email,
                          name: email,
                          badge: 'Subscriber'
                        })}
                        className="p-1 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
                        title="Remove Subscriber"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODAL: EDIT SHIPMENT & AUDIT TELEMETRY */}
        {editingShipment && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#070D1D] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <div className="text-[11px] font-mono-tech text-[#38bdf8] uppercase">Update Telemetry &amp; Checkpoints</div>
                  <h3 className="font-heading font-bold text-xl uppercase text-white mt-1">
                    {editingShipment.trackingNumber} ({editingShipment.origin.city} → {editingShipment.destination.city})
                  </h3>
                </div>
                <button
                  onClick={() => setEditingShipment(null)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateShipment} className="space-y-5 text-xs font-mono-tech">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 uppercase mb-1">Consignment Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as ShipmentStatus)}
                      className="w-full bg-[#0D1527] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#0066FF]"
                    >
                      <option>Created</option>
                      <option>Picked Up</option>
                      <option>Origin Facility</option>
                      <option>Departed Origin</option>
                      <option>In Transit</option>
                      <option>Customs Clearance</option>
                      <option>Destination Facility</option>
                      <option>Out for Delivery</option>
                      <option>Delivered</option>
                      <option>Exception</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-400 uppercase mb-1">
                      Route Progress ({newProgress}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={newProgress}
                      onChange={(e) => setNewProgress(Number(e.target.value))}
                      className="w-full mt-3 accent-[#0066FF]"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-3">
                  <div className="text-[11px] font-bold text-white uppercase tracking-wider">
                    Append Live Waybill Milestone Event
                  </div>
                  <div>
                    <label className="block text-gray-400 uppercase mb-1">Event Description</label>
                    <input
                      type="text"
                      value={newEventTitle}
                      onChange={(e) => setNewEventTitle(e.target.value)}
                      placeholder="e.g. Vessel passed Suez Canal waypoint. EDI cleared."
                      className="w-full bg-[#0D1527] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#0066FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 uppercase mb-1">Checkpoint Location</label>
                    <input
                      type="text"
                      value={newEventLoc}
                      onChange={(e) => setNewEventLoc(e.target.value)}
                      placeholder="e.g. Port of Rotterdam Deepwater Terminal"
                      className="w-full bg-[#0D1527] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#0066FF]"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingShipment(null)}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#0066FF] hover:bg-[#0052cc] rounded-xl font-heading font-bold uppercase text-white shadow-lg shadow-[#0066FF]/20"
                  >
                    Save &amp; Broadcast Telemetry
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: CREATE SHIPMENT */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#070D1D] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <div className="text-[11px] font-mono-tech text-[#38bdf8] uppercase">Waybill Dispatch Protocol</div>
                  <h3 className="font-heading font-bold text-2xl uppercase text-white mt-1">
                    Provision New Consignment
                  </h3>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateShipment} className="space-y-4 text-xs font-mono-tech">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 uppercase mb-1">Waybill Number *</label>
                    <input
                      type="text"
                      required
                      value={newTrackingNumber}
                      onChange={(e) => setNewTrackingNumber(e.target.value)}
                      placeholder="e.g. NX-99201"
                      className="w-full bg-[#0D1527] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#0066FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 uppercase mb-1">Transport Modality *</label>
                    <select
                      value={newMode}
                      onChange={(e) => setNewMode(e.target.value as TransportMode)}
                      className="w-full bg-[#0D1527] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#0066FF]"
                    >
                      <option>Air Freight</option>
                      <option>Ocean Freight</option>
                      <option>Road Freight</option>
                      <option>Rail Intermodal</option>
                      <option>Customs Brokerage</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 uppercase mb-1">Origin City &amp; Country *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        value={newOriginCity}
                        onChange={(e) => setNewOriginCity(e.target.value)}
                        placeholder="City (e.g. Shanghai)"
                        className="w-full bg-[#0D1527] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#0066FF]"
                      />
                      <input
                        type="text"
                        value={newOriginCountry}
                        onChange={(e) => setNewOriginCountry(e.target.value)}
                        placeholder="Country (e.g. China)"
                        className="w-full bg-[#0D1527] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#0066FF]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-400 uppercase mb-1">Destination City &amp; Country *</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        value={newDestCity}
                        onChange={(e) => setNewDestCity(e.target.value)}
                        placeholder="City (e.g. Rotterdam)"
                        className="w-full bg-[#0D1527] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#0066FF]"
                      />
                      <input
                        type="text"
                        value={newDestCountry}
                        onChange={(e) => setNewDestCountry(e.target.value)}
                        placeholder="Country (e.g. Netherlands)"
                        className="w-full bg-[#0D1527] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#0066FF]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 uppercase mb-1">Cargo Commodity</label>
                    <input
                      type="text"
                      value={newCommodity}
                      onChange={(e) => setNewCommodity(e.target.value)}
                      placeholder="e.g. EV Lithium Battery Packs"
                      className="w-full bg-[#0D1527] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#0066FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 uppercase mb-1">Gross Weight (kg)</label>
                    <input
                      type="number"
                      value={newWeight}
                      onChange={(e) => setNewWeight(Number(e.target.value))}
                      className="w-full bg-[#0D1527] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#0066FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 uppercase mb-1">Vessel / Flight No.</label>
                    <input
                      type="text"
                      value={newVessel}
                      onChange={(e) => setNewVessel(e.target.value)}
                      placeholder="e.g. MSC GULSUN / AF-280"
                      className="w-full bg-[#0D1527] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#0066FF]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-gray-400 uppercase mb-1">Consignee Customer</label>
                    <input
                      type="text"
                      value={newCustomerName}
                      onChange={(e) => setNewCustomerName(e.target.value)}
                      placeholder="e.g. Novartis BioPharma"
                      className="w-full bg-[#0D1527] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#0066FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 uppercase mb-1">Customer Email</label>
                    <input
                      type="email"
                      value={newCustomerEmail}
                      onChange={(e) => setNewCustomerEmail(e.target.value)}
                      placeholder="e.g. logistics@novartis.com"
                      className="w-full bg-[#0D1527] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#0066FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 uppercase mb-1">Assigned Carrier</label>
                    <input
                      type="text"
                      value={newCarrier}
                      onChange={(e) => setNewCarrier(e.target.value)}
                      placeholder="e.g. NEXORA Global Express"
                      className="w-full bg-[#0D1527] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#0066FF]"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#0066FF] hover:bg-[#0052cc] rounded-xl font-heading font-bold uppercase text-white shadow-lg shadow-[#0066FF]/20 flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Deploy Consignment</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Persistent In-App Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        title={
          deleteTarget?.type === 'shipment'
            ? 'Delete Shipment Waybill'
            : deleteTarget?.type === 'quote'
            ? 'Delete Rate Quotation'
            : deleteTarget?.type === 'message'
            ? 'Delete Customer Message'
            : deleteTarget?.type === 'subscriber'
            ? 'Remove Newsletter Subscriber'
            : 'Reset Factory Demo Datasets'
        }
        description={
          deleteTarget?.type === 'shipment'
            ? 'Are you sure you want to permanently delete this shipment consignment and remove all telemetry tracking waypoints?'
            : deleteTarget?.type === 'quote'
            ? 'Are you sure you want to permanently delete this rate quotation request and its customer records?'
            : deleteTarget?.type === 'message'
            ? 'Are you sure you want to delete this customer inquiry transmission?'
            : deleteTarget?.type === 'subscriber'
            ? 'Are you sure you want to remove this subscriber from the trade intelligence mailing list?'
            : 'Are you sure you want to restore all mock shipments, quotes, messages, and intelligence whitepapers to original factory state?'
        }
        itemName={deleteTarget?.name}
        itemBadge={deleteTarget?.badge}
        confirmText={deleteTarget?.type === 'reset' ? 'Reset Datasets' : 'Confirm Deletion'}
      />
    </div>
  );
};
