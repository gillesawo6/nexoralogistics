import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { TransportMode, QuoteRequest } from '../types';
import { storageService } from '../services/storageService';
import { emailService, EmailMessageRecord } from '../services/emailService';
import { updatePageSeo } from '../services/seoService';
import { PrintableQuoteDossier } from '../components/quote/PrintableQuoteDossier';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { LocationPairSelector, LocationData } from '../components/common/LocationSelector';
import { 
  Calculator, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Box, 
  Plane, 
  Ship, 
  Truck, 
  Network, 
  RotateCcw, 
  Sparkles, 
  ExternalLink, 
  DollarSign, 
  Package, 
  Layers,
  Printer,
  Mail,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';

export const QuotePage: React.FC = () => {
  const toast = useToast();
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialService = (searchParams.get('service') as TransportMode) || 'Air Freight';

  const [service, setService] = useState<TransportMode>(initialService);
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [originCity, setOriginCity] = useState('');
  const [originCountry, setOriginCountry] = useState('China');
  const [originAddress, setOriginAddress] = useState('');
  const [destCity, setDestCity] = useState('');
  const [destCountry, setDestCountry] = useState('Netherlands');
  const [destAddress, setDestAddress] = useState('');
  const [cargoType, setCargoType] = useState('Electronics & Precision Instruments');
  const [packageType, setPackageType] = useState('Carton');
  const [pieces, setPieces] = useState<number>(4);
  const [weightKg, setWeightKg] = useState<number>(1200);
  const [lengthCm, setLengthCm] = useState<number>(120);
  const [widthCm, setWidthCm] = useState<number>(80);
  const [heightCm, setHeightCm] = useState<number>(100);
  const [declaredValue, setDeclaredValue] = useState<number>(45000);
  const [specialReqs, setSpecialReqs] = useState<string[]>(['Customs Brokerage Assistance']);
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedQuote, setSubmittedQuote] = useState<QuoteRequest | null>(null);
  const [submittedEmailRecord, setSubmittedEmailRecord] = useState<EmailMessageRecord | null>(null);
  const [emailDispatchResult, setEmailDispatchResult] = useState<{ success: boolean; delivered?: boolean; error?: string } | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  useEffect(() => {
    updatePageSeo({
      title: 'Instant Freight Rate Quote & Cost Calculator | NEXORA',
      description: 'Calculate instant spot freight estimates for Air, Ocean, and Road transport with volumetric weight analysis and carbon footprint calculations.',
    });
  }, []);

  // Calculate Volumetric Weight and Instant Price Estimate
  const volumeCbm = ((lengthCm * widthCm * heightCm) / 1000000);
  const volumetricWeightAir = (lengthCm * widthCm * heightCm) / 5000;
  const chargeableWeight = Math.max(weightKg, volumetricWeightAir);

  const calculateEstimate = () => {
    let baseRatePerKg = 4.2; // default
    let transitDays = 3;

    if (service === 'Air Freight') {
      baseRatePerKg = 6.8;
      transitDays = 2;
    } else if (service === 'Ocean Freight') {
      baseRatePerKg = 0.85;
      transitDays = 22;
    } else if (service === 'Road Transport') {
      baseRatePerKg = 1.9;
      transitDays = 4;
    } else {
      baseRatePerKg = 3.5;
      transitDays = 8;
    }

    const estimatedCost = Math.round(chargeableWeight * baseRatePerKg + 250); // $250 base documentation
    return { estimatedCost, transitDays };
  };

  const { estimatedCost, transitDays } = calculateEstimate();

  const handleSpecialReqToggle = (req: string) => {
    setSpecialReqs((prev) =>
      prev.includes(req) ? prev.filter((r) => r !== req) : [...prev, req]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !originCity.trim() || !destCity.trim()) {
      toast.warning('Please fill out all required fields: Full Name, Email, Origin City, and Destination City.', 'Missing Information');
      return;
    }

    setIsSubmitting(true);

    try {
      const newQuote = storageService.createQuote({
        fullName: fullName.trim(),
        companyName: companyName.trim() || 'Private Enterprise',
        email: email.trim(),
        phone: phone.trim() || 'N/A',
        originCity: originCity.trim(),
        originCountry: originCountry.trim(),
        originAddress: originAddress.trim() || undefined,
        destCity: destCity.trim(),
        destCountry: destCountry.trim(),
        destAddress: destAddress.trim() || undefined,
        service,
        cargoType: cargoType.trim(),
        cargoDescription: `${cargoType.trim()} (${pieces}x ${packageType})`,
        packageType,
        pieces: Number(pieces) || 1,
        weightKg: Number(weightKg) || 1,
        volumeCbm: Number(volumeCbm.toFixed(2)),
        dimensions: { lengthCm, widthCm, heightCm },
        declaredValue: Number(declaredValue) || undefined,
        declaredValueCurrency: 'USD',
        specialRequirements: specialReqs,
        notes: notes.trim() || undefined,
        estimatedCostUsd: estimatedCost,
        estimatedTransitDays: transitDays,
      });

      // Dispatch confirmation email to customer AND instant alert email to company pricing desk
      const emailResult = await emailService.sendQuoteConfirmationToCustomerAsync(newQuote);
      emailService.sendQuoteRequestToCompany(newQuote);

      setSubmittedEmailRecord(emailResult.emailRecord);
      setEmailDispatchResult(emailResult);
      setSubmittedQuote(newQuote);
      setIsSubmitting(false);

      if (emailResult.success && emailResult.delivered) {
        if (language === 'fr') {
          toast.success(
            "Demande de devis envoyée avec succès ! Nous avons envoyé les détails de votre devis à votre adresse e-mail. Si vous ne voyez pas l'e-mail dans votre boîte de réception, veuillez vérifier votre dossier Spam/Indésirables.",
            'Devis Envoyé'
          );
        } else {
          toast.success(
            "Quote request submitted successfully! We've sent your quote details to your email. If you don't see the email in your inbox, please check your Spam/Junk folder.",
            'Quote Requested'
          );
        }
      } else {
        if (language === 'fr') {
          toast.warning(
            `Demande de devis soumise avec succès (Réf: #${newQuote.referenceNumber || newQuote.id}), mais l'envoi de l'e-mail automatique n'a pas pu aboutir (${emailResult.error || 'service mail indisponible'}). Vous pouvez consulter ou imprimer votre devis directement ci-dessous.`,
            'Avis Devis'
          );
        } else {
          toast.warning(
            `Quote request #${newQuote.referenceNumber || newQuote.id} registered successfully, but automated email dispatch could not be completed (${emailResult.error || 'mail server unavailable'}). You can view or print your rate quote below.`,
            'Quote Registered'
          );
        }
      }
    } catch (err: any) {
      setIsSubmitting(false);
      toast.error('An error occurred while submitting your quote request. Please try again.', 'Submission Error');
    }
  };

  const handleReset = () => {
    setSubmittedQuote(null);
    setSubmittedEmailRecord(null);
    setEmailDispatchResult(null);
    setFullName('');
    setCompanyName('');
    setEmail('');
    setPhone('');
    setOriginCity('');
    setDestCity('');
    setNotes('');
  };

  const requirementsList = [
    'Customs Brokerage Assistance',
    'Temperature Controlled (-20°C to +4°C)',
    'High-Value Bonded Security Escort',
    'Dangerous Goods / Lithium Batteries (DGR)',
    'Tail-Lift Destination Delivery',
    'Comprehensive All-Risk Cargo Insurance',
  ];

  return (
    <div className="pt-28 pb-24 bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white min-h-screen transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0066FF]/40 bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] font-mono-tech text-xs tracking-widest uppercase mb-4">
            <Calculator className="w-3.5 h-3.5" />
            <span>ALGORITHMIC FREIGHT ESTIMATOR</span>
          </div>

          <h1 className="font-heading font-black uppercase text-3xl sm:text-5xl md:text-6xl text-slate-950 dark:text-white tracking-tight leading-none">
            INSTANT FREIGHT RATE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] via-[#0052cc] dark:via-[#38bdf8] to-slate-900 dark:to-white">
              CALCULATOR &amp; BOOKING.
            </span>
          </h1>

          <p className="mt-4 text-slate-600 dark:text-gray-400 text-sm sm:text-base font-light">
            Generate immediate spot rate estimates based on volumetric density, multi-modal routing, and destination compliance fees. Submit to receive a formal itemized proposal.
          </p>
        </div>

        {/* Success State Screen */}
        <AnimatePresence>
          {submittedQuote ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-[#070D1D] border border-emerald-500/40 rounded-3xl p-8 sm:p-12 shadow-2xl max-w-3xl mx-auto text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="font-mono-tech text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-bold">
                  QUOTE REQUEST DISPATCHED SUCCESSFULLY
                </span>
                <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-slate-900 dark:text-white uppercase mt-1">
                  QUOTE REF: {submittedQuote.referenceNumber || submittedQuote.id.toUpperCase()}
                </h2>
              </div>

              <p className="text-slate-600 dark:text-gray-300 text-sm sm:text-base max-w-xl mx-auto font-light">
                Our pricing specialists in Rotterdam &amp; Singapore have received your consignment parameters. A confirmation email has been dispatched to <strong className="text-slate-900 dark:text-white">{email}</strong>.
              </p>

              <div className="p-6 bg-slate-50 dark:bg-[#0D1527] rounded-2xl border border-slate-200 dark:border-white/5 font-mono-tech text-xs grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                <div>
                  <div className="text-slate-400 dark:text-gray-500">SERVICE:</div>
                  <div className="text-slate-900 dark:text-white font-bold">{service}</div>
                </div>
                <div>
                  <div className="text-slate-400 dark:text-gray-500">CORRIDOR:</div>
                  <div className="text-slate-900 dark:text-white font-bold">{originCity} → {destCity}</div>
                </div>
                <div>
                  <div className="text-slate-400 dark:text-gray-500">EST. SPOT RATE:</div>
                  <div className="text-[#0066FF] dark:text-[#38bdf8] font-bold">${estimatedCost.toLocaleString()} USD</div>
                </div>
                <div>
                  <div className="text-slate-400 dark:text-gray-500">TRANSIT TIME:</div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold">{transitDays} Business Days</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-mono-tech flex items-center justify-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  <strong>Automated Email Dispatched:</strong> A complete rate receipt &amp; corridor breakdown has been automatically sent to <strong>{email}</strong> and our operations desk.
                </span>
              </div>

              {/* Spam/Junk Folder Notice Card */}
              {emailDispatchResult && !emailDispatchResult.delivered ? (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-sans text-left space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-heading font-black text-xs sm:text-sm uppercase tracking-wide text-amber-800 dark:text-amber-300">
                        {language === 'fr' ? 'Devis Enregistré dans le Système' : 'Quote Registered in Operations System'}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                        {language === 'fr'
                          ? `Votre demande de devis #${submittedQuote.referenceNumber || submittedQuote.id} a été enregistrée avec succès. Notez que la passerelle d'envoi automatique d'e-mail a retourné une notification (${emailDispatchResult.error || 'service en cours de configuration'}). Vous pouvez consulter et imprimer votre devis directement ci-dessous.`
                          : `Your quote request #${submittedQuote.referenceNumber || submittedQuote.id} was recorded successfully in our operations desk. Automated email transmission to ${email} returned a notice (${emailDispatchResult.error || 'server mail credentials pending'}). You can access and print your rate proposal directly below.`}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs sm:text-sm font-sans text-left space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-heading font-black text-xs sm:text-sm uppercase tracking-wide text-amber-800 dark:text-amber-300">
                        {language === 'fr' ? 'Vérifiez votre dossier Spam / Indésirables' : 'Check your Spam / Junk folder'}
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {language === 'fr'
                          ? "Demande de devis envoyée avec succès ! Nous avons envoyé les détails de votre devis à votre adresse e-mail. Si vous ne voyez pas l'e-mail dans votre boîte de réception, veuillez vérifier votre dossier Spam/Indésirables."
                          : "Quote request submitted successfully! We've sent your quote details to your email. If you don't see the email in your inbox, please check your Spam/Junk folder."}
                      </p>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono-tech pt-1">
                        {language === 'fr'
                          ? 'Astuce : Pour garantir la bonne réception de nos propositions tarifaires et mises à jour de transit, ajoutez notre domaine à votre liste d\'expéditeurs autorisés.'
                          : 'Tip: Add our operations email to your safe sender whitelist to ensure immediate delivery of your formal itemized tariffs and route telemetry.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  to={`/quote/${submittedQuote.referenceNumber || submittedQuote.id}`}
                  className="px-6 py-3.5 bg-[#0066FF] hover:bg-[#0052cc] rounded-xl text-white font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#0066FF]/30 flex items-center gap-2 cursor-pointer"
                >
                  <span>View Your Quote Online</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setShowPrintModal(true)}
                  className="px-6 py-3.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-xl text-slate-900 dark:text-white font-heading font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#0066FF]" />
                  <span>Print Rate Dossier</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 rounded-xl text-slate-900 dark:text-white font-heading font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Calculate Another Rate</span>
                </button>
              </div>
            </motion.div>
          ) : (
            /* Form Layout with Live Estimator Widget */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Left Column: Form Fields */}
              <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-8 bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-xl">
                {/* Step 1: Modality Selection */}
                <div className="space-y-3">
                  <label className="font-heading font-bold text-xs uppercase text-slate-700 dark:text-gray-300 tracking-wider block">
                    1. Select Freight Modality *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'Air Freight', icon: Plane },
                      { id: 'Ocean Freight', icon: Ship },
                      { id: 'Road Transport', icon: Truck },
                      { id: 'Multi-Modal', icon: Network },
                    ].map((mode) => {
                      const Icon = mode.icon;
                      const isSelected = service === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setService(mode.id as TransportMode)}
                          className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-[#0D1527] border-[#0066FF] text-[#0066FF] dark:text-white shadow-md'
                              : 'bg-slate-50 dark:bg-[#070D1D]/60 border-slate-200 dark:border-white/5 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0D1527]'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-[#0066FF] dark:text-[#38bdf8]' : 'text-slate-400 dark:text-gray-400'}`} />
                          <span className="font-heading font-bold text-xs uppercase">{mode.id}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Route Origin & Destination */}
                <div className="space-y-3">
                  <label className="font-heading font-bold text-xs uppercase text-slate-700 dark:text-gray-300 tracking-wider block">
                    2. Origin &amp; Destination Logistics Corridors *
                  </label>
                  <LocationPairSelector
                    origin={{
                      city: originCity,
                      country: originCountry,
                      address: originAddress,
                    }}
                    destination={{
                      city: destCity,
                      country: destCountry,
                      address: destAddress,
                    }}
                    onChangeOrigin={(data: LocationData) => {
                      setOriginCity(data.city);
                      setOriginCountry(data.country);
                      if (data.address !== undefined) setOriginAddress(data.address);
                    }}
                    onChangeDestination={(data: LocationData) => {
                      setDestCity(data.city);
                      setDestCountry(data.country);
                      if (data.address !== undefined) setDestAddress(data.address);
                    }}
                    showCorridorPresets={true}
                  />
                </div>

                {/* Step 3: Cargo Dimensions & Weight */}
                <div className="space-y-3">
                  <label className="font-heading font-bold text-xs uppercase text-slate-700 dark:text-gray-300 tracking-wider block">
                    3. Cargo Specs &amp; Dimensions *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-2">
                    <div className="space-y-1.5">
                      <span className="font-mono-tech text-[11px] text-slate-600 dark:text-gray-400">COMMODITY TYPE</span>
                      <input
                        type="text"
                        value={cargoType}
                        onChange={(e) => setCargoType(e.target.value)}
                        placeholder="e.g. Precision Medical Robotics"
                        className="w-full bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 focus:border-[#0066FF] rounded-xl px-4 py-3 text-slate-900 dark:text-white text-xs font-mono-tech focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="font-mono-tech text-[11px] text-slate-600 dark:text-gray-400">PACKAGE TYPE</span>
                      <select
                        value={packageType}
                        onChange={(e) => setPackageType(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 focus:border-[#0066FF] rounded-xl px-4 py-3 text-slate-900 dark:text-white text-xs font-mono-tech focus:outline-none"
                      >
                        <option value="Carton">Carton(s)</option>
                        <option value="Crate">Wooden Crate(s)</option>
                        <option value="Pallet">Standard Euro Pallet(s)</option>
                        <option value="20ft Container">20ft Dry FCL Container</option>
                        <option value="40ft Container">40ft High Cube Container</option>
                        <option value="Drum / Barrel">Drum / Chemical Barrel</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <span className="font-mono-tech text-[11px] text-slate-600 dark:text-gray-400">PIECES COUNT</span>
                      <input
                        type="number"
                        min="1"
                        value={pieces}
                        onChange={(e) => setPieces(Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 focus:border-[#0066FF] rounded-xl px-4 py-3 text-slate-900 dark:text-white text-xs font-mono-tech focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <span className="font-mono-tech text-[11px] text-slate-600 dark:text-gray-400">WEIGHT (KG) *</span>
                      <input
                        type="number"
                        min="1"
                        value={weightKg}
                        onChange={(e) => setWeightKg(Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 focus:border-[#0066FF] rounded-xl px-4 py-3 text-slate-900 dark:text-white text-xs font-mono-tech focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="font-mono-tech text-[11px] text-slate-600 dark:text-gray-400">LENGTH (CM)</span>
                      <input
                        type="number"
                        min="1"
                        value={lengthCm}
                        onChange={(e) => setLengthCm(Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 focus:border-[#0066FF] rounded-xl px-4 py-3 text-slate-900 dark:text-white text-xs font-mono-tech focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="font-mono-tech text-[11px] text-slate-600 dark:text-gray-400">WIDTH (CM)</span>
                      <input
                        type="number"
                        min="1"
                        value={widthCm}
                        onChange={(e) => setWidthCm(Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 focus:border-[#0066FF] rounded-xl px-4 py-3 text-slate-900 dark:text-white text-xs font-mono-tech focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <span className="font-mono-tech text-[11px] text-slate-600 dark:text-gray-400">HEIGHT (CM)</span>
                      <input
                        type="number"
                        min="1"
                        value={heightCm}
                        onChange={(e) => setHeightCm(Number(e.target.value))}
                        className="w-full bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 focus:border-[#0066FF] rounded-xl px-4 py-3 text-slate-900 dark:text-white text-xs font-mono-tech focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Step 4: Special Requirements Checklist */}
                <div className="space-y-3">
                  <label className="font-heading font-bold text-xs uppercase text-slate-700 dark:text-gray-300 tracking-wider block">
                    4. Value-Added Requirements &amp; Compliance
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {requirementsList.map((req, i) => {
                      const isChecked = specialReqs.includes(req);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSpecialReqToggle(req)}
                          className={`p-3 rounded-xl border text-left text-xs font-mono-tech transition-all flex items-center justify-between cursor-pointer ${
                            isChecked
                              ? 'bg-blue-50 dark:bg-[#0D1527] border-[#0066FF] text-[#0066FF] dark:text-white'
                              : 'bg-slate-50 dark:bg-[#070D1D] border-slate-200 dark:border-white/5 text-slate-600 dark:text-gray-400 hover:border-slate-300 dark:hover:border-white/20'
                          }`}
                        >
                          <span>{req}</span>
                          <CheckCircle2
                            className={`w-4 h-4 shrink-0 ml-2 ${
                              isChecked ? 'text-[#0066FF] dark:text-[#38bdf8]' : 'text-slate-300 dark:text-gray-600'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 5: Contact Credentials */}
                <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/10">
                  <label className="font-heading font-bold text-xs uppercase text-slate-700 dark:text-gray-300 tracking-wider block">
                    5. Corporate Contact Credentials *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Full Name *"
                      className="w-full bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 focus:border-[#0066FF] rounded-xl px-4 py-3 text-slate-900 dark:text-white text-xs font-mono-tech focus:outline-none"
                    />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Company Name"
                      className="w-full bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 focus:border-[#0066FF] rounded-xl px-4 py-3 text-slate-900 dark:text-white text-xs font-mono-tech focus:outline-none"
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Corporate Email Address *"
                      className="w-full bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 focus:border-[#0066FF] rounded-xl px-4 py-3 text-slate-900 dark:text-white text-xs font-mono-tech focus:outline-none"
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone / Direct Extension"
                      className="w-full bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 focus:border-[#0066FF] rounded-xl px-4 py-3 text-slate-900 dark:text-white text-xs font-mono-tech focus:outline-none"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-bold uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-[#0066FF]/30 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>PROCESSING QUOTE DISPATCH...</span>
                  ) : (
                    <>
                      <span>SUBMIT FOR FORMAL BINDING QUOTE</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Right Column: Live Dynamic Cost & Volumetric Density Widget */}
              <div className="lg:col-span-4 sticky top-28 space-y-6">
                <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
                    <span className="font-heading font-bold text-xs uppercase text-slate-500 dark:text-gray-400">
                      ESTIMATOR SUMMARY
                    </span>
                    <span className="font-mono-tech text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">
                      SPOT RATES LIVE
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-mono-tech text-slate-500 dark:text-gray-400 uppercase">
                      ESTIMATED FREIGHT COST
                    </div>
                    <div className="font-heading font-black text-3xl sm:text-4xl text-slate-900 dark:text-white mt-1">
                      ${estimatedCost.toLocaleString()} <span className="text-xs font-normal text-slate-500 dark:text-gray-400">USD</span>
                    </div>
                    <div className="text-[11px] font-mono-tech text-emerald-600 dark:text-emerald-400 mt-1 font-bold">
                      ● Includes bunker adjustment &amp; port security
                    </div>
                  </div>

                  {/* Volumetric Metrics */}
                  <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-white/10 font-mono-tech text-xs">
                    <div className="flex justify-between py-1 text-slate-600 dark:text-gray-400">
                      <span>Total Volume:</span>
                      <span className="text-slate-900 dark:text-white font-bold">{volumeCbm.toFixed(2)} CBM</span>
                    </div>
                    <div className="flex justify-between py-1 text-slate-600 dark:text-gray-400">
                      <span>Gross Weight:</span>
                      <span className="text-slate-900 dark:text-white font-bold">{weightKg} kg</span>
                    </div>
                    <div className="flex justify-between py-1 text-slate-600 dark:text-gray-400">
                      <span>Chargeable Weight:</span>
                      <span className="text-[#0066FF] dark:text-[#38bdf8] font-bold">{Math.round(chargeableWeight)} kg</span>
                    </div>
                    <div className="flex justify-between py-1 text-slate-600 dark:text-gray-400">
                      <span>Est. Transit Velocity:</span>
                      <span className="text-slate-900 dark:text-white font-bold">{transitDays} Business Days</span>
                    </div>
                  </div>

                  {/* Guarantee Box */}
                  <div className="p-4 bg-slate-50 dark:bg-[#0D1527] rounded-xl border border-slate-200 dark:border-white/5 font-mono-tech text-[11px] text-slate-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      14-DAY SPOT PRICE LOCK
                    </div>
                    <p>Quotes locked upon submission with guaranteed vessel allocations.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Printable Rate Quote Dossier Modal */}
      {showPrintModal && submittedQuote && (
        <PrintableQuoteDossier
          quote={submittedQuote}
          isModal={true}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
};
