import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Search, 
  Trash2, 
  CheckCircle2, 
  DollarSign, 
  Clock, 
  ArrowRight,
  Mail,
  Phone,
  Building2,
  Calendar,
  Zap,
  PackagePlus,
  Send,
  Printer,
  Plus,
  Minus,
  Edit3,
  X,
  XCircle,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  RotateCcw,
  Sparkles,
  Plane,
  Ship,
  Truck,
  Network,
  Copy,
  Check
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { emailService, EmailMessageRecord } from '../../services/emailService';
import { 
  QuoteRequest, 
  QuoteStatus, 
  QuoteChargeItem, 
  QuotePriceBreakdown,
  QuoteChargeCategory
} from '../../types';
import { StatusBadge } from '../components/StatusBadge';
import { updatePageSeo } from '../../services/seoService';
import { PrintableQuoteDossier } from '../../components/quote/PrintableQuoteDossier';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { useToast } from '../../context/ToastContext';

export const QuotesAdminPage: React.FC = () => {
  const toast = useToast();
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal / Drawer states
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [showPriceBuilder, setShowPriceBuilder] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showSentEmailModal, setShowSentEmailModal] = useState(false);
  const [lastSentEmailUrl, setLastSentEmailUrl] = useState('');
  const [lastSentEmailRecord, setLastSentEmailRecord] = useState<EmailMessageRecord | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmailText, setCopiedEmailText] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; clientName: string; refNumber?: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Price builder edit states
  const [builderCurrency, setBuilderCurrency] = useState('USD');
  const [builderLineItems, setBuilderLineItems] = useState<QuoteChargeItem[]>([]);
  const [builderValidUntil, setBuilderValidUntil] = useState('');
  const [builderTransitDays, setBuilderTransitDays] = useState(3);
  const [builderPaymentTerms, setBuilderPaymentTerms] = useState('Net 30 Days / Bank Wire');
  const [builderPricingNotes, setBuilderPricingNotes] = useState('');
  const [builderInternalNotes, setBuilderInternalNotes] = useState('');
  const [isSending, setIsSending] = useState(false);

  const loadQuotes = () => {
    setQuotes(storageService.getQuotes());
  };

  useEffect(() => {
    updatePageSeo({
      title: 'Freight Rate Quotes & Pricing Desk | NEXORA Admin',
      description: 'Review quote submissions, construct itemized multi-currency tariff breakdowns, dispatch formal proposals, and manage customer acceptances.',
    });
    loadQuotes();

    // Subscribe to real-time Firestore database updates
    const unsubscribe = storageService.subscribeToQuotes((liveQuotes) => {
      setQuotes(liveQuotes);
      if (selectedQuote) {
        const updated = liveQuotes.find((q) => q.id === selectedQuote.id);
        if (updated) setSelectedQuote(updated);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleStatusChange = (id: string, newStatus: QuoteStatus) => {
    storageService.updateQuoteStatus(id, newStatus);
    loadQuotes();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await storageService.deleteQuote(deleteTarget.id);
      loadQuotes();
      if (selectedQuote?.id === deleteTarget.id) {
        setSelectedQuote(null);
        setShowPriceBuilder(false);
      }
      toast.success(`Quote request ${deleteTarget.refNumber || deleteTarget.id} has been removed.`, 'Quote Deleted');
      setDeleteTarget(null);
    } catch (err) {
      console.error('Failed to delete quote:', err);
      toast.error('Failed to delete quote request from database.', 'Delete Failed');
    } finally {
      setIsDeleting(false);
    }
  };

  // Open Price Builder & Drawer for a Quote
  const openPriceBuilder = (quote: QuoteRequest) => {
    setSelectedQuote(quote);

    const currency = quote.pricing?.currency || 'USD';
    setBuilderCurrency(currency);

    const existingItems = quote.pricing?.lineItems;
    if (existingItems && existingItems.length > 0) {
      setBuilderLineItems(JSON.parse(JSON.stringify(existingItems)));
    } else {
      // Generate standard starting line items from quote estimate
      const baseFreight = quote.estimatedCostUsd ? Math.round(quote.estimatedCostUsd * 0.75) : 3500;
      const fuel = Math.round(baseFreight * 0.12);
      const handling = 350;
      const customs = 250;
      const insurance = 180;

      setBuilderLineItems([
        {
          id: `item-${Date.now()}-1`,
          category: 'freight',
          description: `${quote.service} Standard Linehaul (${quote.originCity} → ${quote.destCity})`,
          amount: baseFreight,
        },
        {
          id: `item-${Date.now()}-2`,
          category: 'fuel',
          description: 'Fuel Surcharge & Bunker Adjustment Factor (BAF/FSC)',
          amount: fuel,
        },
        {
          id: `item-${Date.now()}-3`,
          category: 'handling',
          description: 'Airport/Port Terminal Handling Charges (THC)',
          amount: handling,
        },
        {
          id: `item-${Date.now()}-4`,
          category: 'customs',
          description: 'Export Declarations & Customs Brokerage Formalities',
          amount: customs,
        },
        {
          id: `item-${Date.now()}-5`,
          category: 'insurance',
          description: 'All-Risk Marine / Cargo Transit Insurance',
          amount: insurance,
        },
      ]);
    }

    const defaultExpiry = quote.validUntil || quote.pricing?.validUntil || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setBuilderValidUntil(defaultExpiry);
    setBuilderTransitDays(quote.pricing?.transitTimeDays || quote.estimatedTransitDays || 3);
    setBuilderPaymentTerms(quote.pricing?.paymentTerms || 'Net 30 Days on Approved Credit / Pre-Departure Settlement');
    setBuilderPricingNotes(quote.pricing?.pricingNotes || 'Standard capacity allocation locked upon confirmation. Subject to carrier space availability.');
    setBuilderInternalNotes(quote.internalAdminNotes || '');

    setShowPriceBuilder(true);
  };

  // Pricing calculations
  const subtotal = builderLineItems
    .filter((item) => item.category !== 'discount' && item.category !== 'tax')
    .reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

  const discountTotal = Math.abs(
    builderLineItems
      .filter((item) => item.category === 'discount')
      .reduce((acc, item) => acc + (Number(item.amount) || 0), 0)
  );

  const taxTotal = builderLineItems
    .filter((item) => item.category === 'tax')
    .reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

  const calculatedTotal = subtotal - discountTotal + taxTotal;

  // Add line item in builder
  const handleAddLineItem = () => {
    setBuilderLineItems([
      ...builderLineItems,
      {
        id: `item-${Date.now()}`,
        category: 'other',
        description: 'Value Added Logistics Service',
        amount: 150,
      },
    ]);
  };

  // Remove line item
  const handleRemoveLineItem = (index: number) => {
    setBuilderLineItems(builderLineItems.filter((_, i) => i !== index));
  };

  // Update line item
  const handleUpdateLineItem = (index: number, field: keyof QuoteChargeItem, value: any) => {
    const updated = [...builderLineItems];
    updated[index] = { ...updated[index], [field]: value };
    setBuilderLineItems(updated);
  };

  // Save Pricing Draft
  const handleSaveDraft = () => {
    if (!selectedQuote) return;

    const pricingData: QuotePriceBreakdown = {
      currency: builderCurrency,
      lineItems: builderLineItems,
      subtotal,
      discountTotal,
      taxTotal,
      totalAmount: calculatedTotal,
      validUntil: builderValidUntil,
      transitTimeDays: builderTransitDays,
      paymentTerms: builderPaymentTerms,
      pricingNotes: builderPricingNotes,
    };

    const updated = storageService.updateQuote(
      selectedQuote.id,
      {
        pricing: pricingData,
        validUntil: builderValidUntil,
        status: selectedQuote.status === 'Pending Review' ? 'Under Review' : selectedQuote.status,
        internalAdminNotes: builderInternalNotes,
      },
      'Admin',
      'Pricing draft saved by rate specialist'
    );

    if (updated) {
      setSelectedQuote(updated);
      loadQuotes();
      toast.success(
        `Pricing proposal for ${updated.referenceNumber || updated.id} saved as draft (${builderCurrency} ${calculatedTotal.toLocaleString()}).`,
        'Rate Proposal Saved'
      );
    } else {
      toast.error('Could not save pricing draft. Please try again.', 'Save Failed');
    }
  };

  // Send Official Quote to Customer
  const handleSendQuote = () => {
    if (!selectedQuote) return;

    setIsSending(true);

    const pricingData: QuotePriceBreakdown = {
      currency: builderCurrency,
      lineItems: builderLineItems,
      subtotal,
      discountTotal,
      taxTotal,
      totalAmount: calculatedTotal,
      validUntil: builderValidUntil,
      transitTimeDays: builderTransitDays,
      paymentTerms: builderPaymentTerms,
      pricingNotes: builderPricingNotes,
    };

    setTimeout(() => {
      const updated = storageService.sendQuoteToCustomer(
        selectedQuote.id,
        pricingData,
        builderValidUntil,
        builderInternalNotes
      );

      if (updated) {
        // Dispatch professional email
        const emailRec = emailService.sendOfficialQuoteToCustomer(updated, builderPricingNotes);
        const customerUrl = emailService.getQuoteCustomerUrl(updated);
        setLastSentEmailUrl(customerUrl);
        setLastSentEmailRecord(emailRec);

        setSelectedQuote(updated);
        loadQuotes();
        setIsSending(false);
        setShowSentEmailModal(true);
        toast.success(
          `Official quotation dispatched to ${updated.email} (${updated.referenceNumber || updated.id}).`,
          'Quote Dispatched'
        );
      } else {
        setIsSending(false);
        toast.error('Failed to send quotation. Please review the line items and try again.', 'Dispatch Failed');
      }
    }, 600);
  };

  const copyCustomerUrl = () => {
    if (lastSentEmailUrl) {
      navigator.clipboard.writeText(lastSentEmailUrl);
      setCopiedLink(true);
      toast.info('Direct quote portal link copied to clipboard.', 'Link Copied');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Metrics
  const totalSubmissions = quotes.length;
  const pendingCount = quotes.filter((q) => q.status === 'Pending Review' || q.status === 'Pending' || q.status === 'Under Review' || q.status === 'Reviewing').length;
  const sentCount = quotes.filter((q) => q.status === 'Sent' || q.status === 'Quoted').length;
  const acceptedQuotes = quotes.filter((q) => q.status === 'Accepted' || q.status === 'Booked');
  const acceptedValue = acceptedQuotes.reduce((acc, q) => acc + (q.pricing?.totalAmount || q.estimatedCostUsd || 0), 0);
  const conversionRate = totalSubmissions > 0 ? Math.round((acceptedQuotes.length / totalSubmissions) * 100) : 0;

  const filteredQuotes = quotes.filter((q) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      q.fullName.toLowerCase().includes(query) ||
      q.companyName.toLowerCase().includes(query) ||
      q.email.toLowerCase().includes(query) ||
      q.originCity.toLowerCase().includes(query) ||
      q.destCity.toLowerCase().includes(query) ||
      q.service.toLowerCase().includes(query) ||
      (q.referenceNumber && q.referenceNumber.toLowerCase().includes(query)) ||
      (q.cargoType && q.cargoType.toLowerCase().includes(query));

    const matchesStatus =
      statusFilter === 'ALL' ||
      q.status === statusFilter ||
      (statusFilter === 'Pending Review' && (q.status === 'Pending' || q.status === 'Pending Review')) ||
      (statusFilter === 'Under Review' && (q.status === 'Reviewing' || q.status === 'Under Review')) ||
      (statusFilter === 'Sent' && (q.status === 'Quoted' || q.status === 'Sent')) ||
      (statusFilter === 'Accepted' && (q.status === 'Booked' || q.status === 'Accepted'));

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-950 dark:text-white uppercase tracking-tight">
            Freight Rate Pricing Desk &amp; Quotes
          </h1>
          <p className="text-slate-600 dark:text-gray-400 text-xs font-mono-tech mt-1">
            Build itemized rate tariffs, dispatch formal proposals to enterprise clients, and track customer acceptances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/quote"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-[#070D1D] hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
          >
            <span>Customer Form</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#0066FF]" />
          </Link>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 font-mono-tech text-xs">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 space-y-1 shadow-sm">
          <div className="text-slate-500 uppercase text-[10px] flex items-center justify-between">
            <span>TOTAL QUOTES</span>
            <FileText className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-heading font-black text-slate-900 dark:text-white">
            {totalSubmissions}
          </div>
          <div className="text-[10px] text-slate-400">All-time submissions</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#070D1D] border border-amber-500/30 bg-amber-500/5 space-y-1 shadow-sm">
          <div className="text-amber-600 dark:text-amber-400 uppercase text-[10px] flex items-center justify-between font-bold">
            <span>ACTION REQUIRED</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-heading font-black text-amber-600 dark:text-amber-400">
            {pendingCount}
          </div>
          <div className="text-[10px] text-slate-400">Pending pricing review</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#070D1D] border border-blue-500/30 bg-blue-500/5 space-y-1 shadow-sm">
          <div className="text-[#0066FF] dark:text-[#38bdf8] uppercase text-[10px] flex items-center justify-between font-bold">
            <span>PROPOSALS SENT</span>
            <Send className="w-3.5 h-3.5 text-[#0066FF]" />
          </div>
          <div className="text-2xl font-heading font-black text-[#0066FF] dark:text-[#38bdf8]">
            {sentCount}
          </div>
          <div className="text-[10px] text-slate-400">Awaiting client sign-off</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#070D1D] border border-emerald-500/30 bg-emerald-500/5 space-y-1 shadow-sm">
          <div className="text-emerald-600 dark:text-emerald-400 uppercase text-[10px] flex items-center justify-between font-bold">
            <span>ACCEPTED PIPELINE</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-heading font-black text-emerald-600 dark:text-emerald-400 truncate">
            ${acceptedValue.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400">{acceptedQuotes.length} contracts signed</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 space-y-1 shadow-sm col-span-2 lg:col-span-1">
          <div className="text-slate-500 uppercase text-[10px] flex items-center justify-between">
            <span>WIN CONVERSION</span>
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-heading font-black text-slate-900 dark:text-white">
            {conversionRate}%
          </div>
          <div className="text-[10px] text-slate-400">Quote-to-booking ratio</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 font-mono-tech text-xs">
        <div className="md:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by quote ref (#QT-2026-XXXXX), client name, company, email, corridor, cargo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#0066FF]"
          />
        </div>
        <div className="md:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#0066FF]"
          >
            <option value="ALL">All Statuses ({quotes.length})</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Under Review">Under Review</option>
            <option value="Sent">Sent (Awaiting Acceptance)</option>
            <option value="Accepted">Accepted / Booked</option>
            <option value="Declined">Declined</option>
            <option value="Expired">Expired</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Quotes List */}
      {filteredQuotes.length === 0 ? (
        <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-3xl p-12 text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white uppercase">
            No Quotes Found
          </h3>
          <p className="text-slate-500 text-xs font-mono-tech">
            No submissions matched your search or status filter criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuotes.map((quote) => {
            const currency = quote.pricing?.currency || 'USD';
            const total = quote.pricing?.totalAmount ?? quote.estimatedCostUsd ?? 0;
            const ref = quote.referenceNumber || quote.id.toUpperCase();

            return (
              <div
                key={quote.id}
                className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 hover:border-[#0066FF]/40 transition-all"
              >
                {/* Header info */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-4">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#0066FF]/10 text-[#0066FF] flex items-center justify-center font-bold shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono-tech text-xs font-bold text-[#0066FF] dark:text-[#38bdf8] bg-blue-50 dark:bg-[#0D1527] px-2 py-0.5 rounded border border-blue-200 dark:border-white/10">
                          #{ref}
                        </span>
                        <span className="font-heading font-black text-base text-slate-950 dark:text-white uppercase">
                          {quote.fullName}
                        </span>
                        <span className="font-mono-tech text-xs text-slate-500 dark:text-gray-400">
                          ({quote.companyName || 'Private Client'})
                        </span>
                      </div>
                      <div className="text-[11px] font-mono-tech text-slate-500 dark:text-gray-400 flex flex-wrap items-center gap-3 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[#0066FF]" />
                          {quote.email}
                        </span>
                        {quote.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-500" />
                            {quote.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3 h-3" />
                          {new Date(quote.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <StatusBadge status={quote.status} />

                    <select
                      value={quote.status}
                      onChange={(e) => handleStatusChange(quote.id, e.target.value as QuoteStatus)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs font-mono-tech text-slate-800 dark:text-gray-200 focus:outline-none"
                    >
                      <option value="Pending Review">Pending Review</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Sent">Sent (Awaiting Client)</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Declined">Declined</option>
                      <option value="Expired">Expired</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => openPriceBuilder(quote)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white/10 hover:bg-[#0066FF] text-white font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{quote.pricing ? 'Edit Pricing' : 'Build Pricing'}</span>
                    </button>

                    {/* Convert to Shipment */}
                    <Link
                      to={`/admin/shipments/new?quoteId=${quote.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-bold text-xs uppercase tracking-wider shadow-sm transition-all"
                      title="Dispatch this quote into a live tracking waybill"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>Dispatch Shipment</span>
                    </Link>

                    {/* Print / Dossier */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedQuote(quote);
                        setShowPrintModal(true);
                      }}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 cursor-pointer"
                      title="Print Official Quote Dossier"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() =>
                        setDeleteTarget({
                          id: quote.id,
                          clientName: quote.fullName,
                          refNumber: quote.referenceNumber,
                        })
                      }
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                      title="Delete Quote"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Specs and Pricing Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono-tech text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/5">
                    <span className="text-slate-400 text-[10px] uppercase block">CORRIDOR &amp; MODE</span>
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                      {quote.originCity} <ArrowRight className="w-3 h-3 text-[#0066FF]" /> {quote.destCity}
                    </span>
                    <span className="text-[10px] text-[#0066FF] dark:text-[#38bdf8] font-semibold block mt-0.5">
                      {quote.service}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/5">
                    <span className="text-slate-400 text-[10px] uppercase block">CARGO SPECIFICATIONS</span>
                    <span className="font-bold text-slate-900 dark:text-white block mt-0.5 truncate">
                      {quote.weightKg.toLocaleString()} KG • {quote.cargoType}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {quote.pieces || 1} pcs • {quote.dimensions?.lengthCm}x{quote.dimensions?.widthCm}x{quote.dimensions?.heightCm}cm
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/5">
                    <span className="text-slate-400 text-[10px] uppercase block">TARIFF PROPOSAL</span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="font-heading font-black text-sm text-emerald-600 dark:text-emerald-400">
                        {currency} {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-slate-400">{quote.pricing ? 'Binding' : 'Estimated'}</span>
                    </div>
                    {quote.validUntil && (
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Expires: {quote.validUntil}
                      </span>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/5 flex flex-col justify-between">
                    <span className="text-slate-400 text-[10px] uppercase block">CUSTOMER PORTAL LINK</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Link
                        to={`/quote/${ref}`}
                        target="_blank"
                        className="text-xs text-[#0066FF] dark:text-[#38bdf8] font-bold hover:underline flex items-center gap-1 truncate"
                      >
                        <span>View Portal</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </Link>
                    </div>
                    {quote.convertedTrackingNumber && (
                      <span className="text-[10px] text-emerald-600 font-bold block mt-1">
                        Waybill: #{quote.convertedTrackingNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Professional Price Builder & Quote Review Drawer/Modal */}
      <AnimatePresence>
        {showPriceBuilder && selectedQuote && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
            <motion.div
              initial={{ opacity: 0, x: 400 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 400 }}
              className="bg-white dark:bg-[#070D1D] border-l border-slate-200 dark:border-white/10 w-full max-w-3xl h-full overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl flex flex-col justify-between"
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0066FF]/10 text-[#0066FF] flex items-center justify-center font-bold">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-heading font-black text-xl text-slate-950 dark:text-white uppercase">
                        Rate Proposal Builder
                      </h2>
                      <div className="font-mono-tech text-xs text-slate-500">
                        REF: #{selectedQuote.referenceNumber || selectedQuote.id.toUpperCase()} • {selectedQuote.service}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPriceBuilder(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Client & Consignment Specs Summary Banner */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/5 font-mono-tech text-xs grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-400 text-[10px] block">CLIENT:</span>
                    <strong className="text-slate-900 dark:text-white">{selectedQuote.fullName}</strong>
                    <div className="text-[11px] text-slate-500">{selectedQuote.companyName}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">CORRIDOR:</span>
                    <strong className="text-[#0066FF] dark:text-[#38bdf8]">
                      {selectedQuote.originCity} → {selectedQuote.destCity}
                    </strong>
                    <div className="text-[11px] text-slate-500">{selectedQuote.service}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">GROSS WEIGHT / VOL:</span>
                    <strong className="text-slate-900 dark:text-white">{selectedQuote.weightKg.toLocaleString()} KG</strong>
                    <div className="text-[11px] text-slate-500">
                      {selectedQuote.dimensions?.lengthCm}x{selectedQuote.dimensions?.widthCm}x{selectedQuote.dimensions?.heightCm} cm
                    </div>
                  </div>
                </div>

                {/* Status Switcher */}
                <div className="space-y-1.5 font-mono-tech text-xs">
                  <label className="text-slate-700 dark:text-gray-300 font-bold uppercase text-[11px]">
                    Quote Workflow Status:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Pending Review',
                      'Under Review',
                      'Sent',
                      'Accepted',
                      'Declined',
                      'Expired',
                      'Cancelled',
                    ].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          handleStatusChange(selectedQuote.id, st as QuoteStatus);
                          setSelectedQuote({ ...selectedQuote, status: st as QuoteStatus });
                        }}
                        className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold cursor-pointer transition-all ${
                          selectedQuote.status === st
                            ? 'bg-[#0066FF] text-white border-[#0066FF]'
                            : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Builder Form */}
                <div className="space-y-4 font-mono-tech text-xs pt-2 border-t border-slate-200 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-xs uppercase text-slate-900 dark:text-white">
                      Itemized Charge Breakdown
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[11px]">Currency:</span>
                      <select
                        value={builderCurrency}
                        onChange={(e) => setBuilderCurrency(e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#0D1527] border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CAD">CAD ($)</option>
                        <option value="AUD">AUD ($)</option>
                        <option value="SGD">SGD ($)</option>
                        <option value="CNY">CNY (¥)</option>
                        <option value="JPY">JPY (¥)</option>
                      </select>
                    </div>
                  </div>

                  {/* Line items list */}
                  <div className="space-y-2">
                    {builderLineItems.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/5 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                      >
                        <div className="sm:col-span-3">
                          <select
                            value={item.category}
                            onChange={(e) => handleUpdateLineItem(idx, 'category', e.target.value as QuoteChargeCategory)}
                            className="w-full bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-slate-800 dark:text-gray-200"
                          >
                            <option value="freight">Freight Linehaul</option>
                            <option value="fuel">Fuel Surcharge (BAF)</option>
                            <option value="handling">Handling (THC)</option>
                            <option value="insurance">Cargo Insurance</option>
                            <option value="customs">Customs Brokerage</option>
                            <option value="tax">Regulatory Taxes</option>
                            <option value="discount">Partner Discount (-)</option>
                            <option value="other">Other Charge</option>
                          </select>
                        </div>

                        <div className="sm:col-span-5">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleUpdateLineItem(idx, 'description', e.target.value)}
                            placeholder="Charge description"
                            className="w-full bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <input
                            type="number"
                            value={item.amount}
                            onChange={(e) => handleUpdateLineItem(idx, 'amount', Number(e.target.value))}
                            className="w-full bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white font-bold text-right"
                          />
                        </div>

                        <div className="sm:col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(idx)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 cursor-pointer"
                            title="Remove Charge"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-800 dark:text-gray-200 font-heading font-bold text-xs uppercase cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#0066FF]" />
                    <span>Add Line Item</span>
                  </button>

                  {/* Summary Totals */}
                  <div className="p-4 bg-slate-900 text-white rounded-2xl font-mono-tech text-xs space-y-2 mt-4">
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Subtotal:</span>
                      <span>{builderCurrency} {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    {discountTotal > 0 && (
                      <div className="flex justify-between text-emerald-400 text-[11px]">
                        <span>Discounts:</span>
                        <span>-{builderCurrency} {discountTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    {taxTotal > 0 && (
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Taxes &amp; Duties:</span>
                        <span>+{builderCurrency} {taxTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-white/10 text-base font-bold text-[#38bdf8]">
                      <span className="uppercase">Grand Total Tariff:</span>
                      <span>{builderCurrency} {calculatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {/* Operational Settings: Expiration, Transit & Terms */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Quote Validity Expiration Date</span>
                      <input
                        type="date"
                        value={builderValidUntil}
                        onChange={(e) => setBuilderValidUntil(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 uppercase font-bold">Est. Transit Time (Days)</span>
                      <input
                        type="number"
                        value={builderTransitDays}
                        onChange={(e) => setBuilderTransitDays(Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Payment Terms Clause</span>
                    <input
                      type="text"
                      value={builderPaymentTerms}
                      onChange={(e) => setBuilderPaymentTerms(e.target.value)}
                      placeholder="e.g. Net 30 Days / Pre-Departure Wire"
                      className="w-full bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Pricing Desk Notes (Visible in Customer Proposal)</span>
                    <textarea
                      rows={2}
                      value={builderPricingNotes}
                      onChange={(e) => setBuilderPricingNotes(e.target.value)}
                      placeholder="e.g. Capacity locked with Lufthansa Cargo Frankfurt hub."
                      className="w-full bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Internal Operational Notes (Admin Eyes Only)</span>
                    <textarea
                      rows={2}
                      value={builderInternalNotes}
                      onChange={(e) => setBuilderInternalNotes(e.target.value)}
                      placeholder="e.g. Margin checked with agent in Singapore. Approved by Lead."
                      className="w-full bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-800 dark:text-gray-200 font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  Save Pricing Draft
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPrintModal(true)}
                    className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 cursor-pointer"
                    title="Preview Official PDF"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleSendQuote}
                    disabled={isSending}
                    className="px-6 py-3 bg-[#0066FF] hover:bg-[#0052cc] text-white rounded-xl font-heading font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#0066FF]/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSending ? (
                      <span>Dispatching Proposal...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Proposal to Customer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quote Sent Confirmation & Link Modal */}
      <AnimatePresence>
        {showSentEmailModal && selectedQuote && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl text-center max-h-[90vh] overflow-y-auto"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h3 className="font-heading font-black text-xl sm:text-2xl text-slate-900 dark:text-white uppercase tracking-tight">
                  Official Proposal Dispatched!
                </h3>
                <p className="text-slate-600 dark:text-gray-400 text-xs font-mono-tech mt-1">
                  Email transmission formatted for <strong className="text-slate-900 dark:text-white">{selectedQuote.email}</strong>.
                </p>
              </div>

              {/* 1-Click Gmail Action & Email Details */}
              <div className="p-4 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 text-left font-mono-tech text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0066FF] dark:text-[#38bdf8] flex items-center gap-1.5 uppercase text-[11px]">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Customer Email Transmission</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    READY
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 dark:text-gray-300 leading-relaxed">
                  The proposal email has been logged and transmitted to the dispatch pipeline. You can also launch Gmail directly to send or preview the pre-populated proposal:
                </p>

                {lastSentEmailRecord?.gmailComposeUrl && (
                  <div className="pt-1 flex flex-wrap gap-2">
                    <a
                      href={lastSentEmailRecord.gmailComposeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EA4335] hover:bg-[#d93025] text-white text-xs font-bold transition-colors shadow-sm"
                      title="Open and send directly from your personal or work Gmail"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Open &amp; Send via Gmail (1-Click)</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        if (lastSentEmailRecord?.bodyText) {
                          navigator.clipboard.writeText(lastSentEmailRecord.bodyText);
                          setCopiedEmailText(true);
                          setTimeout(() => setCopiedEmailText(false), 2000);
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-800 dark:text-gray-200 text-xs font-bold transition-colors"
                    >
                      {copiedEmailText ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedEmailText ? 'Email Text Copied!' : 'Copy Proposal Text'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Customer Link Box */}
              <div className="p-4 bg-slate-50 dark:bg-[#0D1527] rounded-xl border border-slate-200 dark:border-white/5 text-left font-mono-tech text-xs space-y-2">
                <span className="text-slate-400 text-[10px] uppercase block">CUSTOMER VIEW &amp; ACCEPTANCE LINK:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={lastSentEmailUrl}
                    className="flex-1 bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-[11px] text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={copyCustomerUrl}
                    className="p-2 bg-[#0066FF] hover:bg-[#0052cc] text-white rounded-lg cursor-pointer"
                    title="Copy Link"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSentEmailModal(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-900 dark:text-white rounded-xl font-heading font-bold text-xs uppercase cursor-pointer"
                >
                  Close
                </button>
                <Link
                  to={`/quote/${selectedQuote.referenceNumber || selectedQuote.id}`}
                  target="_blank"
                  className="flex-1 py-3 bg-[#0066FF] hover:bg-[#0052cc] text-white rounded-xl font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                >
                  <span>Open Client Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Printable PDF Dossier Modal */}
      {showPrintModal && selectedQuote && (
        <PrintableQuoteDossier
          quote={selectedQuote}
          isModal={true}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {/* Persistent In-App Confirmation Modal for Quote Deletion */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        title="Delete Rate Quotation Request"
        description="Are you sure you want to permanently delete this quotation request? The associated tariff breakdown and customer records will be removed."
        itemName={deleteTarget ? `${deleteTarget.refNumber || deleteTarget.id} — ${deleteTarget.clientName}` : undefined}
        itemBadge="Rate Quotation"
        confirmText="Delete Quote Request"
      />
    </div>
  );
};
