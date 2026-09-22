import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Plus, 
  ArrowRight, 
  Activity, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Mail, 
  RotateCcw,
  Plane,
  Ship,
  Truck,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { Shipment, QuoteRequest, ContactMessage } from '../../types';
import { StatCard } from '../components/StatCard';
import { ShipmentTable } from '../components/ShipmentTable';
import { StatusBadge } from '../components/StatusBadge';
import { updatePageSeo } from '../../services/seoService';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';

export const DashboardPage: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const loadData = () => {
    setShipments(storageService.getShipments());
    setQuotes(storageService.getQuotes());
    setMessages(storageService.getContactMessages());
  };

  useEffect(() => {
    updatePageSeo({
      title: 'Operations Dashboard | NEXORA LOGISTICS Admin',
      description: 'Overview of all shipments, fleet telemetry, and inquiries across the global network.',
    });
    loadData();
  }, []);

  // Compute stat counts
  const totalShipments = shipments.length;
  const inTransitCount = shipments.filter(s => s.status === 'In Transit' || s.status === 'Out for Delivery').length;
  const pendingOrHoldCount = shipments.filter(s => s.status === 'On Hold' || s.status === 'Pending' || s.status === 'Processing' || s.status === 'Customs Clearance').length;
  const deliveredCount = shipments.filter(s => s.status === 'Delivered').length;

  // Status breakdown groups
  const statusSummary = [
    { label: 'In Transit', count: shipments.filter(s => s.status === 'In Transit').length, color: 'blue', status: 'In Transit' },
    { label: 'Out for Delivery', count: shipments.filter(s => s.status === 'Out for Delivery').length, color: 'blue', status: 'Out for Delivery' },
    { label: 'Customs Clearance', count: shipments.filter(s => s.status === 'Customs Clearance').length, color: 'purple', status: 'Customs Clearance' },
    { label: 'On Hold / Alert', count: shipments.filter(s => s.status === 'On Hold').length, color: 'rose', status: 'On Hold' },
    { label: 'Delivered', count: deliveredCount, color: 'emerald', status: 'Delivered' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner / Heading & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-4xl text-slate-950 dark:text-white uppercase tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-gray-400 text-sm font-normal mt-1">
            Overview of all shipments across the network.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/docs"
            className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-300/60 dark:border-amber-500/30 text-xs font-mono-tech flex items-center gap-1.5 transition-colors"
            title="Open Platform Owner & Operator Documentation"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-bold">Owner Manual (PDF)</span>
          </Link>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 text-xs font-mono-tech flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Reset Mock Datasets"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset Demo</span>
          </button>

          <Link
            to="/admin/shipments/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#0066FF]/25"
          >
            <span>New Shipment</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 4 Primary Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Shipments"
          value={totalShipments}
          icon={Package}
          color="blue"
          subtitle="320+ global nodes connected"
          trend="+12% this month"
          trendPositive={true}
        />
        <StatCard
          title="In Transit"
          value={inTransitCount}
          icon={Activity}
          color="blue"
          subtitle="Live satellite telemetry"
          trend="Active moving cargo"
          trendPositive={true}
        />
        <StatCard
          title="Pending / On Hold"
          value={pendingOrHoldCount}
          icon={AlertCircle}
          color="amber"
          subtitle="Customs check & staging"
          trend={pendingOrHoldCount > 0 ? 'Requires review' : 'Zero bottlenecks'}
          trendPositive={pendingOrHoldCount === 0}
        />
        <StatCard
          title="Delivered"
          value={deliveredCount}
          icon={CheckCircle2}
          color="emerald"
          subtitle="99.94% on-time SLA rate"
          trend="Completed deliveries"
          trendPositive={true}
        />
      </div>

      {/* Status Summary Breakdown */}
      <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-mono-tech text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-gray-400">
            NETWORK STATUS SUMMARY
          </span>
          <span className="text-[11px] font-mono-tech text-slate-400 dark:text-gray-500">
            Real-time Telemetry Grid
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {statusSummary.map((item) => (
            <div
              key={item.label}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <StatusBadge status={item.status} size="sm" />
              </div>
              <div className="font-heading font-black text-2xl text-slate-900 dark:text-white">
                {item.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Shipments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-extrabold text-lg sm:text-xl text-slate-950 dark:text-white uppercase tracking-tight">
              Recent Shipments
            </h2>
            <p className="text-xs font-mono-tech text-slate-500 dark:text-gray-400">
              Latest waybills logged into the system
            </p>
          </div>

          <Link
            to="/admin/shipments"
            className="inline-flex items-center gap-1.5 text-xs font-mono-tech font-bold uppercase tracking-wider text-[#0066FF] dark:text-[#38bdf8] hover:underline"
          >
            <span>View All Shipments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ShipmentTable shipments={shipments} onDataChange={loadData} limit={5} />
      </div>

      {/* Secondary Row: Recent Quotes & Desk Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Quotes */}
        <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0066FF]" />
              <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white uppercase">
                Incoming Rate Quotes ({quotes.length})
              </h3>
            </div>
            <Link
              to="/admin/quotes"
              className="text-xs font-mono-tech text-[#0066FF] dark:text-[#38bdf8] hover:underline font-bold"
            >
              View Quotes →
            </Link>
          </div>

          <div className="space-y-3 font-mono-tech text-xs">
            {quotes.slice(0, 3).map((q) => (
              <div
                key={q.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/5 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{q.fullName} ({q.companyName})</div>
                  <div className="text-[11px] text-slate-500 dark:text-gray-400">
                    {q.originCity} → {q.destCity} • {q.service}
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={q.status} size="sm" />
                  <div className="text-[10px] text-[#0066FF] font-bold mt-1">
                    ${q.estimatedCostUsd?.toLocaleString() || 'Custom'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-500" />
              <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white uppercase">
                Customer Inquiries ({messages.length})
              </h3>
            </div>
            <Link
              to="/admin/messages"
              className="text-xs font-mono-tech text-purple-600 dark:text-purple-400 hover:underline font-bold"
            >
              View Messages →
            </Link>
          </div>

          <div className="space-y-3 font-mono-tech text-xs">
            {messages.slice(0, 3).map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/5 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{m.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-gray-400 truncate max-w-[220px]">
                    {m.subject}
                  </div>
                </div>
                <StatusBadge status={m.status} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Corporate Profile Quick Link Card */}
      <div className="bg-gradient-to-r from-blue-900/20 via-[#070D1D] to-indigo-950/20 border border-[#0066FF]/30 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#0066FF]/20 text-[#0066FF] dark:text-[#38bdf8] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="font-heading font-black text-sm uppercase text-slate-900 dark:text-white">
              Enterprise Corporate Profile & Contact Channels
            </div>
            <div className="text-xs text-slate-500 dark:text-gray-400 font-mono-tech mt-0.5">
              Primary switchboard, 24/7 emergency dispatch hotline, VAT/Tax identifiers, and IATA licenses.
            </div>
          </div>
        </div>
        <Link
          to="/admin/company-info"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-mono-tech text-xs font-bold uppercase transition-all shrink-0"
        >
          <span>Manage Company Info</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Confirmation Modal for Resetting Demo Datasets */}
      <ConfirmDeleteModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={() => {
          storageService.resetToDefaults();
          loadData();
          setShowResetConfirm(false);
        }}
        title="Reset Operations & Demo Datasets"
        description="Are you sure you want to restore default shipments, rate quotes, inquiries, and intelligence publications? All local tombstones and changes will be refreshed."
        itemBadge="Factory Reset"
        confirmText="Reset Datasets"
      />
    </div>
  );
};
