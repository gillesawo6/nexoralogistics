import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Printer, 
  ArrowRight, 
  Building2, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Plane, 
  Ship, 
  Truck, 
  Network,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Package,
  Calendar,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { QuoteRequest } from '../types';
import { storageService } from '../services/storageService';
import { emailService } from '../services/emailService';
import { updatePageSeo } from '../services/seoService';
import { PrintableQuoteDossier } from '../components/quote/PrintableQuoteDossier';
import { useToast } from '../context/ToastContext';

export const ViewQuotePage: React.FC = () => {
  const toast = useToast();
  const { quoteRef } = useParams<{ quoteRef: string }>();
  const [searchParams] = useSearchParams();
  const queryRef = searchParams.get('ref') || quoteRef || '';
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(queryRef);
  const [quote, setQuote] = useState<QuoteRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Modals
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Form states in modals
  const [acceptName, setAcceptName] = useState('');
  const [acceptNotes, setAcceptNotes] = useState('');
  const [declineReasonCategory, setDeclineReasonCategory] = useState('Price exceeds budgeted tariff');
  const [declineCustomReason, setDeclineCustomReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (queryRef) {
      loadQuote(queryRef);
    } else {
      setLoading(false);
    }
  }, [queryRef]);

  const loadQuote = async (ref: string) => {
    setLoading(true);
    setNotFound(false);
    try {
      const found = await storageService.fetchQuoteByReferenceAsync(ref);
      if (found) {
        setQuote(found);
        setAcceptName(found.fullName);
        updatePageSeo({
          title: `Freight Rate Quotation #${found.referenceNumber || found.id.toUpperCase()} | NEXORA`,
          description: `Official freight rate proposal for ${found.service} (${found.originCity} to ${found.destCity}).`,
        });
      } else {
        setNotFound(true);
      }
    } catch (e) {
      console.error('Error loading quote:', e);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/quote/${encodeURIComponent(searchQuery.trim().toUpperCase())}`);
    }
  };

  const handleAcceptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote || !acceptName.trim()) return;

    setIsProcessing(true);
    setTimeout(() => {
      const res = storageService.acceptQuote(quote.id, acceptName, acceptNotes);
      if (res.success && res.quote) {
        setQuote(res.quote);
        emailService.sendQuoteAcceptedNotificationToAdmin(res.quote);
        emailService.sendQuoteAcceptedConfirmationToCustomer(res.quote);
        setActionSuccessMessage('Quote accepted successfully! Our operations desk has been notified and a booking contract confirmation has been emailed to you.');
        setShowAcceptModal(false);
        toast.success(`Quote #${quote.referenceNumber || quote.id} accepted. Booking confirmation dispatched to your email.`, 'Quote Accepted');
      } else {
        toast.error(res.error || 'Failed to accept quote. Please try again or contact support.', 'Action Failed');
      }
      setIsProcessing(false);
    }, 600);
  };

  const handleDeclineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote) return;

    const fullReason = declineCustomReason.trim()
      ? `${declineReasonCategory}: ${declineCustomReason.trim()}`
      : declineReasonCategory;

    setIsProcessing(true);
    setTimeout(() => {
      const res = storageService.declineQuote(quote.id, fullReason);
      if (res.success && res.quote) {
        setQuote(res.quote);
        emailService.sendQuoteDeclinedNotificationToAdmin(res.quote, fullReason);
        emailService.sendQuoteDeclinedConfirmationToCustomer(res.quote);
        setActionSuccessMessage('Your feedback has been recorded. Our rate team will review and may contact you with alternatives.');
        setShowDeclineModal(false);
        toast.info(`Feedback for Quote #${quote.referenceNumber || quote.id} recorded. Thank you for letting us know.`, 'Feedback Recorded');
      } else {
        toast.error(res.error || 'Failed to decline quote. Please try again.', 'Action Failed');
      }
      setIsProcessing(false);
    }, 600);
  };

  const isExpired = () => {
    if (!quote?.validUntil) return false;
    const today = new Date().toISOString().split('T')[0];
    return quote.validUntil < today;
  };

  const getStatusBadge = (status: string) => {
    if (isExpired() && status === 'Sent') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-mono font-bold uppercase">
          <Clock className="w-3.5 h-3.5" />
          EXPIRED
        </span>
      );
    }

    switch (status) {
      case 'Accepted':
      case 'Booked':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold uppercase">
            <CheckCircle2 className="w-3.5 h-3.5" />
            ACCEPTED
          </span>
        );
      case 'Declined':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs font-mono font-bold uppercase">
            <XCircle className="w-3.5 h-3.5" />
            DECLINED
          </span>
        );
      case 'Sent':
      case 'Quoted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-[#0066FF] dark:text-[#38bdf8] border border-blue-500/30 text-xs font-mono font-bold uppercase animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            OFFICIAL PROPOSAL READY
          </span>
        );
      case 'Under Review':
      case 'Reviewing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-xs font-mono font-bold uppercase">
            <Clock className="w-3.5 h-3.5" />
            UNDER PRICING DESK REVIEW
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/30 text-xs font-mono font-bold uppercase">
            <XCircle className="w-3.5 h-3.5" />
            CANCELLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/30 text-xs font-mono font-bold uppercase">
            <Clock className="w-3.5 h-3.5" />
            PENDING REVIEW
          </span>
        );
    }
  };

  const getServiceIcon = (serviceMode: string) => {
    switch (serviceMode) {
      case 'Air Freight':
        return <Plane className="w-5 h-5 text-[#0066FF]" />;
      case 'Ocean Freight':
        return <Ship className="w-5 h-5 text-[#0066FF]" />;
      case 'Road Transport':
        return <Truck className="w-5 h-5 text-[#0066FF]" />;
      default:
        return <Network className="w-5 h-5 text-[#0066FF]" />;
    }
  };

  const currency = quote?.pricing?.currency || 'USD';
  const totalAmount = quote?.pricing?.totalAmount ?? quote?.estimatedCostUsd ?? 0;
  const lineItems = quote?.pricing?.lineItems || [];
  const subtotal = quote?.pricing?.subtotal ?? totalAmount;
  const discountTotal = quote?.pricing?.discountTotal || 0;
  const taxTotal = quote?.pricing?.taxTotal || 0;
  const validUntil = quote?.validUntil || quote?.pricing?.validUntil;
  const transitDays = quote?.pricing?.transitTimeDays || quote?.estimatedTransitDays || 3;

  return (
    <div className="pt-28 pb-24 bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white min-h-screen transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2 text-xs font-mono-tech text-slate-500 dark:text-gray-400">
            <Link to="/quote" className="hover:text-[#0066FF] transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quote Calculator</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-900 dark:text-white font-bold">
              {quote ? `Quote #${quote.referenceNumber || quote.id.toUpperCase()}` : 'Lookup Portal'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {quote && (
              <button
                type="button"
                onClick={() => setShowPrintModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#070D1D] hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[#0066FF]" />
                <span>Print / Save PDF</span>
              </button>
            )}

            <Link
              to="/quote"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              <span>New Rate Request</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Lookup / Search Bar if not found or searching */}
        {(!queryRef || notFound) && (
          <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-3xl p-8 sm:p-12 shadow-xl max-w-2xl mx-auto text-center space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-[#0066FF]/10 text-[#0066FF] flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7" />
            </div>

            <div>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-slate-950 dark:text-white uppercase tracking-tight">
                Track &amp; View Your Rate Quote
              </h2>
              <p className="mt-2 text-slate-600 dark:text-gray-400 text-xs sm:text-sm font-light">
                Enter your unique quote reference (e.g., <code className="text-[#0066FF] font-bold">QT-2026-00124</code>) provided upon initial submission or in your email.
              </p>
            </div>

            {notFound && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 rounded-2xl text-rose-600 dark:text-rose-300 text-xs font-mono-tech flex items-center gap-2 text-left">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>
                  No quote found matching reference <strong>"{queryRef}"</strong>. Please check your reference code or contact operations support.
                </span>
              </div>
            )}

            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Reference (e.g. QT-2026-00124)"
                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-xl text-xs font-mono-tech uppercase text-slate-900 dark:text-white focus:outline-none focus:border-[#0066FF]"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Lookup Quote
              </button>
            </form>
          </div>
        )}

        {/* Loading State */}
        {loading && queryRef && (
          <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-3xl p-16 text-center space-y-4 shadow-xl">
            <div className="w-10 h-10 border-3 border-[#0066FF] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="font-mono-tech text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider">
              Retrieving Official Tariff Proposal #{queryRef}...
            </div>
          </div>
        )}

        {/* Success Action Notification Banner */}
        {actionSuccessMessage && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/40 rounded-2xl text-emerald-700 dark:text-emerald-300 font-mono-tech text-xs flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>{actionSuccessMessage}</span>
            </div>
            <button
              onClick={() => setActionSuccessMessage(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Quote View */}
        {!loading && quote && (
          <div className="space-y-8">
            {/* Top Banner Card with Reference & Status */}
            <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono-tech text-xs text-slate-500 dark:text-gray-400 uppercase">
                      OFFICIAL RATE QUOTATION
                    </span>
                    {getStatusBadge(quote.status)}
                  </div>

                  <h1 className="font-heading font-black text-2xl sm:text-4xl text-slate-950 dark:text-white uppercase tracking-tight">
                    REF: #{quote.referenceNumber || quote.id.toUpperCase()}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono-tech text-slate-600 dark:text-gray-400">
                    <span>
                      Requested:{' '}
                      <strong className="text-slate-900 dark:text-white">
                        {new Date(quote.createdAt).toLocaleDateString()}
                      </strong>
                    </span>
                    {validUntil && (
                      <span className={`${isExpired() ? 'text-rose-500 font-bold' : 'text-slate-600 dark:text-gray-400'}`}>
                        Valid Until: <strong className="text-slate-900 dark:text-white">{validUntil}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Status-specific Callout Banner or Live Shipment Link */}
                <div className="bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/5 rounded-2xl p-4 sm:p-5 md:max-w-md text-left space-y-2">
                  {quote.status === 'Accepted' ? (
                    <div>
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-heading font-bold text-xs uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Proposal Formally Accepted</span>
                      </div>
                      <p className="text-[11px] font-mono-tech text-slate-600 dark:text-gray-400 mt-1">
                        Accepted on {quote.acceptedAt ? new Date(quote.acceptedAt).toLocaleDateString() : 'recently'}{' '}
                        {quote.acceptedByName ? `by ${quote.acceptedByName}` : ''}.
                      </p>

                      {quote.convertedTrackingNumber ? (
                        <div className="pt-2">
                          <Link
                            to={`/tracking?q=${quote.convertedTrackingNumber}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
                          >
                            <span>Track Live Shipment #{quote.convertedTrackingNumber}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      ) : (
                        <div className="text-[10px] font-mono-tech text-[#0066FF] dark:text-[#38bdf8] pt-1">
                          ● Operations desk is provisioning waybill dispatch.
                        </div>
                      )}
                    </div>
                  ) : quote.status === 'Declined' ? (
                    <div>
                      <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-heading font-bold text-xs uppercase tracking-wider">
                        <XCircle className="w-4 h-4" />
                        <span>Proposal Declined</span>
                      </div>
                      <p className="text-[11px] font-mono-tech text-slate-600 dark:text-gray-400 mt-1">
                        {quote.declinedReason || 'Declined by client.'}
                      </p>
                      <div className="pt-2">
                        <Link
                          to="/quote"
                          className="inline-flex items-center gap-1 text-xs font-mono-tech text-[#0066FF] dark:text-[#38bdf8] hover:underline"
                        >
                          <span>Request Refreshed Tariff</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ) : quote.status === 'Sent' ? (
                    <div>
                      <div className="flex items-center gap-2 text-[#0066FF] dark:text-[#38bdf8] font-heading font-bold text-xs uppercase tracking-wider">
                        <Sparkles className="w-4 h-4" />
                        <span>Formal Pricing Ready</span>
                      </div>
                      <p className="text-[11px] font-mono-tech text-slate-600 dark:text-gray-400 mt-1">
                        Review the itemized charges below. You may lock capacity by accepting online.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-heading font-bold text-xs uppercase tracking-wider">
                        <Clock className="w-4 h-4" />
                        <span>Pricing Desk Assessment</span>
                      </div>
                      <p className="text-[11px] font-mono-tech text-slate-600 dark:text-gray-400 mt-1">
                        Our routing specialists are calculating binding capacity rates. You will receive an email upon dispatch.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Grid: Consignment Overview & Pricing Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Route, Customer & Cargo Details */}
              <div className="lg:col-span-7 space-y-6">
                {/* Route Corridors */}
                <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                    <span className="font-heading font-bold text-xs uppercase text-slate-500 dark:text-gray-400">
                      ROUTING &amp; MODALITY
                    </span>
                    <div className="flex items-center gap-1.5 font-mono-tech text-xs font-bold text-[#0066FF] dark:text-[#38bdf8]">
                      {getServiceIcon(quote.service)}
                      <span>{quote.service}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono-tech text-xs">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/5 space-y-1">
                      <span className="text-slate-400 text-[10px] uppercase block">ORIGIN CORRIDOR</span>
                      <div className="text-base font-bold text-slate-900 dark:text-white">
                        {quote.originCity}, {quote.originCountry}
                      </div>
                      {quote.originAddress && (
                        <div className="text-[11px] text-slate-500">{quote.originAddress}</div>
                      )}
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/5 space-y-1">
                      <span className="text-slate-400 text-[10px] uppercase block">DESTINATION CORRIDOR</span>
                      <div className="text-base font-bold text-slate-900 dark:text-white">
                        {quote.destCity}, {quote.destCountry}
                      </div>
                      {quote.destAddress && (
                        <div className="text-[11px] text-slate-500">{quote.destAddress}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-xs font-mono-tech text-slate-600 dark:text-gray-400">
                    <span>Estimated Transit Velocity:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {transitDays} Business Days
                    </span>
                  </div>
                </div>

                {/* Cargo Specifications */}
                <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                    <span className="font-heading font-bold text-xs uppercase text-slate-500 dark:text-gray-400">
                      CARGO &amp; CONSIGNMENT SPECIFICATIONS
                    </span>
                    <Package className="w-4 h-4 text-slate-400" />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-tech text-xs">
                    <div className="p-3 bg-slate-50 dark:bg-[#0D1527] rounded-xl border border-slate-200 dark:border-white/5">
                      <span className="text-[10px] text-slate-400 uppercase block">GROSS WEIGHT</span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {quote.weightKg.toLocaleString()} KG
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-[#0D1527] rounded-xl border border-slate-200 dark:border-white/5">
                      <span className="text-[10px] text-slate-400 uppercase block">DIMENSIONS</span>
                      <span className="font-bold text-slate-900 dark:text-white text-xs">
                        {quote.dimensions?.lengthCm}x{quote.dimensions?.widthCm}x{quote.dimensions?.heightCm} cm
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-[#0D1527] rounded-xl border border-slate-200 dark:border-white/5">
                      <span className="text-[10px] text-slate-400 uppercase block">VOLUME</span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {quote.volumeCbm ? `${quote.volumeCbm.toFixed(2)} CBM` : `${(((quote.dimensions?.lengthCm || 1) * (quote.dimensions?.widthCm || 1) * (quote.dimensions?.heightCm || 1)) / 1000000).toFixed(2)} CBM`}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-[#0D1527] rounded-xl border border-slate-200 dark:border-white/5">
                      <span className="text-[10px] text-slate-400 uppercase block">PACKAGE TYPE</span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {quote.packageType || 'Crates / Cartons'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 font-mono-tech text-xs">
                    <span className="text-[10px] text-slate-400 uppercase">COMMODITY DESCRIPTION:</span>
                    <div className="text-slate-800 dark:text-gray-200 font-bold">
                      {quote.cargoDescription || quote.cargoType}
                    </div>
                  </div>

                  {quote.specialRequirements && quote.specialRequirements.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5 font-mono-tech text-xs">
                      <span className="text-[10px] text-slate-400 uppercase block">SPECIAL HANDLING COMPLIANCE:</span>
                      <div className="flex flex-wrap gap-2">
                        {quote.specialRequirements.map((req, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-[#0D1527] border border-blue-200 dark:border-white/10 text-[#0066FF] dark:text-[#38bdf8] font-bold text-[11px]"
                          >
                            ✓ {req}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Activity & History Log */}
                {quote.activityLog && quote.activityLog.length > 0 && (
                  <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                      <span className="font-heading font-bold text-xs uppercase text-slate-500 dark:text-gray-400">
                        AUDIT TRAIL &amp; WORKFLOW HISTORY
                      </span>
                      <Clock className="w-4 h-4 text-slate-400" />
                    </div>

                    <div className="space-y-3 font-mono-tech text-xs">
                      {quote.activityLog.map((act) => (
                        <div
                          key={act.id}
                          className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-100 dark:border-white/5"
                        >
                          <div className="w-2 h-2 rounded-full bg-[#0066FF] mt-1.5 shrink-0"></div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-bold text-slate-900 dark:text-white uppercase">
                                {act.action}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(act.timestamp).toLocaleString()}
                              </span>
                            </div>
                            {act.details && (
                              <p className="text-[11px] text-slate-600 dark:text-gray-400 mt-0.5">
                                {act.details}
                              </p>
                            )}
                            <div className="text-[10px] text-slate-400 mt-1">
                              Actor: {act.actor} {act.actorName ? `(${act.actorName})` : ''}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Itemized Pricing Breakdown & Acceptance Actions */}
              <div className="lg:col-span-5 space-y-6 sticky top-28">
                <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
                    <span className="font-heading font-bold text-xs uppercase text-slate-500 dark:text-gray-400">
                      PRICE SPECIFICATION
                    </span>
                    <span className="font-mono-tech text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">
                      {quote.pricing ? 'BINDING TARIFF' : 'ESTIMATED TARIFF'}
                    </span>
                  </div>

                  {/* Main Total Display */}
                  <div>
                    <div className="text-xs font-mono-tech text-slate-500 dark:text-gray-400 uppercase">
                      TOTAL ALLOCATED FREIGHT TARIFF
                    </div>
                    <div className="font-heading font-black text-3xl sm:text-4xl text-slate-950 dark:text-white mt-1 flex items-baseline gap-2">
                      <span>{currency} {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      <span className="text-xs font-normal text-slate-500 dark:text-gray-400">{currency}</span>
                    </div>
                    {quote.pricing?.paymentTerms && (
                      <div className="text-[11px] font-mono-tech text-slate-500 dark:text-gray-400 mt-1">
                        Terms: {quote.pricing.paymentTerms}
                      </div>
                    )}
                  </div>

                  {/* Itemized Line Items Breakdown */}
                  {lineItems.length > 0 ? (
                    <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-white/10 font-mono-tech text-xs">
                      <span className="text-[10px] text-slate-400 uppercase block mb-1">
                        ITEMIZED CHARGES:
                      </span>
                      <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-60 overflow-y-auto pr-1">
                        {lineItems.map((item, i) => (
                          <div key={item.id || i} className="py-2 flex justify-between items-start gap-2">
                            <div>
                              <div className="font-bold text-slate-800 dark:text-gray-200 text-[11px]">
                                {item.description}
                              </div>
                              <div className="text-[9px] uppercase text-slate-400">{item.category}</div>
                            </div>
                            <div className={`font-bold shrink-0 ${item.amount < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                              {item.amount < 0 ? '-' : ''}{currency} {Math.abs(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Subtotals & Taxes */}
                      <div className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-1 text-[11px]">
                        <div className="flex justify-between text-slate-500 dark:text-gray-400">
                          <span>Subtotal:</span>
                          <span className="text-slate-900 dark:text-white font-bold">{currency} {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        {discountTotal > 0 && (
                          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                            <span>Discount:</span>
                            <span>-{currency} {discountTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        )}
                        {taxTotal > 0 && (
                          <div className="flex justify-between text-slate-500 dark:text-gray-400">
                            <span>Duties &amp; Taxes:</span>
                            <span className="text-slate-900 dark:text-white font-bold">+{currency} {taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 dark:bg-[#0D1527] rounded-xl border border-slate-200 dark:border-white/5 font-mono-tech text-xs text-slate-600 dark:text-gray-400">
                      Standard freight rate calculation applied. Itemized breakdown will be finalized upon dispatch.
                    </div>
                  )}

                  {/* Pricing notes if any */}
                  {quote.pricing?.pricingNotes && (
                    <div className="p-3 bg-blue-50/50 dark:bg-[#0066FF]/10 rounded-xl border border-blue-200 dark:border-[#0066FF]/20 font-mono-tech text-[11px] text-slate-700 dark:text-gray-300">
                      <strong className="text-[#0066FF] dark:text-[#38bdf8] uppercase">Desk Note: </strong>
                      <span>{quote.pricing.pricingNotes}</span>
                    </div>
                  )}

                  {/* Primary Customer Actions (Accept / Decline) */}
                  <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-3">
                    {quote.status === 'Sent' && !isExpired() && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setShowAcceptModal(true)}
                          className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Accept Quote</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowDeclineModal(true)}
                          className="py-3.5 px-4 bg-slate-100 dark:bg-white/10 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 text-slate-700 dark:text-gray-300 font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition-all border border-slate-200 dark:border-white/10 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Decline</span>
                        </button>
                      </div>
                    )}

                    {isExpired() && (
                      <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 rounded-2xl space-y-2 text-center">
                        <div className="text-rose-600 dark:text-rose-400 font-heading font-bold text-xs uppercase">
                          Quote Expired on {quote.validUntil}
                        </div>
                        <p className="text-[11px] font-mono-tech text-slate-600 dark:text-gray-400">
                          Capacity and spot rate parameters have expired. Request an updated quote to lock current carrier rates.
                        </p>
                        <Link
                          to="/quote"
                          className="inline-block px-4 py-2 bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                        >
                          Request Updated Rate
                        </Link>
                      </div>
                    )}

                    {quote.status === 'Accepted' && (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/40 rounded-2xl space-y-2 text-center">
                        <div className="text-emerald-600 dark:text-emerald-400 font-heading font-bold text-xs uppercase flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Binding Proposal Locked</span>
                        </div>
                        <p className="text-[11px] font-mono-tech text-slate-600 dark:text-gray-400">
                          Thank you for choosing NEXORA. Your consignment is queued for carrier booking.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accept Quote Modal */}
      <AnimatePresence>
        {showAcceptModal && quote && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white uppercase">
                      Confirm Formal Quote Acceptance
                    </h3>
                    <div className="font-mono-tech text-[10px] text-slate-500">
                      REF: #{quote.referenceNumber || quote.id.toUpperCase()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowAcceptModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAcceptSubmit} className="space-y-4 font-mono-tech text-xs">
                <div className="p-4 bg-slate-50 dark:bg-[#0D1527] rounded-xl border border-slate-200 dark:border-white/5 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Agreed Tariff:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {currency} {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Corridor:</span>
                    <span className="text-slate-900 dark:text-white font-bold">{quote.originCity} → {quote.destCity}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-700 dark:text-gray-300 font-bold uppercase">
                    Authorized Signer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={acceptName}
                    onChange={(e) => setAcceptName(e.target.value)}
                    placeholder="Full Name of Authorized Representative"
                    className="w-full bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-700 dark:text-gray-300 font-bold uppercase">
                    Purchase Order # / Operational Delivery Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={acceptNotes}
                    onChange={(e) => setAcceptNotes(e.target.value)}
                    placeholder="e.g. PO-849204, delivery window 08:00 - 16:00 CET"
                    className="w-full bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                <div className="p-3 bg-blue-50 dark:bg-[#0066FF]/10 rounded-xl border border-blue-200 dark:border-[#0066FF]/20 text-[10px] text-slate-600 dark:text-gray-400">
                  By confirming, you authorize NEXORA Global Logistics to secure vessel/flight allocation under standard IATA/FIATA commercial trading terms.
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAcceptModal(false)}
                    className="flex-1 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-800 dark:text-gray-200 rounded-xl font-heading font-bold text-xs uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-heading font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <span>Processing...</span>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Acceptance</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Decline Quote Modal */}
      <AnimatePresence>
        {showDeclineModal && quote && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                    <XCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white uppercase">
                      Decline Rate Proposal
                    </h3>
                    <div className="font-mono-tech text-[10px] text-slate-500">
                      REF: #{quote.referenceNumber || quote.id.toUpperCase()}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeclineModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleDeclineSubmit} className="space-y-4 font-mono-tech text-xs">
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-700 dark:text-gray-300 font-bold uppercase">
                    Primary Reason for Declining *
                  </label>
                  <select
                    value={declineReasonCategory}
                    onChange={(e) => setDeclineReasonCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-[#0066FF]"
                  >
                    <option value="Price exceeds budgeted tariff">Price exceeds budgeted tariff</option>
                    <option value="Transit time is longer than required">Transit time is longer than required</option>
                    <option value="Project / Shipment schedule altered or cancelled">Project / Shipment schedule altered or cancelled</option>
                    <option value="Selected alternate carrier / service provider">Selected alternate carrier / service provider</option>
                    <option value="Incoterms or cargo specifications changed">Incoterms or cargo specifications changed</option>
                    <option value="Other reason">Other reason</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-700 dark:text-gray-300 font-bold uppercase">
                    Additional Comments or Target Budget (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={declineCustomReason}
                    onChange={(e) => setDeclineCustomReason(e.target.value)}
                    placeholder="e.g. Target budget is $12,500 USD. Let us know if alternate routing is possible."
                    className="w-full bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeclineModal(false)}
                    className="flex-1 py-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-800 dark:text-gray-200 rounded-xl font-heading font-bold text-xs uppercase cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-heading font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? <span>Processing...</span> : <span>Confirm Decline</span>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Printable PDF Modal */}
      {showPrintModal && quote && (
        <PrintableQuoteDossier
          quote={quote}
          isModal={true}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
};
