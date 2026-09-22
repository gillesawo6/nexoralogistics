import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Package, 
  ArrowLeft, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  MapPin, 
  Plane, 
  Ship, 
  Truck, 
  Activity, 
  Thermometer, 
  Gauge, 
  Calendar, 
  Building2, 
  User, 
  ShieldCheck,
  Send,
  Printer,
  Mail,
  Check,
  Copy,
  X,
  Compass,
  Radio
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { emailService, EmailMessageRecord } from '../../services/emailService';
import { Shipment, ShipmentStatus, TrackingEvent, Waypoint } from '../../types';
import { StatusBadge } from '../components/StatusBadge';
import { updatePageSeo } from '../../services/seoService';
import { PrintableShipmentDossier } from '../../components/tracking/PrintableShipmentDossier';
import { TrackingMap } from '../../components/tracking/TrackingMap';
import { resolveLocationSync } from '../../utils/geoUtils';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { useToast } from '../../context/ToastContext';

export const ShipmentDetailPage: React.FC = () => {
  const toast = useToast();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showEmailReceiverModal, setShowEmailReceiverModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [receiverCustomNote, setReceiverCustomNote] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccessMessage, setEmailSuccessMessage] = useState<string | null>(null);
  const [lastEmailRecord, setLastEmailRecord] = useState<EmailMessageRecord | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Milestone Form
  const [eventTitle, setEventTitle] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventStatus, setEventStatus] = useState<ShipmentStatus>('In Transit');
  const [eventProgress, setEventProgress] = useState<number>(50);

  const loadShipment = () => {
    if (!id) return;
    const shipments = storageService.getShipments();
    const found = shipments.find(s => s.id === id || s.trackingNumber.toUpperCase() === id.toUpperCase());
    if (found) {
      setShipment(found);
      setEventStatus(found.status);
      setEventProgress(found.progressPercent);
      setEventLocation(found.currentLocation?.address || found.currentLocation?.city ? `${found.currentLocation.address || found.currentLocation.city}, ${found.currentLocation.country || ''}` : `${found.origin.city}, ${found.origin.country}`);
    }
  };

  useEffect(() => {
    loadShipment();
  }, [id]);

  useEffect(() => {
    if (shipment) {
      updatePageSeo({
        title: `Waybill ${shipment.trackingNumber} | NEXORA Operations`,
        description: `Live cargo telemetry for consignment ${shipment.trackingNumber}`,
      });
    }
  }, [shipment]);

  const handleSendReceiverEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!shipment) return;

    setIsSendingEmail(true);
    setEmailSuccessMessage(null);

    try {
      const record = emailService.sendShipmentCreatedToReceiver(shipment, receiverCustomNote);
      if (record) {
        setLastEmailRecord(record);
        setEmailSuccessMessage(`Consignment notice and Shipment ID #${shipment.trackingNumber} delivered to ${shipment.receiver?.email || shipment.customerEmail}`);
        toast.success(`Consignment notice dispatched to ${shipment.receiver?.email || shipment.customerEmail}`, 'Email Dispatched');
      } else {
        setEmailSuccessMessage('No receiver email address is on file for this consignment.');
        toast.warning('No receiver email address is on file for this consignment.', 'No Email');
      }
    } catch (err) {
      console.error('Email dispatch error:', err);
      setEmailSuccessMessage('Failed to dispatch receiver email.');
      toast.error('Failed to dispatch receiver email. Please try again.', 'Dispatch Failed');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipment || !eventTitle.trim()) {
      toast.warning('Please enter milestone remarks/event title.', 'Event Remarks Required');
      return;
    }

    const now = new Date();
    let rawLoc = eventLocation.trim();
    if (!rawLoc) {
      if (eventStatus === 'Delivered') {
        rawLoc = shipment.destination.address || `${shipment.destination.city}, ${shipment.destination.country}`;
      } else if (eventStatus === 'On Hold' || eventStatus === 'Origin Facility' || eventStatus === 'Created' || eventStatus === 'Picked Up') {
        rawLoc = shipment.origin.address || `${shipment.origin.city}, ${shipment.origin.country}`;
      } else {
        rawLoc = shipment.currentLocation?.address || `${shipment.currentLocation.city}, ${shipment.currentLocation.country}`;
      }
    }
    const geoLoc = resolveLocationSync(rawLoc);

    const newEvent: TrackingEvent = {
      id: `ev-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0] + ' UTC',
      location: rawLoc,
      status: eventStatus,
      updatedBy: 'admin',
      remarks: eventTitle.trim(),
      description: eventTitle.trim(),
      lat: geoLoc.lat,
      lng: geoLoc.lng,
      completed: true,
    };

    const updatedEvents = [newEvent, ...shipment.events];
    
    // Update live currentLocation coordinates
    const updatedLocation = {
      ...shipment.currentLocation,
      city: geoLoc.city || rawLoc.split(',')[0].trim(),
      country: geoLoc.country || shipment.currentLocation.country,
      address: rawLoc,
      lat: geoLoc.lat,
      lng: geoLoc.lng,
    };

    // Clean existing waypoints: strip any synthetic "Transit Corridor" waypoints
    const cleanedWaypoints = (shipment.waypoints || []).filter((w) => {
      if (!w || !w.name) return false;
      const isSynthetic = w.name.toLowerCase().includes('transit corridor');
      return !isSynthetic;
    });

    // Check if a waypoint at this location already exists (within ~0.08 deg or same name)
    const existingIndex = cleanedWaypoints.findIndex((w) => {
      if (w.type === 'destination' || w.type === 'origin') return false;
      if (typeof w.lat === 'number' && typeof geoLoc.lat === 'number') {
        return Math.hypot(w.lat - geoLoc.lat, w.lng - geoLoc.lng) < 0.08;
      }
      return w.name.toLowerCase() === rawLoc.toLowerCase();
    });

    let updatedWaypoints: Waypoint[];
    if (existingIndex >= 0) {
      // Update existing waypoint timestamp and state rather than adding a duplicate
      updatedWaypoints = [...cleanedWaypoints];
      updatedWaypoints[existingIndex] = {
        ...updatedWaypoints[existingIndex],
        passed: true,
        timestamp: `${newEvent.date} ${newEvent.time}`,
      };
    } else {
      // Add new transit waypoint before destination
      const newWaypoint: Waypoint = {
        name: rawLoc,
        lat: geoLoc.lat,
        lng: geoLoc.lng,
        type: 'transit',
        passed: true,
        timestamp: `${newEvent.date} ${newEvent.time}`,
      };
      updatedWaypoints = [
        ...cleanedWaypoints.filter((w) => w.type !== 'destination'),
        newWaypoint,
        ...cleanedWaypoints.filter((w) => w.type === 'destination'),
      ];
    }

    const updated = storageService.updateShipment(shipment.id, {
      status: eventStatus,
      progressPercent: eventStatus === 'Delivered' ? 100 : Number(eventProgress),
      currentLocation: updatedLocation,
      events: updatedEvents,
      waypoints: updatedWaypoints,
      lastUpdated: `${newEvent.date} ${newEvent.time}`,
    });

    if (updated) {
      setShipment(updated);
      setEventTitle('');
      toast.success(`Milestone "${newEvent.remarks}" recorded for ${updated.trackingNumber}. Status set to ${eventStatus}.`, 'Milestone Added');
      // Dispatch milestone update email to customer
      try {
        emailService.sendShipmentStatusUpdateToCustomer(updated, newEvent);
      } catch (e) {
        console.warn('Status email notification error:', e);
      }
    }
  };

  const handleDeleteMilestone = (eventId: string) => {
    if (!shipment || shipment.events.length <= 1) {
      toast.warning('Consignments must retain at least one milestone in the immutable audit trail.', 'Cannot Remove Base Milestone');
      return;
    }
    const updatedEvents = shipment.events.filter((e) => e.id !== eventId);
    const latest = updatedEvents[0];
    const newStatus = latest.status || shipment.status;
    const newLoc = resolveLocationSync(latest.location);
    const updatedLocation = {
      ...shipment.currentLocation,
      address: latest.location,
      city: newLoc.city || latest.location.split(',')[0].trim(),
      country: newLoc.country || shipment.currentLocation.country,
      lat: newLoc.lat,
      lng: newLoc.lng,
    };

    // Clean waypoints to reflect remaining events
    const remainingLocs = updatedEvents.map((e) => e.location.toLowerCase());
    const updatedWaypoints = (shipment.waypoints || []).filter((w) => {
      if (w.type === 'origin' || w.type === 'destination') return true;
      if (w.name.toLowerCase().includes('transit corridor')) return false;
      return remainingLocs.some((loc) => loc.includes(w.name.toLowerCase()) || w.name.toLowerCase().includes(loc));
    });

    const updated = storageService.updateShipment(shipment.id, {
      status: newStatus,
      currentLocation: updatedLocation,
      events: updatedEvents,
      waypoints: updatedWaypoints,
      lastUpdated: `${latest.date} ${latest.time || ''}`.trim(),
    });

    if (updated) {
      setShipment(updated);
      toast.success('Milestone removed from audit trail and live telemetry updated.', 'Milestone Removed');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!shipment) return;
    setIsDeleting(true);
    try {
      await storageService.deleteShipment(shipment.id);
      toast.success(`Waybill #${shipment.trackingNumber} deleted from database.`, 'Consignment Deleted');
      navigate('/admin/shipments');
    } catch (err) {
      console.error('Failed to delete shipment:', err);
      toast.error('Failed to delete shipment.', 'Delete Error');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (!shipment) {
    return (
      <div className="text-center py-20 bg-white dark:bg-[#070D1D] rounded-2xl border border-slate-200 dark:border-white/10 p-8">
        <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white uppercase">
          Shipment Not Found
        </h2>
        <p className="text-xs font-mono-tech text-slate-500 dark:text-gray-400 mt-1">
          Waybill ID &quot;{id}&quot; does not exist in local operational storage.
        </p>
        <Link
          to="/admin/shipments"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0066FF] text-white text-xs font-bold font-heading uppercase"
        >
          Back to Shipments
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-mono-tech text-xs">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/shipments"
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-950 dark:text-white uppercase tracking-tight">
                {shipment.trackingNumber}
              </h1>
              <StatusBadge status={shipment.status} />
            </div>
            <p className="text-slate-500 dark:text-gray-400 text-[11px] mt-0.5">
              Service: {shipment.serviceLevel} • Carrier: {shipment.carrier} ({shipment.vesselOrFlightNumber})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            onClick={() => setShowEmailReceiverModal(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
            title="Dispatch Inbound Consignment Notice & Shipment ID to Receiver"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Consignee</span>
          </button>

          <button
            onClick={() => setShowPrintModal(true)}
            className="px-3.5 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold uppercase flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Dossier</span>
          </button>

          <Link
            to={`/tracking?number=${shipment.trackingNumber}`}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-gray-200 border border-slate-200 dark:border-white/10 font-bold uppercase flex items-center gap-2"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#0066FF]" />
            <span>Public Tracking View</span>
          </Link>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 font-bold uppercase flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Corridor HUD Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Origin */}
        <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] text-[#0066FF] dark:text-[#38bdf8] uppercase font-bold">ORIGIN FACILITY</span>
          <div className="font-heading font-black text-xl text-slate-900 dark:text-white uppercase">
            {shipment.origin.city}, {shipment.origin.country}
          </div>
          <div className="text-slate-500 dark:text-gray-400 text-[11px]">
            {shipment.origin.facility}
          </div>
        </div>

        {/* Current Telemetry */}
        <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] text-amber-500 uppercase font-bold">TELEMETRY STREAM</span>
          <div className="font-heading font-black text-xl text-slate-900 dark:text-white uppercase flex items-center gap-2">
            <span>{shipment.currentLocation.speedKnots} KTS</span>
            <span className="text-slate-400 text-sm font-normal">•</span>
            <span>{shipment.currentLocation.temperatureCelsius}°C</span>
          </div>
          <div className="text-slate-500 dark:text-gray-400 text-[11px]">
            Coords: {shipment.currentLocation.lat.toFixed(2)}°N, {shipment.currentLocation.lng.toFixed(2)}°E
          </div>
        </div>

        {/* Destination */}
        <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] text-purple-500 uppercase font-bold">DESTINATION TERMINAL</span>
          <div className="font-heading font-black text-xl text-slate-900 dark:text-white uppercase">
            {shipment.destination.city}, {shipment.destination.country}
          </div>
          <div className="text-slate-500 dark:text-gray-400 text-[11px]">
            ETA: {shipment.estimatedDelivery}
          </div>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900 dark:text-white uppercase">Total Transit Completion</span>
          <span className="font-bold text-[#0066FF] dark:text-[#38bdf8]">{shipment.progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-white/10 h-2.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#0066FF] via-[#38bdf8] to-[#FF6600] rounded-full transition-all duration-300"
            style={{ width: `${shipment.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Live Telemetry Map Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white uppercase">
              Live Telemetry & Route Map
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono-tech">
            Current: {shipment.currentLocation.address || shipment.currentLocation.city} ({shipment.currentLocation.lat.toFixed(4)}°, {shipment.currentLocation.lng.toFixed(4)}°)
          </span>
        </div>
        <TrackingMap shipment={shipment} height="420px" />
      </div>

      {/* 2-Column: Event Timeline and Append Milestone Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Milestone Append Form */}
        <div className="lg:col-span-5 bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-heading font-bold text-sm uppercase">
            <Plus className="w-4 h-4 text-[#0066FF]" />
            <span>Broadcast Telemetry Event</span>
          </div>

          <form onSubmit={handleAddMilestone} className="space-y-4">
            <div>
              <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1 uppercase">
                Milestone Status Transition
              </label>
              <select
                value={eventStatus}
                onChange={(e) => setEventStatus(e.target.value as ShipmentStatus)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white focus:outline-none focus:border-[#0066FF]"
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
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-700 dark:text-gray-300 font-bold uppercase">
                  Progress Percentage
                </label>
                <span className="font-bold text-[#0066FF]">{eventProgress}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={eventProgress}
                onChange={(e) => setEventProgress(Number(e.target.value))}
                className="w-full accent-[#0066FF]"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1 uppercase">
                Milestone Description *
              </label>
              <textarea
                required
                rows={2}
                placeholder="e.g. Scanned into customs verification airside warehouse..."
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white focus:outline-none focus:border-[#0066FF]"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1 uppercase">
                Event Location
              </label>
              <input
                type="text"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white focus:outline-none focus:border-[#0066FF]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-[#0066FF]/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Milestone</span>
            </button>
          </form>

          {/* Consignee Info */}
          <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-2 text-slate-600 dark:text-gray-400 text-[11px]">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-900 dark:text-white uppercase text-xs">Customer Record</div>
              <button
                type="button"
                onClick={() => setShowEmailReceiverModal(true)}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase flex items-center gap-1 border border-emerald-500/20 cursor-pointer"
              >
                <Mail className="w-3 h-3" />
                <span>Email Consignee</span>
              </button>
            </div>
            <div>Client: <span className="text-slate-900 dark:text-white font-semibold">{shipment.receiver?.name || shipment.customerName}</span></div>
            <div>Email: <span className="text-slate-900 dark:text-white font-semibold">{shipment.receiver?.email || shipment.customerEmail}</span></div>
            <div>Company: <span className="text-slate-900 dark:text-white font-semibold">{shipment.customerCompany || 'Consignee'}</span></div>
            <div>Commodity: <span className="text-slate-900 dark:text-white font-semibold">{shipment.cargoDescription} ({shipment.weightKg} kg, {shipment.pieces} pcs)</span></div>
          </div>
        </div>

        {/* Milestone Timeline History */}
        <div className="lg:col-span-7 bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
            <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white uppercase">
              Milestone Audit Trail ({shipment.events.length})
            </h3>
            <span className="text-[10px] text-emerald-500 font-bold uppercase">Immutable Log</span>
          </div>

          <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-white/10">
            {shipment.events.map((ev) => (
              <div key={ev.id} className="relative pl-8 space-y-1">
                <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-[#0066FF] border-2 border-white dark:border-[#070D1D]" />
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-950 dark:text-white">{ev.description}</span>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={ev.status} size="sm" />
                    {shipment.events.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMilestone(ev.id)}
                        title="Delete Milestone"
                        className="p-1 rounded-md text-rose-500 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-gray-400 flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-[#0066FF]" />
                  <span>{ev.location}</span>
                  <span>•</span>
                  <span>{ev.date} {ev.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DEDICATED EMAIL RECEIVER MODAL */}
      {showEmailReceiverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/15 p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-white space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-lg uppercase tracking-tight">
                    Send Consignment Notice to Receiver
                  </h3>
                  <p className="text-[11px] font-mono-tech text-slate-500 dark:text-gray-400">
                    Delivers official Waybill manifest, live tracking link, and Shipment ID
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEmailReceiverModal(false);
                  setEmailSuccessMessage(null);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recipient & Shipment ID Information */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1528] border border-slate-200 dark:border-white/10 space-y-2.5 font-mono-tech text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Consignee Target</span>
                <span className="px-2 py-0.5 rounded bg-[#0066FF]/10 text-[#0066FF] text-[10px] font-bold">
                  {shipment.receiver?.name || shipment.customerName}
                </span>
              </div>
              <div className="text-slate-700 dark:text-gray-300">
                Recipient Email: <strong className="text-slate-900 dark:text-white">{shipment.receiver?.email || shipment.customerEmail}</strong>
              </div>
              <div className="text-slate-700 dark:text-gray-300">
                Shipment ID / Waybill #: <strong className="text-[#0066FF] dark:text-[#38bdf8] font-bold">{shipment.trackingNumber}</strong>
              </div>
              <div className="text-slate-500 dark:text-gray-400 text-[11px]">
                Route: {shipment.origin.city} → {shipment.destination.city} ({shipment.transportMode})
              </div>
            </div>

            {/* Custom Notes */}
            <div className="space-y-1.5 font-mono-tech">
              <label className="text-[11px] font-bold text-slate-700 dark:text-gray-300 uppercase">
                Custom Remarks / Delivery Instructions (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Please present Shipment ID at the gate upon delivery. Delivery driver contact: +1 800-555-0199."
                value={receiverCustomNote}
                onChange={(e) => setReceiverCustomNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#0066FF]"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5 font-mono-tech text-xs">
              <button
                type="button"
                onClick={handleSendReceiverEmail}
                disabled={isSendingEmail}
                className="px-4 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold font-heading uppercase tracking-wider flex items-center gap-2 shadow-md shadow-[#0066FF]/20 cursor-pointer disabled:opacity-50"
              >
                <Send className={`w-4 h-4 ${isSendingEmail ? 'animate-spin' : ''}`} />
                <span>{isSendingEmail ? 'Dispatching Notice...' : 'Send Consignment Email'}</span>
              </button>

              {lastEmailRecord?.gmailComposeUrl && (
                <a
                  href={lastEmailRecord.gmailComposeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2.5 rounded-xl bg-[#EA4335] hover:bg-[#d93025] text-white font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Mail className="w-4 h-4" />
                  <span>Open in Gmail</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              )}

              <button
                type="button"
                onClick={() => {
                  const trackingUrl = emailService.getTrackingCustomerUrl(shipment.trackingNumber);
                  navigator.clipboard.writeText(trackingUrl);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-gray-200 font-bold flex items-center gap-1.5 transition-colors"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Tracking Link Copied!' : 'Copy Tracking Link'}</span>
              </button>
            </div>

            {emailSuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-mono-tech flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>{emailSuccessMessage}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dedicated Print Version for Ctrl+P */}
      <div className="hidden print:block">
        <PrintableShipmentDossier shipment={shipment} />
      </div>

      {/* On-Screen Modal Preview */}
      {showPrintModal && (
        <PrintableShipmentDossier
          shipment={shipment}
          isModal={true}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {/* Persistent In-App Confirmation Modal for Waybill Deletion */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          if (!isDeleting) setShowDeleteModal(false);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        title="Delete Consignment Waybill"
        description="Are you sure you want to permanently delete this freight consignment? You will be redirected back to the shipments overview."
        itemName={shipment.trackingNumber}
        itemBadge="Active Waybill"
        confirmText="Delete Consignment"
      />
    </div>
  );
};
