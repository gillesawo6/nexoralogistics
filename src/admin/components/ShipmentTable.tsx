import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  ArrowRight, 
  Plane, 
  Ship, 
  Truck, 
  Building2,
  Calendar,
  X,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { Shipment, ShipmentStatus, TransportMode } from '../../types';
import { StatusBadge } from './StatusBadge';
import { storageService } from '../../services/storageService';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { useToast } from '../../context/ToastContext';

interface ShipmentTableProps {
  shipments: Shipment[];
  onDataChange: () => void;
  limit?: number;
}

export const ShipmentTable: React.FC<ShipmentTableProps> = ({ 
  shipments, 
  onDataChange,
  limit 
}) => {
  const toast = useToast();
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [newStatus, setNewStatus] = useState<ShipmentStatus>('In Transit');
  const [newProgress, setNewProgress] = useState<number>(50);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventLoc, setNewEventLoc] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; trackingNumber: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const displayShipments = limit ? shipments.slice(0, limit) : shipments;

  const getModeIcon = (mode: TransportMode | string) => {
    switch (mode) {
      case 'Air Freight':
        return <Plane className="w-4 h-4 text-[#0066FF] dark:text-[#38bdf8]" />;
      case 'Ocean Freight':
        return <Ship className="w-4 h-4 text-cyan-500" />;
      case 'Road Transport':
      case 'Road Freight':
        return <Truck className="w-4 h-4 text-amber-500" />;
      default:
        return <Package className="w-4 h-4 text-purple-500" />;
    }
  };

  const handleOpenEdit = (s: Shipment) => {
    setEditingShipment(s);
    setNewStatus(s.status);
    setNewProgress(s.progressPercent);
    setNewEventTitle('');
    setNewEventLoc(`${s.currentLocation.city}, ${s.currentLocation.country}`);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
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
      progressPercent: Number(newProgress),
      events: updatedEvents,
      lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
    });

    toast.success(`Waybill #${editingShipment.trackingNumber} updated to ${newStatus} (${newProgress}%).`, 'Shipment Updated');
    setEditingShipment(null);
    onDataChange();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await storageService.deleteShipment(deleteTarget.id);
      toast.success(`Waybill #${deleteTarget.trackingNumber} deleted.`, 'Consignment Deleted');
      onDataChange();
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete shipment:', err);
      toast.error('Failed to delete shipment record.', 'Delete Error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (displayShipments.length === 0) {
    return (
      <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center">
        <Package className="w-12 h-12 text-slate-400 dark:text-gray-600 mx-auto mb-3" />
        <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white uppercase">
          No Shipments Found
        </h3>
        <p className="text-slate-500 dark:text-gray-400 text-xs font-mono-tech mt-1">
          No records match your query or filter criteria.
        </p>
        <Link
          to="/admin/shipments/new"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-heading font-bold uppercase tracking-wider"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Shipment</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono-tech">
            <thead className="bg-slate-100 dark:bg-[#0D1527] text-slate-600 dark:text-gray-400 uppercase border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="py-3.5 px-4">Tracking Waybill</th>
                <th className="py-3.5 px-4">Route (Origin → Dest)</th>
                <th className="py-3.5 px-4">Mode / Carrier</th>
                <th className="py-3.5 px-4">Status &amp; Progress</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-slate-700 dark:text-gray-300">
              {displayShipments.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  {/* Tracking Number */}
                  <td className="py-4 px-4 font-bold text-slate-950 dark:text-white">
                    <Link
                      to={`/admin/shipments/${s.id}`}
                      className="hover:text-[#0066FF] dark:hover:text-[#38bdf8] flex items-center gap-2"
                    >
                      <Package className="w-4 h-4 text-[#0066FF] shrink-0" />
                      <span>{s.trackingNumber}</span>
                    </Link>
                    <div className="text-[10px] text-slate-400 dark:text-gray-500 font-normal mt-0.5">
                      ETA: {s.estimatedDelivery}
                    </div>
                  </td>

                  {/* Route */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
                      <span>{s.origin.city}</span>
                      <ArrowRight className="w-3 h-3 text-[#0066FF]" />
                      <span>{s.destination.city}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-gray-400">
                      {s.origin.country} → {s.destination.country}
                    </div>
                  </td>

                  {/* Mode & Carrier */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 font-medium">
                      {getModeIcon(s.transportMode)}
                      <span>{s.transportMode}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-gray-400">
                      {s.carrier} ({s.vesselOrFlightNumber})
                    </div>
                  </td>

                  {/* Status & Progress */}
                  <td className="py-4 px-4">
                    <StatusBadge status={s.status} size="sm" />
                    <div className="w-28 bg-slate-200 dark:bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#0066FF] to-[#38bdf8] h-full rounded-full"
                        style={{ width: `${s.progressPercent}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5">
                      {s.progressPercent}% complete
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[140px]">
                      {s.customerName}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-gray-400 truncate max-w-[140px]">
                      {s.customerCompany || s.customerEmail}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/admin/shipments/${s.id}`}
                        title="View Milestone Timeline"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 hover:text-[#0066FF] dark:hover:text-[#38bdf8] transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        onClick={() => handleOpenEdit(s)}
                        title="Quick Status Edit"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 hover:text-amber-500 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteTarget({ id: s.id, trackingNumber: s.trackingNumber })}
                        title="Delete Waybill"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 dark:bg-white/5 dark:hover:bg-rose-950/40 text-slate-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Edit Modal */}
      {editingShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#070D1D] border border-slate-300 dark:border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono-tech text-[#0066FF] dark:text-[#38bdf8] font-bold uppercase">
                  WAYBILL TELEMETRY UPDATE
                </span>
                <h3 className="font-heading font-black text-xl text-slate-950 dark:text-white uppercase">
                  {editingShipment.trackingNumber}
                </h3>
              </div>
              <button
                onClick={() => setEditingShipment(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 font-mono-tech text-xs">
              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1.5 uppercase">
                  Current Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ShipmentStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:border-[#0066FF]"
                >
                  <option value="In Transit">In Transit</option>
                  <option value="Customs Clearance">Customs Clearance</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Booked">Booked</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-slate-700 dark:text-gray-300 font-bold uppercase">
                    Journey Progress (%)
                  </label>
                  <span className="font-bold text-[#0066FF] dark:text-[#38bdf8]">{newProgress}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={newProgress}
                  onChange={(e) => setNewProgress(Number(e.target.value))}
                  className="w-full accent-[#0066FF]"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1.5 uppercase">
                  Append New Milestone Event (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Scanned into terminal sort facility"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1.5 uppercase">
                  Milestone Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Frankfurt Airport (FRA), Germany"
                  value={newEventLoc}
                  onChange={(e) => setNewEventLoc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingShipment(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 uppercase font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white uppercase font-bold tracking-wider shadow-lg shadow-[#0066FF]/20"
                >
                  Save Telemetry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Persistent In-App Confirmation Modal for Shipment Deletion */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        title="Delete Consignment Waybill"
        description="Are you sure you want to permanently delete this freight consignment? All milestone events, GPS route logs, and live tracking records will be removed."
        itemName={deleteTarget?.trackingNumber}
        itemBadge="Consignment Waybill"
        confirmText="Delete Consignment"
      />
    </>
  );
};
