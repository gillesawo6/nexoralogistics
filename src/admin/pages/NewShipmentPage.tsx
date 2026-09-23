import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  ArrowLeft, 
  Sparkles, 
  Plane, 
  Ship, 
  Truck, 
  Train, 
  Snowflake,
  Layers, 
  CheckCircle2, 
  MapPin, 
  Building2, 
  User, 
  ShieldCheck,
  Calendar,
  Clock,
  Thermometer,
  Gauge,
  Barcode,
  ExternalLink,
  Printer,
  Copy,
  Check,
  AlertCircle,
  FileText,
  Radio,
  Zap,
  Leaf,
  Globe2,
  Box,
  Compass,
  Phone,
  Mail,
  CreditCard,
  DollarSign,
  Plus,
  Trash2,
  Scale,
  Maximize2,
  Calculator,
  MessageSquare,
  Send,
  RotateCcw
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { emailService, EmailMessageRecord } from '../../services/emailService';
import { 
  TransportMode, 
  ShipmentStatus, 
  Shipment, 
  Waypoint, 
  TrackingEvent, 
  PackageItem, 
  CARRIER_OPTIONS, 
  PACKAGE_TYPE_OPTIONS,
  generateDynamicTrackingId
} from '../../types';
import { updatePageSeo } from '../../services/seoService';
import { GLOBAL_HUBS, SHIPMENT_PRESETS, ShipmentPresetTemplate } from '../../data/hubPresets';
import { PrintableShipmentDossier } from '../../components/tracking/PrintableShipmentDossier';
import { resolveLocationSync, resolveShipmentTelemetryLocation } from '../../utils/geoUtils';
import { useToast } from '../../context/ToastContext';
import { CountrySelect } from '../../components/common/CountrySelect';
import { CitySelect } from '../../components/common/CitySelect';
import { locationService } from '../../services/locationService';

// Helpers to format current date and time for operational timelines
const getCurrentDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getCurrentTimeStr = () => {
  const d = new Date();
  const hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  const formattedHours = String(hours % 12 || 12).padStart(2, '0');
  return `${formattedHours}:${minutes} ${ampm}`;
};

export const NewShipmentPage: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quoteId = searchParams.get('quoteId');

  // Tracking identifier & carrier reference
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrierReference, setCarrierReference] = useState('');

  // Shipper Information (Consignor) - Blank Initial State
  const [shipperName, setShipperName] = useState('');
  const [shipperPhone, setShipperPhone] = useState('');
  const [shipperAddress, setShipperAddress] = useState('');
  const [shipperEmail, setShipperEmail] = useState('');
  const [shipperCompany, setShipperCompany] = useState('');

  // Receiver Information (Consignee) - Blank Initial State
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');
  const [receiverEmail, setReceiverEmail] = useState('');
  const [receiverPostalCode, setReceiverPostalCode] = useState('');

  // Transport, Mode & Carrier Line
  const [mode, setMode] = useState<TransportMode>('Land Transport');
  const [serviceLevel, setServiceLevel] = useState('');
  const [carrier, setCarrier] = useState('FedEx');
  const [vessel, setVessel] = useState('');
  const [containerNumber, setContainerNumber] = useState('');
  const [packageType, setPackageType] = useState('CARTON');
  const [commodity, setCommodity] = useState('');
  const [paymentMode, setPaymentMode] = useState('Bank Transfer');
  const [freightAmount, setFreightAmount] = useState<number | ''>('');
  const [freightCurrency, setFreightCurrency] = useState('EUR');

  // Operational Schedule & Dates - Current Date & Time
  const [departureDate, setDepartureDate] = useState(getCurrentDateStr);
  const [departureTime, setDepartureTime] = useState(getCurrentTimeStr);
  const [pickupDate, setPickupDate] = useState(getCurrentDateStr);
  const [pickupTime, setPickupTime] = useState(getCurrentTimeStr);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(getCurrentDateStr);
  const [comments, setComments] = useState('Dear client please ensure that your details on the website are correct, as no changes can be made once delivery has begun. Thank you.');

  // Origin Node - Blank Initial State
  const [originCity, setOriginCity] = useState('');
  const [originCountry, setOriginCountry] = useState('');
  const [originCode, setOriginCode] = useState('');
  const [originFacility, setOriginFacility] = useState('');
  const [originAddress, setOriginAddress] = useState('');
  const [originLat, setOriginLat] = useState<number>(0);
  const [originLng, setOriginLng] = useState<number>(0);

  // Destination Node - Blank Initial State
  const [destCity, setDestCity] = useState('');
  const [destCountry, setDestCountry] = useState('');
  const [destCode, setDestCode] = useState('');
  const [destFacility, setDestFacility] = useState('');
  const [destAddress, setDestAddress] = useState('');
  const [destLat, setDestLat] = useState<number>(0);
  const [destLng, setDestLng] = useState<number>(0);

  // Itemized Packages Breakdown - Blank Initial State
  const [packages, setPackages] = useState<PackageItem[]>([
    {
      packageNumber: 1,
      type: 'Carton',
      description: '',
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
    },
  ]);

  // Overall Totals
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');

  // Sensor Telemetry
  const [tempCelsius, setTempCelsius] = useState<number>(20.0);
  const [humidityPercent, setHumidityPercent] = useState<number>(50);
  const [speedKnots, setSpeedKnots] = useState<number>(0);
  const [altitudeMeters, setAltitudeMeters] = useState<number>(0);

  // Status & Milestones
  const [initialStatus, setInitialStatus] = useState<ShipmentStatus>('On Hold');
  const [progressPercent, setProgressPercent] = useState<number>(15);
  const [milestoneRemarks, setMilestoneRemarks] = useState('');
  const [milestoneDesc, setMilestoneDesc] = useState('');
  const [milestoneLocation, setMilestoneLocation] = useState('');

  // UI state
  const [copied, setCopied] = useState(false);
  const [copiedTrackingUrl, setCopiedTrackingUrl] = useState(false);
  const [createdShipment, setCreatedShipment] = useState<Shipment | null>(null);
  const [createdEmailRecord, setCreatedEmailRecord] = useState<EmailMessageRecord | null>(null);
  const [printedShipment, setPrintedShipment] = useState<Shipment | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [receiverCustomNote, setReceiverCustomNote] = useState('');
  const [isSendingReceiverEmail, setIsSendingReceiverEmail] = useState(false);
  const [receiverEmailSuccessFeedback, setReceiverEmailSuccessFeedback] = useState<string | null>(null);

  // Helper to generate dynamic unique tracking number in NX-****-year format
  const generateTrackingCode = () => {
    return generateDynamicTrackingId();
  };

  // Real-time package calculations
  const totalActualWeight = packages.reduce((acc, p) => acc + (Number(p.weight) || 0), 0);
  const totalVolumeCbm = packages.reduce((acc, p) => {
    const vol = ((Number(p.length) || 0) * (Number(p.width) || 0) * (Number(p.height) || 0)) / 1000000;
    return acc + vol;
  }, 0);
  const totalVolumetricWeight = packages.reduce((acc, p) => {
    const volWeight = ((Number(p.length) || 0) * (Number(p.width) || 0) * (Number(p.height) || 0)) / 5000;
    return acc + volWeight;
  }, 0);

  useEffect(() => {
    updatePageSeo({
      title: 'Dispatch New Shipment | Consignment Generator | NEXORA Admin',
      description: 'Generate authenticated air waybills, ocean bills of lading, and multi-modal live telemetry shipments.',
    });

    const initCode = generateDynamicTrackingId();
    setTrackingNumber(initCode);
    setCarrierReference(initCode);

    // Check if converting from a Quote
    if (quoteId) {
      const quote = storageService.getQuoteById(quoteId);
      if (quote) {
        setShipperName(quote.companyName || quote.fullName);
        setShipperCompany(quote.companyName || 'Corporate Client');
        setShipperEmail(quote.email);
        setShipperPhone(quote.phone);
        if (quote.originAddress) setShipperAddress(quote.originAddress);
        setReceiverName(quote.fullName);
        setReceiverEmail(quote.email);
        setReceiverPhone(quote.phone);
        if (quote.destAddress) setReceiverAddress(quote.destAddress);
        setOriginCity(quote.originCity);
        setOriginCountry(quote.originCountry);
        const orgCoords = locationService.resolveCoordinates(quote.originCity, quote.originCountry);
        setOriginLat(orgCoords.lat);
        setOriginLng(orgCoords.lng);
        const orgHub = locationService.findHubByCityAndCountry(quote.originCity, quote.originCountry);
        if (orgHub) {
          setOriginCode(orgHub.code);
          if (orgHub.facility) setOriginFacility(orgHub.facility);
        } else if (quote.originCity) {
          setOriginCode(quote.originCity.substring(0, 3).toUpperCase());
        }

        setDestCity(quote.destCity);
        setDestCountry(quote.destCountry);
        const dstCoords = locationService.resolveCoordinates(quote.destCity, quote.destCountry);
        setDestLat(dstCoords.lat);
        setDestLng(dstCoords.lng);
        const dstHub = locationService.findHubByCityAndCountry(quote.destCity, quote.destCountry);
        if (dstHub) {
          setDestCode(dstHub.code);
          if (dstHub.facility) setDestFacility(dstHub.facility);
        } else if (quote.destCity) {
          setDestCode(quote.destCity.substring(0, 3).toUpperCase());
        }
        setCommodity(quote.cargoDescription || quote.cargoType || 'Industrial Equipment');
        
        const priceTotal = quote.pricing?.totalAmount ?? quote.estimatedCostUsd ?? 0;
        const priceCurr = quote.pricing?.currency || 'USD';
        setFreightAmount(priceTotal);
        setFreightCurrency(priceCurr);

        const pType = (quote.packageType as any) || 'Carton';
        setPackageType(pType);
        setPackages([
          {
            packageNumber: 1,
            type: pType,
            description: quote.cargoDescription || quote.cargoType || 'Industrial Cargo',
            length: quote.dimensions?.lengthCm || 80,
            width: quote.dimensions?.widthCm || 60,
            height: quote.dimensions?.heightCm || 50,
            weight: quote.weightKg || 120,
          },
        ]);
        setMode(quote.service as any || 'Air Freight');
        const refTag = quote.referenceNumber || quote.id.toUpperCase();
        setMilestoneDesc(`Waybill provisioned from Approved Rate Quote #${refTag}. Ready for initial dispatch.`);
        setComments(`Formal proposal rate quote #${refTag} agreed for ${priceCurr} ${priceTotal.toLocaleString()}.`);
      }
    }
  }, [quoteId]);

  // Handle Preset selection
  const applyPreset = (preset: ShipmentPresetTemplate) => {
    setMode(preset.mode);
    setServiceLevel(preset.serviceLevel);
    setCommodity(preset.commodity);
    setCarrier(preset.carrier);
    setVessel(preset.vessel);
    setPackages([
      {
        packageNumber: 1,
        type: preset.mode === 'Ocean Freight' ? 'Container' : preset.mode === 'Air Freight' ? 'Crate' : 'Carton',
        description: preset.commodity,
        length: Math.round(Math.cbrt((preset.weightKg / 250) * 1000000) / 10) * 10 || 70,
        width: Math.round(Math.cbrt((preset.weightKg / 250) * 1000000) / 10) * 10 || 50,
        height: Math.round(Math.cbrt((preset.weightKg / 250) * 1000000) / 10) * 10 || 40,
        weight: preset.weightKg,
      },
    ]);
    setTempCelsius(preset.tempCelsius);
    setHumidityPercent(preset.humidityPercent);
    setSpeedKnots(preset.speedKnots);
    setInitialStatus(preset.initialStatus);
    setShipperCompany(preset.company);
    setShipperName(preset.company);
    setReceiverName(preset.customerName);
    setReceiverEmail(preset.customerEmail);

    // Dynamically generate fresh tracking ID in NX-****-year format
    const code = generateDynamicTrackingId();
    setTrackingNumber(code);
    setCarrierReference(code);

    // Match Origin Hub
    const oHub = GLOBAL_HUBS.find(h => h.city.toLowerCase() === preset.originCity.toLowerCase());
    if (oHub) {
      setOriginCity(oHub.city);
      setOriginCountry(oHub.country);
      setOriginCode(oHub.code);
      setOriginFacility(oHub.facility);
      setOriginLat(oHub.lat);
      setOriginLng(oHub.lng);
      setOriginAddress(`${oHub.facility}, ${oHub.city}`);
      setShipperAddress(`${oHub.facility}, ${oHub.city}, ${oHub.country}`);
      setMilestoneLocation(`${oHub.facility}, ${oHub.city}`);
    }

    // Match Destination Hub
    const dHub = GLOBAL_HUBS.find(h => h.city.toLowerCase() === preset.destCity.toLowerCase());
    if (dHub) {
      setDestCity(dHub.city);
      setDestCountry(dHub.country);
      setDestCode(dHub.code);
      setDestFacility(dHub.facility);
      setDestLat(dHub.lat);
      setDestLng(dHub.lng);
      setDestAddress(`${dHub.facility}, ${dHub.city}`);
      setReceiverAddress(`${dHub.facility}, ${dHub.city}, ${dHub.country}`);
    }

    setMilestoneDesc(`Consignment scheduled & entered into NEXORA Global Logistics Network (${preset.mode}).`);
    setMilestoneRemarks('Pacco Registrato');
  };

  // Reset form to blank consignment with current operational timeline
  const resetToBlankForm = () => {
    const freshCode = generateDynamicTrackingId();
    setTrackingNumber(freshCode);
    setCarrierReference(freshCode);
    setShipperName('');
    setShipperPhone('');
    setShipperAddress('');
    setShipperEmail('');
    setShipperCompany('');
    setReceiverName('');
    setReceiverPhone('');
    setReceiverAddress('');
    setReceiverEmail('');
    setReceiverPostalCode('');
    setMode('Land Transport');
    setServiceLevel('');
    setCarrier('FedEx');
    setVessel('');
    setContainerNumber('');
    setPackageType('CARTON');
    setCommodity('');
    setPaymentMode('Bank Transfer');
    setFreightAmount('');
    setFreightCurrency('EUR');
    setDepartureDate(getCurrentDateStr());
    setDepartureTime(getCurrentTimeStr());
    setPickupDate(getCurrentDateStr());
    setPickupTime(getCurrentTimeStr());
    setExpectedDeliveryDate(getCurrentDateStr());
    setComments('Dear client please ensure that your details on the website are correct, as no changes can be made once delivery has begun. Thank you.');
    setOriginCity('');
    setOriginCountry('');
    setOriginCode('');
    setOriginFacility('');
    setOriginAddress('');
    setOriginLat(0);
    setOriginLng(0);
    setDestCity('');
    setDestCountry('');
    setDestCode('');
    setDestFacility('');
    setDestAddress('');
    setDestLat(0);
    setDestLng(0);
    setPackages([
      {
        packageNumber: 1,
        type: 'Carton',
        description: '',
        length: 0,
        width: 0,
        height: 0,
        weight: 0,
      },
    ]);
    setInitialStatus('On Hold');
    setProgressPercent(15);
    setMilestoneRemarks('');
    setMilestoneDesc('');
    setMilestoneLocation('');
    toast.info('Form reset to blank consignment with current timeline.', 'Blank State');
  };

  // Add / Remove Package Rows
  const handleAddPackage = () => {
    const nextNum = packages.length + 1;
    setPackages([
      ...packages,
      {
        packageNumber: nextNum,
        type: 'Carton',
        description: commodity || `Package #${nextNum}`,
        length: 50,
        width: 40,
        height: 30,
        weight: 5,
      },
    ]);
  };

  const handleRemovePackage = (index: number) => {
    if (packages.length <= 1) return;
    const updated = packages.filter((_, idx) => idx !== index).map((pkg, idx) => ({
      ...pkg,
      packageNumber: idx + 1,
    }));
    setPackages(updated);
  };

  const handleUpdatePackage = (index: number, field: keyof PackageItem, value: any) => {
    const updated = [...packages];
    updated[index] = {
      ...updated[index],
      [field]: value,
    };
    setPackages(updated);
  };

  // Handle Hub selection
  const handleOriginHubChange = (city: string) => {
    const hub = GLOBAL_HUBS.find(h => h.city === city);
    if (hub) {
      setOriginCity(hub.city);
      setOriginCountry(hub.country);
      setOriginCode(hub.code);
      setOriginFacility(hub.facility);
      setOriginLat(hub.lat);
      setOriginLng(hub.lng);
      setOriginAddress(`${hub.facility}, ${hub.city}`);
      setShipperAddress(`${hub.facility}, ${hub.city}, ${hub.country}`);
    }
  };

  const handleDestHubChange = (city: string) => {
    const hub = GLOBAL_HUBS.find(h => h.city === city);
    if (hub) {
      setDestCity(hub.city);
      setDestCountry(hub.country);
      setDestCode(hub.code);
      setDestFacility(hub.facility);
      setDestLat(hub.lat);
      setDestLng(hub.lng);
      setDestAddress(`${hub.facility}, ${hub.city}`);
      setReceiverAddress(`${hub.facility}, ${hub.city}, ${hub.country}`);
    }
  };

  // Distance & carbon approximation
  const approximateDistanceKm = Math.round(
    Math.sqrt(Math.pow((originLat - destLat) * 111, 2) + Math.pow((originLng - destLng) * 85, 2)) || 950
  );

  const carbonEstimateKg = Math.round(
    (totalActualWeight / 1000) * approximateDistanceKm * (mode === 'Air Freight' ? 0.602 : mode === 'Ocean Freight' ? 0.015 : 0.12)
  );

  // Generate waypoints for accurate map rendering
  const buildWaypoints = (): Waypoint[] => {
    return [
      {
        name: `${originCity} Origin Terminal (${originCode || 'ORG'})`,
        lat: originLat,
        lng: originLng,
        type: 'origin',
        passed: true,
        timestamp: `${departureDate} ${departureTime}`,
      },
      {
        name: `${destCity} Destination (${destCode || 'DST'})`,
        lat: destLat,
        lng: destLng,
        type: 'destination',
        passed: initialStatus === 'Delivered',
      },
    ];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!trackingNumber.trim() || !shipperName.trim() || !receiverName.trim()) {
      toast.warning('Please fill in required consignment fields: Tracking Number, Shipper Name, and Receiver Name.', 'Missing Required Fields');
      return;
    }

    const nowIso = new Date().toISOString();
    const formattedNow = `${departureDate} ${departureTime}`;

    // Auto-resolve exact origin and dest coordinates if needed
    const finalOriginGeo = (originLat && originLng) ? { lat: originLat, lng: originLng } : resolveLocationSync(originAddress || originCity, originCountry, originFacility);
    const finalDestGeo = (destLat && destLng) ? { lat: destLat, lng: destLng } : resolveLocationSync(destAddress || receiverAddress || destCity, destCountry, destFacility);

    const safeOriginLat = finalOriginGeo.lat;
    const safeOriginLng = finalOriginGeo.lng;
    const safeDestLat = finalDestGeo.lat;
    const safeDestLng = finalDestGeo.lng;

    // Use centralized resolution to determine actual telemetry coordinates
    const resolvedLocations = resolveShipmentTelemetryLocation({
      status: initialStatus,
      origin: {
        city: originCity.trim(),
        country: originCountry.trim(),
        lat: safeOriginLat,
        lng: safeOriginLng,
        facility: originFacility.trim(),
        address: originAddress.trim(),
      },
      destination: {
        city: destCity.trim(),
        country: destCountry.trim(),
        lat: safeDestLat,
        lng: safeDestLng,
        facility: destFacility.trim(),
        address: destAddress.trim(),
      },
      shipper: {
        name: shipperName.trim(),
        city: originCity.trim(),
        country: originCountry.trim(),
        address: shipperAddress.trim(),
      },
      receiver: {
        name: receiverName.trim(),
        city: destCity.trim(),
        country: destCountry.trim(),
        address: receiverAddress.trim(),
      },
      events: [{
        location: milestoneLocation.trim() || originAddress || shipperAddress || `${originCity}, ${originCountry}`,
      }]
    });

    const curLat = resolvedLocations.current.lat;
    const curLng = resolvedLocations.current.lng;
    const curAddress = resolvedLocations.current.locationName;
    const curCity = initialStatus === 'Delivered' ? destCity : initialStatus === 'In Transit' ? `${originCity} → ${destCity}` : originCity;
    const curCountry = initialStatus === 'Delivered' ? destCountry : initialStatus === 'In Transit' ? 'International Transit' : originCountry;

    const newShipmentData: Omit<Shipment, 'id'> = {
      trackingNumber: trackingNumber.trim().toUpperCase(),
      barcodeValue: trackingNumber.trim().toUpperCase(),
      customerName: receiverName.trim(),
      customerEmail: receiverEmail.trim(),
      customerCompany: shipperCompany.trim(),
      shipper: {
        name: shipperName.trim(),
        city: originCity.trim(),
        country: originCountry.trim(),
        address: shipperAddress.trim(),
        phone: shipperPhone.trim(),
        email: shipperEmail.trim(),
      },
      receiver: {
        name: receiverName.trim(),
        address: receiverAddress.trim(),
        city: destCity.trim(),
        country: destCountry.trim(),
        postalCode: receiverPostalCode.trim(),
        phone: receiverPhone.trim(),
        email: receiverEmail.trim(),
      },
      packageType: packageType.toUpperCase(),
      carrier: carrier.trim(),
      carrierReference: carrierReference.trim() || trackingNumber.trim().toUpperCase(),
      product: commodity.trim(),
      quantity: packages.length,
      paymentMode: paymentMode,
      totalFreight: {
        amount: Number(freightAmount) || 0,
        currency: freightCurrency,
      },
      dates: {
        departureDate: departureDate,
        departureTime: departureTime,
        pickupDate: pickupDate,
        pickupTime: pickupTime,
        expectedDeliveryDate: expectedDeliveryDate,
        actualDeliveryDate: initialStatus === 'Delivered' ? expectedDeliveryDate : undefined,
        actualDeliveryTime: initialStatus === 'Delivered' ? pickupTime : undefined,
      },
      comments: comments.trim(),
      packages: packages.map((pkg, idx) => ({
        packageNumber: idx + 1,
        type: pkg.type,
        description: pkg.description || commodity,
        length: Number(pkg.length) || 0,
        width: Number(pkg.width) || 0,
        height: Number(pkg.height) || 0,
        weight: Number(pkg.weight) || 0,
      })),
      totals: {
        volumetricWeight: Number(totalVolumetricWeight.toFixed(2)),
        volume: Number(totalVolumeCbm.toFixed(3)),
        actualWeight: Number(totalActualWeight.toFixed(2)),
      },
      origin: {
        city: originCity.trim(),
        country: originCountry.trim(),
        code: originCode.trim() || originCity.substring(0, 3).toUpperCase(),
        lat: safeOriginLat,
        lng: safeOriginLng,
        facility: originFacility.trim(),
        address: originAddress.trim(),
      },
      destination: {
        city: destCity.trim(),
        country: destCountry.trim(),
        code: destCode.trim() || destCity.substring(0, 3).toUpperCase(),
        lat: safeDestLat,
        lng: safeDestLng,
        facility: destFacility.trim(),
        address: destAddress.trim(),
      },
      currentLocation: {
        city: curCity,
        country: curCountry,
        lat: curLat,
        lng: curLng,
        address: curAddress,
        speedKnots: speedKnots,
        altitudeMeters: altitudeMeters,
        temperatureCelsius: tempCelsius,
        humidityPercent: humidityPercent,
      },
      transportMode: mode,
      serviceLevel: serviceLevel,
      weightKg: Number(totalActualWeight) || 3,
      weightUnit: weightUnit,
      volumeCbm: Number(totalVolumeCbm.toFixed(3)) || 0.07,
      pieces: packages.length,
      cargoDescription: commodity.trim(),
      status: initialStatus,
      progressPercent: initialStatus === 'Delivered' ? 100 : Number(progressPercent),
      vesselOrFlightNumber: vessel.trim(),
      containerNumber: containerNumber.trim() || undefined,
      estimatedDelivery: `${expectedDeliveryDate} ${pickupTime}`,
      dispatchedDate: `${departureDate} ${departureTime}`,
      lastUpdated: formattedNow,
      waypoints: buildWaypoints(),
      events: [
        {
          id: `ev-${Date.now()}`,
          date: departureDate,
          time: departureTime,
          location: milestoneLocation.trim() || `${originCity}, ${originCountry}`,
          status: initialStatus,
          updatedBy: 'admin',
          remarks: milestoneRemarks.trim() || 'Pacco Registrato',
          description: milestoneDesc.trim() || 'Shipment registered in logistics network.',
          lat: originLat,
          lng: originLng,
          completed: true,
        },
      ],
      isSimulatedDemo: false,
    };

    const saved = storageService.createShipment(newShipmentData);
    if (quoteId) {
      storageService.convertQuoteToShipment(quoteId, saved.id, saved.trackingNumber);
    }

    toast.success(`Consignment #${saved.trackingNumber} successfully generated and registered in live database.`, 'Consignment Created');

    // Dispatch email notification to Receiver (with prominent Shipment ID, manifest & live waybill link)
    let emailRecord: EmailMessageRecord | null = null;
    const targetReceiverEmail = saved.receiver?.email || saved.customerEmail;
    if (targetReceiverEmail) {
      try {
        emailRecord = emailService.sendShipmentCreatedToReceiver(saved, receiverCustomNote);
        setReceiverEmailSuccessFeedback(`Notice dispatched to receiver (${targetReceiverEmail}) with Shipment ID #${saved.trackingNumber}`);
        toast.info(`Automated notification dispatched to ${targetReceiverEmail}.`, 'Receiver Notified');
      } catch (e) {
        console.warn('Receiver email dispatch error:', e);
      }
    }

    setCreatedEmailRecord(emailRecord);
    setCreatedShipment(saved);
    setPrintedShipment(saved);
  };

  const handleManualSendReceiverEmail = async () => {
    if (!createdShipment) return;
    setIsSendingReceiverEmail(true);
    setReceiverEmailSuccessFeedback(null);

    try {
      const record = emailService.sendShipmentCreatedToReceiver(createdShipment, receiverCustomNote);
      if (record) {
        setCreatedEmailRecord(record);
        setReceiverEmailSuccessFeedback(`Email sent to receiver (${createdShipment.receiver?.email || createdShipment.customerEmail}) with Shipment ID #${createdShipment.trackingNumber}`);
        toast.success(`Email notice sent to ${createdShipment.receiver?.email || createdShipment.customerEmail}`, 'Email Sent');
      } else {
        setReceiverEmailSuccessFeedback('Receiver email is not configured on this shipment.');
        toast.warning('Receiver email is not configured on this consignment.', 'No Email Address');
      }
    } catch (err) {
      console.error('Failed to send receiver email:', err);
      setReceiverEmailSuccessFeedback('Failed to dispatch receiver email. Please try again.');
      toast.error('Failed to dispatch receiver email. Please try again.', 'Dispatch Failed');
    } finally {
      setIsSendingReceiverEmail(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.info('Copied to clipboard: ' + text, 'Copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/shipments"
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 transition-colors"
            title="Back to Shipments List"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-950 dark:text-white uppercase tracking-tight">
                Add New Shipment
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] font-mono-tech text-[10px] font-bold uppercase tracking-wider">
                SYNCHRONIZED WITH TRACKING DESK
              </span>
            </div>
            <p className="text-xs font-mono-tech text-slate-500 dark:text-gray-400 mt-0.5">
              Create a comprehensive logistics record. All entered information serves as the authoritative source of truth for the Tracking Page.
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2">
          <Link
            to="/tracking"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 text-xs font-mono-tech uppercase font-bold border border-slate-200 dark:border-white/10"
          >
            <Globe2 className="w-3.5 h-3.5 text-[#0066FF]" />
            <span>Public Tracking Desk</span>
          </Link>
        </div>
      </div>

      {/* Quick Scenario Templates */}
      <div className="space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span className="font-mono-tech text-xs uppercase text-slate-700 dark:text-gray-300 font-bold tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0066FF] dark:text-[#38bdf8]" />
            <span>One-Click Freight Scenario Presets:</span>
          </span>
          <span className="text-[11px] font-mono-tech text-slate-500 dark:text-gray-400">Click to autofill all logistics coordinates</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {/* Reset to Blank Consignment */}
          <button
            type="button"
            onClick={resetToBlankForm}
            className="p-3 rounded-xl bg-white dark:bg-[#070D1D] hover:bg-slate-50 dark:hover:bg-[#0D1527] border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-[#0066FF] text-left transition-all group shadow-xs cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="font-mono-tech text-[10px] font-bold text-[#0066FF] dark:text-[#38bdf8] uppercase mb-1.5 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-[#0066FF] dark:text-[#38bdf8] shrink-0 group-hover:-rotate-90 transition-transform" />
                <span>BLANK STATE</span>
              </div>
              <div className="font-heading font-bold text-xs text-slate-900 dark:text-white uppercase truncate">
                Clear / New Blank
              </div>
            </div>
            <div className="text-[11px] font-mono-tech text-slate-500 dark:text-gray-400 mt-2 flex items-center gap-1">
              <span>Current Timeline Kept</span>
            </div>
          </button>

          {/* Default Demo Master Preset */}
          <button
            type="button"
            onClick={() => {
              const code = generateDynamicTrackingId();
              setTrackingNumber(code);
              setCarrierReference(code);
              setShipperName('Minos Herman');
              setShipperPhone('+39 02 8739 4410');
              setShipperAddress('Via Alberico Albricci 10, Milan, Metropolitan City of Milan');
              setShipperEmail('minos.herman@milano-logistics.it');
              setShipperCompany('Herman Precision Trade SRL');
              setReceiverName('Letizia Affuso');
              setReceiverPhone('+39 327 1869248');
              setReceiverAddress('Via Reggio Calabria 6, Rocca Imperiale (CS)');
              setReceiverEmail('letiziaffuso@gmail.com');
              setReceiverPostalCode('87074 / 3271869248');
              setMode('Land Transport');
              setServiceLevel('Road Freight Express');
              setCarrier('FedEx');
              setVessel('FDX-Ground-IT-882');
              setPackageType('CARTON');
              setCommodity('SEALED FRAGILE CARTON');
              setPaymentMode('Bank Transfer');
              setFreightAmount(250);
              setFreightCurrency('EUR');
              setDepartureDate(getCurrentDateStr());
              setDepartureTime(getCurrentTimeStr());
              setPickupDate(getCurrentDateStr());
              setPickupTime(getCurrentTimeStr());
              setExpectedDeliveryDate(getCurrentDateStr());
              setComments('Dear client please ensure that your details on the website are correct, as no changes can be made once delivery has begun. Thank you.');
              setOriginCity('Milan');
              setOriginCountry('Italy');
              setOriginCode('MXP');
              setOriginFacility('Milano Central Express Hub');
              setOriginAddress('Via Alberico Albricci 10, Milan');
              setOriginLat(45.4642);
              setOriginLng(9.1900);
              setDestCity('Rocca Imperiale (CS)');
              setDestCountry('Italy');
              setDestCode('CTA');
              setDestFacility('Calabria Regional Fulfillment Center');
              setDestAddress('Via Reggio Calabria 6, Rocca Imperiale (CS)');
              setDestLat(40.1111);
              setDestLng(16.5786);
              setPackages([
                {
                  packageNumber: 1,
                  type: 'Carton',
                  description: 'SEALED FRAGILE CARTON',
                  length: 70,
                  width: 40,
                  height: 25,
                  weight: 3,
                },
              ]);
              setInitialStatus('On Hold');
              setProgressPercent(35);
              setMilestoneRemarks('Pacco Registrato');
              setMilestoneDesc('Shipment registered and placed on security hold awaiting clearance verification.');
              setMilestoneLocation('Via Alberico Albricci 10, Milan, Metropolitan City of Milan, Italy');
            }}
            className="p-3 rounded-xl bg-white dark:bg-[#070D1D] hover:bg-blue-50 dark:hover:bg-[#0D1527] border border-slate-200 dark:border-white/10 hover:border-[#0066FF] text-left transition-all group shadow-xs cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="font-mono-tech text-[10px] font-bold text-[#0066FF] dark:text-[#38bdf8] uppercase mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0066FF] dark:text-[#38bdf8] shrink-0" />
                <span>DEMO MASTER</span>
              </div>
              <div className="font-heading font-bold text-xs text-slate-900 dark:text-white uppercase truncate">
                NX-DYNAMIC (FedEx)
              </div>
            </div>
            <div className="text-[11px] font-mono-tech text-slate-500 dark:text-gray-400 mt-2 flex items-center gap-1">
              <span>Milan</span>
              <span>→</span>
              <span>Rocca Imp.</span>
            </div>
          </button>

          {SHIPMENT_PRESETS.map((preset) => {
            const renderPresetIcon = () => {
              switch (preset.iconName) {
                case 'plane':
                  return <Plane className="w-3.5 h-3.5 text-[#0066FF] dark:text-[#38bdf8] shrink-0" />;
                case 'ship':
                  return <Ship className="w-3.5 h-3.5 text-[#0066FF] dark:text-[#38bdf8] shrink-0" />;
                case 'snowflake':
                  return <Snowflake className="w-3.5 h-3.5 text-[#0066FF] dark:text-[#38bdf8] shrink-0" />;
                case 'truck':
                  return <Truck className="w-3.5 h-3.5 text-[#0066FF] dark:text-[#38bdf8] shrink-0" />;
                case 'train':
                  return <Train className="w-3.5 h-3.5 text-[#0066FF] dark:text-[#38bdf8] shrink-0" />;
                default:
                  return <Package className="w-3.5 h-3.5 text-[#0066FF] dark:text-[#38bdf8] shrink-0" />;
              }
            };

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className="p-3 rounded-xl bg-white dark:bg-[#070D1D] hover:bg-blue-50/60 dark:hover:bg-[#0D1527] border border-slate-200 dark:border-white/10 hover:border-[#0066FF] text-left transition-all group shadow-xs cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="font-mono-tech text-[10px] font-bold text-[#0066FF] dark:text-[#38bdf8] uppercase mb-1.5 flex items-center gap-1.5">
                    {renderPresetIcon()}
                    <span className="truncate">{preset.badge}</span>
                  </div>
                  <div className="font-heading font-bold text-xs text-slate-900 dark:text-white uppercase truncate" title={preset.name}>
                    {preset.name}
                  </div>
                </div>
                <div className="text-[11px] font-mono-tech text-slate-500 dark:text-gray-400 mt-2 flex items-center gap-1 truncate">
                  <span className="truncate">{preset.originCity}</span>
                  <span>→</span>
                  <span className="truncate">{preset.destCity}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Form (8 cols) & Live Preview HUD (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ================= FORM (8 cols) ================= */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6 font-mono-tech text-xs">
          {/* 1. SHIPMENT IDENTIFIER & CARRIER REFERENCE */}
          <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-heading font-bold text-sm uppercase">
                <Barcode className="w-4 h-4 text-[#0066FF]" />
                <span>1. Waybill Identification &amp; Carrier Reference</span>
              </div>
              <span className="text-[11px] text-slate-400 font-normal">Section 01/06</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Waybill Tracking Number */}
              <div className="md:col-span-7">
                <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                  <label className="block text-slate-700 dark:text-gray-300 font-bold uppercase">
                    Consignment Waybill / Tracking # *
                  </label>
                  <span className="text-[10px] font-mono-tech text-[#0066FF] dark:text-[#38bdf8] font-bold bg-[#0066FF]/10 px-2 py-0.5 rounded">
                    FORMAT: NX-****-{new Date().getFullYear()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={trackingNumber}
                    onChange={(e) => {
                      setTrackingNumber(e.target.value.toUpperCase());
                      if (!carrierReference || carrierReference === trackingNumber) {
                        setCarrierReference(e.target.value.toUpperCase());
                      }
                    }}
                    placeholder={`NX-8492-${new Date().getFullYear()}`}
                    className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech font-bold text-sm tracking-wider focus:outline-none focus:border-[#0066FF]"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const code = generateDynamicTrackingId();
                      setTrackingNumber(code);
                      setCarrierReference(code);
                    }}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#0066FF]/10 hover:bg-[#0066FF]/20 text-[#0066FF] dark:text-[#38bdf8] border border-[#0066FF]/30 text-xs font-bold font-mono-tech transition-all active:scale-95 whitespace-nowrap"
                    title="Generate New Dynamic NX-****-Year ID"
                  >
                    <Sparkles className="w-4 h-4 text-[#0066FF] dark:text-[#38bdf8]" />
                    <span>Generate ID</span>
                  </button>
                </div>
              </div>

              {/* Carrier Reference No */}
              <div className="md:col-span-5">
                <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1.5 uppercase">
                  Carrier Reference No. *
                </label>
                <input
                  type="text"
                  required
                  value={carrierReference}
                  onChange={(e) => setCarrierReference(e.target.value)}
                  placeholder={`NX-8492-${new Date().getFullYear()}`}
                  className="w-full min-w-0 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech font-bold text-sm tracking-wider focus:outline-none focus:border-[#0066FF]"
                />
              </div>
            </div>
          </div>

          {/* 2. SHIPPER & RECEIVER DETAILS */}
          <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-heading font-bold text-sm uppercase">
                <User className="w-4 h-4 text-emerald-500" />
                <span>2. Shipper Details &amp; Receiver Details</span>
              </div>
              <span className="text-[11px] text-slate-400 font-normal">Section 02/06</span>
            </div>

            {/* Shipper Details (Consignor) */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Shipper Information (Consignor / Origin)</span>
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-bold">
                  ORIGIN DISPATCH
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1.5 uppercase">
                    Shipper Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={shipperName}
                    onChange={(e) => setShipperName(e.target.value)}
                    placeholder="e.g. Minos Herman"
                    className="w-full min-w-0 px-3.5 py-2 rounded-xl bg-white dark:bg-[#070D1D] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1.5 uppercase">
                    Shipper Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={shipperPhone}
                    onChange={(e) => setShipperPhone(e.target.value)}
                    placeholder="e.g. +39 02 8739 4410"
                    className="w-full min-w-0 px-3.5 py-2 rounded-xl bg-white dark:bg-[#070D1D] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1.5 uppercase">
                    Shipper Email
                  </label>
                  <input
                    type="email"
                    value={shipperEmail}
                    onChange={(e) => setShipperEmail(e.target.value)}
                    placeholder="e.g. minos.herman@milano-logistics.it"
                    className="w-full min-w-0 px-3.5 py-2 rounded-xl bg-white dark:bg-[#070D1D] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1.5 uppercase">
                    Shipper Company / Entity
                  </label>
                  <input
                    type="text"
                    value={shipperCompany}
                    onChange={(e) => setShipperCompany(e.target.value)}
                    placeholder="e.g. Herman Precision Trade SRL"
                    className="w-full min-w-0 px-3.5 py-2 rounded-xl bg-white dark:bg-[#070D1D] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white focus:outline-none focus:border-[#0066FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1.5 uppercase">
                  Shipper Street Address &amp; Location *
                </label>
                <input
                  type="text"
                  required
                  value={shipperAddress}
                  onChange={(e) => setShipperAddress(e.target.value)}
                  placeholder="e.g. Via Alberico Albricci 10, Milan, Metropolitan City of Milan"
                  className="w-full min-w-0 px-3.5 py-2 rounded-xl bg-white dark:bg-[#070D1D] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white focus:outline-none focus:border-[#0066FF]"
                />
              </div>
            </div>

            {/* Receiver Details (Consignee) */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-2">
                <span className="font-bold text-[#0066FF] dark:text-[#38bdf8] uppercase flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0066FF]" />
                  <span>Receiver Information (Consignee / Destination)</span>
                </span>
                <span className="text-[10px] bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] px-2 py-0.5 rounded font-bold">
                  FINAL DESTINATION
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1.5 uppercase">
                    Receiver Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="e.g. Letizia Affuso"
                    className="w-full min-w-0 px-3.5 py-2 rounded-xl bg-white dark:bg-[#070D1D] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1.5 uppercase">
                    Receiver Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                    placeholder="e.g. +39 327 1869248"
                    className="w-full min-w-0 px-3.5 py-2 rounded-xl bg-white dark:bg-[#070D1D] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1.5 uppercase">
                    Receiver Email
                  </label>
                  <input
                    type="email"
                    value={receiverEmail}
                    onChange={(e) => setReceiverEmail(e.target.value)}
                    placeholder="e.g. letiziaffuso@gmail.com"
                    className="w-full min-w-0 px-3.5 py-2 rounded-xl bg-white dark:bg-[#070D1D] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1.5 uppercase">
                    Postal Code / Destination Ref
                  </label>
                  <input
                    type="text"
                    value={receiverPostalCode}
                    onChange={(e) => setReceiverPostalCode(e.target.value)}
                    placeholder="e.g. 87074 / 3271869248"
                    className="w-full min-w-0 px-3.5 py-2 rounded-xl bg-white dark:bg-[#070D1D] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white focus:outline-none focus:border-[#0066FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1.5 uppercase">
                  Receiver Street Address &amp; Delivery Destination *
                </label>
                <input
                  type="text"
                  required
                  value={receiverAddress}
                  onChange={(e) => setReceiverAddress(e.target.value)}
                  placeholder="e.g. Via Reggio Calabria 6, Rocca Imperiale (CS)"
                  className="w-full min-w-0 px-3.5 py-2 rounded-xl bg-white dark:bg-[#070D1D] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white focus:outline-none focus:border-[#0066FF]"
                />
              </div>
            </div>
          </div>

          {/* 3. SHIPMENT DETAILS & OPERATIONAL SPECS */}
          <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-heading font-bold text-sm uppercase">
                <Package className="w-4 h-4 text-purple-500" />
                <span>3. Complete Shipment Operational Details</span>
              </div>
              <span className="text-[11px] text-slate-400 font-normal">Section 03/06</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Type of Shipment */}
              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1.5 uppercase">
                  Type of Shipment *
                </label>
                <input
                  type="text"
                  required
                  value={serviceLevel}
                  onChange={(e) => setServiceLevel(e.target.value)}
                  placeholder="e.g. Road Freight Express"
                  className="w-full min-w-0 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              {/* Mode */}
              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1.5 uppercase">
                  Shipment Mode *
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as TransportMode)}
                  className="w-full min-w-0 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white focus:outline-none focus:border-[#0066FF]"
                >
                  <option value="Land Transport">Land Transport</option>
                  <option value="Road Transport">Road Transport</option>
                  <option value="Air Freight">Air Freight</option>
                  <option value="Ocean Freight">Ocean Freight</option>
                  <option value="Rail Express">Rail Express</option>
                  <option value="Multi-Modal">Multi-Modal</option>
                </select>
              </div>

              {/* Carrier */}
              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1.5 uppercase">
                  Carrier / Courier *
                </label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full min-w-0 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-medium focus:outline-none focus:border-[#0066FF]"
                >
                  {CARRIER_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Product / Cargo */}
              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1.5 uppercase">
                  Product / Cargo Description *
                </label>
                <input
                  type="text"
                  required
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value)}
                  placeholder="e.g. SEALED FRAGILE CARTON"
                  className="w-full min-w-0 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              {/* Package Type */}
              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1.5 uppercase">
                  Package Type *
                </label>
                <select
                  value={packageType}
                  onChange={(e) => setPackageType(e.target.value)}
                  className="w-full min-w-0 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-medium focus:outline-none focus:border-[#0066FF]"
                >
                  {PACKAGE_TYPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt.toUpperCase()}>
                      {opt.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1.5 uppercase">
                  Payment Mode *
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full min-w-0 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white focus:outline-none focus:border-[#0066FF]"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Prepaid Corporate Account">Prepaid Corporate Account</option>
                  <option value="Wire Transfer">Wire Transfer</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Freight */}
              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1.5 uppercase">
                  Total Freight Amount *
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={freightCurrency}
                    onChange={(e) => setFreightCurrency(e.target.value)}
                    className="w-24 shrink-0 px-2.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-bold"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CHF">CHF</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={freightAmount}
                    onChange={(e) => setFreightAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0.00"
                    className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white focus:outline-none focus:border-[#0066FF]"
                  />
                </div>
              </div>

              {/* Vessel / Route ID */}
              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1.5 uppercase">
                  Vessel / Flight / Vehicle #
                </label>
                <input
                  type="text"
                  value={vessel}
                  onChange={(e) => setVessel(e.target.value)}
                  placeholder="e.g. FDX-Ground-IT-882"
                  className="w-full min-w-0 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              {/* Container ID */}
              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1.5 uppercase">
                  Container / Seal ID
                </label>
                <input
                  type="text"
                  value={containerNumber}
                  onChange={(e) => setContainerNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. SEAL-IT-99214"
                  className="w-full min-w-0 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white focus:outline-none focus:border-[#0066FF]"
                />
              </div>
            </div>

            {/* Departure, Pickup, and Expected Delivery Dates/Times */}
            <div className="pt-3 border-t border-slate-100 dark:border-white/5">
              <span className="text-[11px] font-bold text-slate-700 dark:text-gray-300 uppercase block mb-2">
                Operational Dates &amp; Dispatch Timeline:
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Departure Schedule */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/5 space-y-2">
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Departure Schedule
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] uppercase mb-1">Departure Date *</label>
                    <input
                      type="date"
                      required
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="w-full min-w-0 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#070D1D] border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] uppercase mb-1">Departure Time *</label>
                    <input
                      type="text"
                      required
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                      placeholder="19:00 pm"
                      className="w-full min-w-0 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#070D1D] border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Pickup Schedule */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/5 space-y-2">
                  <div className="text-[10px] text-[#0066FF] dark:text-[#38bdf8] font-bold uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Pickup Schedule
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] uppercase mb-1">Pickup Date *</label>
                    <input
                      type="date"
                      required
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      className="w-full min-w-0 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#070D1D] border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] uppercase mb-1">Pickup Time *</label>
                    <input
                      type="text"
                      required
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      placeholder="17:00 pm"
                      className="w-full min-w-0 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#070D1D] border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Expected Delivery Date */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/5 space-y-2">
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Target Delivery ETA
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] uppercase mb-1">Expected Delivery Date *</label>
                    <input
                      type="date"
                      required
                      value={expectedDeliveryDate}
                      onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                      className="w-full min-w-0 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#070D1D] border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="text-[10px] text-slate-400 pt-2">
                    Target Consignee Dropoff Window
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. GEOGRAPHIC ORIGIN & DESTINATION */}
          <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-heading font-bold text-sm uppercase">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <span>4. Geographic Origin &amp; Destination Corridor</span>
              </div>
              <span className="text-[11px] text-slate-400 font-normal">Section 04/06</span>
            </div>

            <div className="space-y-6">
              {/* Origin */}
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/5 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/5">
                  <span className="font-bold text-[#0066FF] dark:text-[#38bdf8] uppercase flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0066FF]" />
                    <span>Origin Node (Country &amp; City Departure Hub)</span>
                  </span>
                  <span className="text-[10px] bg-blue-500/10 text-[#0066FF] px-2.5 py-0.5 rounded-md font-bold font-mono">
                    {originCode || 'ORG'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                  <div>
                    <CountrySelect
                      label="Origin Country"
                      required
                      value={originCountry}
                      onChange={(selectedCountry) => {
                        const newCountry = selectedCountry.name;
                        setOriginCountry(newCountry);
                        const coords = locationService.resolveCoordinates(originCity, newCountry);
                        setOriginLat(coords.lat);
                        setOriginLng(coords.lng);
                        const fullLoc = `${originFacility ? originFacility + ', ' : ''}${originCity}, ${newCountry}`;
                        setOriginAddress(fullLoc);
                        setShipperAddress(fullLoc);
                      }}
                      placeholder="Select Country..."
                    />
                  </div>
                  <div>
                    <CitySelect
                      label="Origin City / Port"
                      required
                      countryValue={originCountry}
                      value={originCity}
                      onChange={(selectedCity) => {
                        const newCity = selectedCity.name;
                        setOriginCity(newCity);
                        const coords = (selectedCity.latitude !== 0 || selectedCity.longitude !== 0) 
                          ? { lat: selectedCity.latitude, lng: selectedCity.longitude }
                          : locationService.resolveCoordinates(newCity, originCountry);
                        setOriginLat(coords.lat);
                        setOriginLng(coords.lng);
                        const hub = locationService.findHubByCityAndCountry(newCity, originCountry);
                        const code = hub?.code || (newCity ? newCity.substring(0, 3).toUpperCase() : 'ORG');
                        setOriginCode(code);
                        if (hub?.facility && !originFacility) {
                          setOriginFacility(hub.facility);
                        }
                        const fullLoc = `${hub?.facility || originFacility ? (hub?.facility || originFacility) + ', ' : ''}${newCity}${originCountry ? ', ' + originCountry : ''}`;
                        setOriginAddress(fullLoc);
                        setShipperAddress(fullLoc);
                        setMilestoneLocation(fullLoc);
                      }}
                      placeholder="Select City..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 text-[10px] uppercase mb-1">Origin Facility / Terminal</label>
                  <input
                    type="text"
                    value={originFacility}
                    onChange={(e) => {
                      const val = e.target.value;
                      setOriginFacility(val);
                      const resolved = resolveLocationSync(originCity, originCountry, val);
                      setOriginLat(resolved.lat);
                      setOriginLng(resolved.lng);
                      const fullLoc = `${val ? val + ', ' : ''}${originCity}, ${originCountry}`;
                      setOriginAddress(fullLoc);
                      setShipperAddress(fullLoc);
                      setMilestoneLocation(fullLoc);
                    }}
                    placeholder="e.g. Frankfurt Cargo City South or Custom Terminal"
                    className="w-full min-w-0 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#070D1D] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                {/* Direct GPS Coordinates Edit */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-slate-500 text-[9px] uppercase mb-0.5">Origin Latitude (°N)</label>
                    <input
                      type="number"
                      step="any"
                      value={originLat}
                      onChange={(e) => setOriginLat(parseFloat(e.target.value) || 0)}
                      className="w-full min-w-0 px-2 py-1 rounded bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 text-[11px] font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[9px] uppercase mb-0.5">Origin Longitude (°E)</label>
                    <input
                      type="number"
                      step="any"
                      value={originLng}
                      onChange={(e) => setOriginLng(parseFloat(e.target.value) || 0)}
                      className="w-full min-w-0 px-2 py-1 rounded bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 text-[11px] font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-200 dark:border-white/5">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>GPS Telemetry Fix:</span>
                  </span>
                  <span>{originLat?.toFixed(4)}° N, {originLng?.toFixed(4)}° E</span>
                </div>
              </div>

              {/* Destination */}
              <div className="p-4 sm:p-5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/5 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-white/5">
                  <span className="font-bold text-purple-600 dark:text-purple-400 uppercase flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span>Destination Node (Country &amp; City Arrival Hub)</span>
                  </span>
                  <span className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2.5 py-0.5 rounded-md font-bold font-mono">
                    {destCode || 'DST'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                  <div>
                    <CountrySelect
                      label="Destination Country"
                      required
                      value={destCountry}
                      onChange={(selectedCountry) => {
                        const newCountry = selectedCountry.name;
                        setDestCountry(newCountry);
                        const coords = locationService.resolveCoordinates(destCity, newCountry);
                        setDestLat(coords.lat);
                        setDestLng(coords.lng);
                        const fullLoc = `${destFacility ? destFacility + ', ' : ''}${destCity}, ${newCountry}`;
                        setDestAddress(fullLoc);
                        setReceiverAddress(fullLoc);
                      }}
                      placeholder="Select Country..."
                    />
                  </div>
                  <div>
                    <CitySelect
                      label="Destination City / Port"
                      required
                      countryValue={destCountry}
                      value={destCity}
                      onChange={(selectedCity) => {
                        const newCity = selectedCity.name;
                        setDestCity(newCity);
                        const coords = (selectedCity.latitude !== 0 || selectedCity.longitude !== 0)
                          ? { lat: selectedCity.latitude, lng: selectedCity.longitude }
                          : locationService.resolveCoordinates(newCity, destCountry);
                        setDestLat(coords.lat);
                        setDestLng(coords.lng);
                        const hub = locationService.findHubByCityAndCountry(newCity, destCountry);
                        const code = hub?.code || (newCity ? newCity.substring(0, 3).toUpperCase() : 'DST');
                        setDestCode(code);
                        if (hub?.facility && !destFacility) {
                          setDestFacility(hub.facility);
                        }
                        const fullLoc = `${hub?.facility || destFacility ? (hub?.facility || destFacility) + ', ' : ''}${newCity}${destCountry ? ', ' + destCountry : ''}`;
                        setDestAddress(fullLoc);
                        setReceiverAddress(fullLoc);
                      }}
                      placeholder="Select City..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 text-[10px] uppercase mb-1">Destination Hub / Regional Center</label>
                  <input
                    type="text"
                    value={destFacility}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDestFacility(val);
                      const resolved = resolveLocationSync(destCity, destCountry, val);
                      setDestLat(resolved.lat);
                      setDestLng(resolved.lng);
                      const fullLoc = `${val ? val + ', ' : ''}${destCity}, ${destCountry}`;
                      setDestAddress(fullLoc);
                      setReceiverAddress(fullLoc);
                    }}
                    placeholder="e.g. London Heathrow Logistics Park or Local Hub"
                    className="w-full min-w-0 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#070D1D] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                {/* Direct GPS Coordinates Edit */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-slate-500 text-[9px] uppercase mb-0.5">Destination Latitude (°N)</label>
                    <input
                      type="number"
                      step="any"
                      value={destLat}
                      onChange={(e) => setDestLat(parseFloat(e.target.value) || 0)}
                      className="w-full min-w-0 px-2 py-1 rounded bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 text-[11px] font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[9px] uppercase mb-0.5">Destination Longitude (°E)</label>
                    <input
                      type="number"
                      step="any"
                      value={destLng}
                      onChange={(e) => setDestLng(parseFloat(e.target.value) || 0)}
                      className="w-full min-w-0 px-2 py-1 rounded bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 text-[11px] font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-200 dark:border-white/5">
                  <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    <span>GPS Telemetry Fix:</span>
                  </span>
                  <span>{destLat?.toFixed(4)}° N, {destLng?.toFixed(4)}° E</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. ITEMIZED PACKAGES BREAKDOWN & DYNAMIC CALCULATIONS */}
          <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-heading font-bold text-sm uppercase">
                <Box className="w-4 h-4 text-cyan-500" />
                <span>5. Itemized Packages Table &amp; Dimension Metrics</span>
              </div>
              <span className="text-[11px] text-slate-400 font-normal">Section 05/06</span>
            </div>

            {/* Packages Table */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-slate-700 dark:text-gray-300 font-bold uppercase text-[11px]">
                  Package Line Items ({packages.length} Packages)
                </span>
                <button
                  type="button"
                  onClick={handleAddPackage}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0066FF]/10 text-[#0066FF] hover:bg-[#0066FF]/20 text-xs font-bold font-mono-tech transition-colors cursor-pointer border border-[#0066FF]/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Package Row</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
                <table className="w-full min-w-[650px] text-left font-mono-tech text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 uppercase text-[10px] tracking-wider font-bold bg-slate-50 dark:bg-[#0D1527]">
                      <th className="py-2.5 px-3">Pkg #</th>
                      <th className="py-2.5 px-3">Piece Type</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-center">Length (cm)</th>
                      <th className="py-2.5 px-3 text-center">Width (cm)</th>
                      <th className="py-2.5 px-3 text-center">Height (cm)</th>
                      <th className="py-2.5 px-3 text-right">Weight (kg)</th>
                      <th className="py-2.5 px-2 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {packages.map((pkg, idx) => (
                      <tr key={pkg.packageNumber || idx} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02]">
                        <td className="py-2.5 px-3 font-bold text-[#0066FF]">
                          #{idx + 1}
                        </td>
                        <td className="py-2.5 px-3">
                          <select
                            value={pkg.type}
                            onChange={(e) => handleUpdatePackage(idx, 'type', e.target.value)}
                            className="w-28 px-2 py-1 rounded bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/10 text-xs font-semibold text-slate-900 dark:text-white"
                          >
                            {PACKAGE_TYPE_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            value={pkg.description}
                            onChange={(e) => handleUpdatePackage(idx, 'description', e.target.value)}
                            placeholder="Cargo Description"
                            className="w-full min-w-[140px] px-2 py-1 rounded bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="number"
                            min="0"
                            value={pkg.length === 0 ? '' : pkg.length}
                            placeholder="0"
                            onChange={(e) => handleUpdatePackage(idx, 'length', Number(e.target.value) || 0)}
                            className="w-16 px-1.5 py-1 text-center rounded bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="number"
                            min="0"
                            value={pkg.width === 0 ? '' : pkg.width}
                            placeholder="0"
                            onChange={(e) => handleUpdatePackage(idx, 'width', Number(e.target.value) || 0)}
                            className="w-16 px-1.5 py-1 text-center rounded bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="number"
                            min="0"
                            value={pkg.height === 0 ? '' : pkg.height}
                            placeholder="0"
                            onChange={(e) => handleUpdatePackage(idx, 'height', Number(e.target.value) || 0)}
                            className="w-16 px-1.5 py-1 text-center rounded bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={pkg.weight === 0 ? '' : pkg.weight}
                            placeholder="0.0"
                            onChange={(e) => handleUpdatePackage(idx, 'weight', Number(e.target.value) || 0)}
                            className="w-20 px-2 py-1 text-right font-bold text-emerald-600 dark:text-emerald-400 rounded bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/10 text-xs"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          {packages.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePackage(idx)}
                              className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                              title="Delete row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Automatic Reactive Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-white/5">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/5 space-y-1">
                  <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase flex items-center gap-1 font-bold">
                    <Maximize2 className="w-3 h-3 text-[#0066FF]" /> Total Volumetric Weight
                  </div>
                  <div className="text-slate-950 dark:text-white font-bold text-base">
                    {totalVolumetricWeight.toFixed(2)} kg
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Formula: (L × W × H) / 5000
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/5 space-y-1">
                  <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase flex items-center gap-1 font-bold">
                    <Layers className="w-3 h-3 text-purple-500" /> Total Volume
                  </div>
                  <div className="text-slate-950 dark:text-white font-bold text-base">
                    {totalVolumeCbm.toFixed(3)} cu. m
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Cubic Meters Volume (CBM)
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/5 space-y-1">
                  <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase flex items-center gap-1 font-bold">
                    <Scale className="w-3 h-3 text-emerald-500" /> Total Actual Weight
                  </div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold text-base">
                    {totalActualWeight.toFixed(2)} kg
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Physical Gross Mass
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 6. STATUS, COMMENTS, INITIAL MILESTONE & IOT SENSORS */}
          <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-heading font-bold text-sm uppercase">
                <MessageSquare className="w-4 h-4 text-amber-500" />
                <span>6. Status, Comments &amp; Milestone Audit Log</span>
              </div>
              <span className="text-[11px] text-slate-400 font-normal">Section 06/06</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1.5 uppercase">
                  Consignment Status *
                </label>
                <select
                  value={initialStatus}
                  onChange={(e) => {
                    const st = e.target.value as ShipmentStatus;
                    setInitialStatus(st);
                    if (st === 'Created') setProgressPercent(5);
                    else if (st === 'Picked Up') setProgressPercent(15);
                    else if (st === 'Origin Facility') setProgressPercent(25);
                    else if (st === 'On Hold') setProgressPercent(35);
                    else if (st === 'In Transit') setProgressPercent(55);
                    else if (st === 'Customs Clearance') setProgressPercent(75);
                    else if (st === 'Destination Facility') setProgressPercent(85);
                    else if (st === 'Out for Delivery') setProgressPercent(92);
                    else if (st === 'Delivered') setProgressPercent(100);
                  }}
                  className="w-full min-w-0 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white focus:outline-none focus:border-[#0066FF] font-semibold"
                >
                  <option value="On Hold">On Hold (Hold Status)</option>
                  <option value="In Transit">In Transit (Cross-Border En Route)</option>
                  <option value="Created">Created (Order Registered)</option>
                  <option value="Picked Up">Picked Up (Carrier Custody)</option>
                  <option value="Origin Facility">Origin Facility (Security Scanned)</option>
                  <option value="Departed Origin">Departed Origin Hub</option>
                  <option value="Customs Clearance">Customs Clearance (Import Inspection)</option>
                  <option value="Destination Facility">Destination Facility (Arrived)</option>
                  <option value="Out for Delivery">Out for Delivery (Final Mile)</option>
                  <option value="Delivered">Delivered (Signed &amp; Released)</option>
                  <option value="Exception">Exception</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-slate-700 dark:text-gray-300 font-bold uppercase">
                    Transit Progress (%)
                  </label>
                  <span className="font-bold text-[#0066FF]">{progressPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressPercent}
                  onChange={(e) => setProgressPercent(Number(e.target.value))}
                  className="w-full accent-[#0066FF] mt-2"
                />
              </div>
            </div>

            {/* Comments Card */}
            <div>
              <label className="block text-slate-700 dark:text-gray-300 font-bold mb-1.5 uppercase">
                Special Handling Notes &amp; Consignee Instructions (Comments)
              </label>
              <textarea
                rows={2}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="e.g. Dear client please ensure that your details on the website are correct..."
                className="w-full min-w-0 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white focus:outline-none focus:border-[#0066FF]"
              />
            </div>

            {/* Initial Milestone Log */}
            <div className="pt-3 border-t border-slate-100 dark:border-white/5 space-y-3">
              <span className="text-[11px] font-bold text-slate-700 dark:text-gray-300 uppercase block">
                Initial Milestone Audit Log:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 text-[10px] uppercase mb-1">Milestone Remarks (Short Title)</label>
                  <input
                    type="text"
                    value={milestoneRemarks}
                    onChange={(e) => setMilestoneRemarks(e.target.value)}
                    placeholder="e.g. Pacco Registrato"
                    className="w-full min-w-0 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white text-xs focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 text-[10px] uppercase mb-1">Milestone Location</label>
                  <input
                    type="text"
                    value={milestoneLocation}
                    onChange={(e) => setMilestoneLocation(e.target.value)}
                    placeholder="Via Alberico Albricci 10, Milan, Italy"
                    className="w-full min-w-0 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white text-xs focus:outline-none focus:border-[#0066FF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] uppercase mb-1">Milestone Detailed Description</label>
                <textarea
                  rows={2}
                  value={milestoneDesc}
                  onChange={(e) => setMilestoneDesc(e.target.value)}
                  placeholder="Shipment registered and placed on security hold awaiting clearance verification."
                  className="w-full min-w-0 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white text-xs focus:outline-none focus:border-[#0066FF]"
                />
              </div>
            </div>
          </div>

          {/* SUBMIT ACTIONS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <Link
              to="/admin/shipments"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 font-heading font-bold text-xs uppercase tracking-wider text-center"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#0066FF]/30 active:scale-[0.99] flex items-center justify-center gap-2 group transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300 group-hover:scale-110 transition-transform" />
              <span>Save &amp; Activate Tracking</span>
            </button>
          </div>
        </form>

        {/* ================= LIVE PREVIEW HUD (4 cols) ================= */}
        <div className="lg:col-span-4 space-y-6">
          <div className="sticky top-24 space-y-6">
            {/* Live Waybill Card Preview */}
            <div className="bg-[#070D1D] text-white rounded-3xl p-6 border border-white/15 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#0066FF]/15 rounded-full blur-2xl pointer-events-none" />
              
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2 font-mono-tech text-[10px] uppercase font-bold text-[#38bdf8]">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-[#0066FF]" />
                  <span>CONSIGNMENT PREVIEW</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono-tech text-[10px] font-bold">
                  {initialStatus}
                </span>
              </div>

              {/* Waybill Code */}
              <div className="mb-4">
                <div className="text-[10px] font-mono-tech uppercase text-gray-400">WAYBILL TRACKING IDENTIFIER</div>
                <div className="font-heading font-black text-lg text-white tracking-wider flex items-center gap-2 mt-0.5 break-all">
                  <span>{trackingNumber || 'WPC02936431774532881783-CARGO'}</span>
                </div>
              </div>

              {/* Route Visual */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 mb-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-heading font-black">
                  <div>
                    <div className="text-[#38bdf8] text-base">{originCode || 'ORIGIN'}</div>
                    <div className="text-gray-300 text-[11px] font-mono-tech font-normal truncate max-w-[100px]">
                      {originCity || 'Not specified'}
                    </div>
                  </div>

                  <div className="flex-1 px-3 flex flex-col items-center">
                    <div className="text-[10px] font-mono-tech text-gray-400 mb-1 flex items-center gap-1">
                      {mode === 'Air Freight' && <Plane className="w-3 h-3 text-[#38bdf8]" />}
                      {mode === 'Ocean Freight' && <Ship className="w-3 h-3 text-cyan-400" />}
                      {(mode === 'Road Transport' || mode === 'Land Transport') && <Truck className="w-3 h-3 text-amber-400" />}
                      {mode === 'Rail Express' && <Train className="w-3 h-3 text-emerald-400" />}
                      <span>{mode}</span>
                    </div>
                    <div className="w-full h-1 bg-white/10 rounded-full relative">
                      <div 
                        className="h-full bg-gradient-to-r from-[#0066FF] to-[#38bdf8] rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="text-[9px] font-mono-tech text-gray-400 mt-1">
                      {originLat && destLat ? `~${approximateDistanceKm.toLocaleString()} KM` : 'Awaiting Coordinates'}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-purple-400 text-base">{destCode || 'DEST'}</div>
                    <div className="text-gray-300 text-[11px] font-mono-tech font-normal truncate max-w-[100px]">
                      {destCity || 'Not specified'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipper & Receiver Summary */}
              <div className="space-y-2 mb-4 text-xs font-mono-tech">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-[10px] text-gray-400 uppercase">SHIPPER</div>
                  <div className="font-bold text-white mt-0.5 truncate">{shipperName || 'Consignor Pending'}</div>
                  <div className="text-[10px] text-gray-400 truncate">{shipperAddress || 'No origin address entered'}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-[10px] text-gray-400 uppercase">RECEIVER</div>
                  <div className="font-bold text-white mt-0.5 truncate">{receiverName || 'Consignee Pending'}</div>
                  <div className="text-[10px] text-gray-400 truncate">{receiverAddress || 'No destination address entered'}</div>
                </div>
              </div>

              {/* Key Metadata Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono-tech mb-4">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-[10px] text-gray-400 uppercase">WEIGHT &amp; CBM</div>
                  <div className="font-bold text-white mt-0.5">
                    {totalActualWeight.toFixed(1)} KG • {totalVolumeCbm.toFixed(2)} m³
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-[10px] text-gray-400 uppercase">CARRIER / FREIGHT</div>
                  <div className="font-bold text-white mt-0.5 truncate">
                    {carrier} • {freightCurrency} {freightAmount !== '' ? freightAmount : '0.00'}
                  </div>
                </div>
              </div>

              {/* Barcode Simulation */}
              <div className="pt-2 border-t border-white/10 text-center">
                <div className="font-mono text-[9px] text-gray-400 tracking-widest uppercase mb-1">
                  AUTHENTICATED LOGISTICS BARCODE
                </div>
                <div className="h-10 bg-white rounded-lg flex items-center justify-center p-2 text-black font-mono font-bold tracking-widest text-[10px]">
                  ||||| | |||| || |||||| | ||||| |||||||
                </div>
                <div className="text-[9px] font-mono-tech text-gray-400 mt-1 truncate">
                  * {trackingNumber || 'WPC02936431774532881783-CARGO'} *
                </div>
              </div>
            </div>

            {/* Quick Operations Guide */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 text-xs font-mono-tech space-y-2 text-slate-600 dark:text-gray-400">
              <div className="font-bold text-slate-900 dark:text-white uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Single Source of Truth</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Saving this form instantly provisions the shipment in the shared database. Any user tracking this waybill ID will immediately view this complete record.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS CONFIRMATION MODAL */}
      <AnimatePresence>
        {createdShipment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/15 p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-white space-y-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="font-heading font-black text-2xl uppercase tracking-tight">
                  Shipment Created &amp; Synced!
                </h2>
                <p className="text-xs font-mono-tech text-slate-500 dark:text-gray-400">
                  Consignment Waybill has been registered in the system and customer notification generated.
                </p>
              </div>

              {/* Receiver Email & Shipment ID Delivery Suite */}
              <div className="p-4 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 text-xs font-mono-tech space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0066FF] dark:text-[#38bdf8] flex items-center gap-1.5 uppercase text-[11px]">
                    <Mail className="w-3.5 h-3.5" />
                    <span>Inbound Consignment Notice to Receiver</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    AUTOMATED DISPATCH ACTIVE
                  </span>
                </div>

                <div className="space-y-1 text-slate-600 dark:text-gray-300 text-[11px]">
                  <div>
                    Consignee / Receiver: <strong className="text-slate-900 dark:text-white">{createdShipment.receiver?.name || createdShipment.customerName || 'Valued Consignee'}</strong>
                  </div>
                  <div>
                    Target Email: <strong className="text-slate-900 dark:text-white">{createdShipment.receiver?.email || createdShipment.customerEmail || 'Configured Destination'}</strong>
                  </div>
                </div>

                {/* Optional Custom Note / Instructions for Receiver */}
                <div className="space-y-1 pt-1">
                  <label className="text-[10px] text-slate-500 dark:text-gray-400 uppercase font-bold flex items-center justify-between">
                    <span>Add Custom Note or Delivery Instruction for Receiver</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Please present photo ID and Shipment ID upon cargo arrival at destination gate 4..."
                    value={receiverCustomNote}
                    onChange={(e) => setReceiverCustomNote(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                {/* Email Dispatch Buttons */}
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleManualSendReceiverEmail}
                    disabled={isSendingReceiverEmail}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-bold font-heading uppercase transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Send className={`w-3.5 h-3.5 ${isSendingReceiverEmail ? 'animate-spin' : ''}`} />
                    <span>{isSendingReceiverEmail ? 'Dispatching...' : 'Send / Resend Email to Receiver'}</span>
                  </button>

                  {/* 1-Click Gmail Action */}
                  {createdEmailRecord?.gmailComposeUrl && (
                    <a
                      href={createdEmailRecord.gmailComposeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#EA4335] hover:bg-[#d93025] text-white text-xs font-bold transition-colors shadow-sm"
                      title="Open and send directly from your personal or work Gmail"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Open in Gmail</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const trackingUrl = emailService.getTrackingCustomerUrl(createdShipment.trackingNumber);
                      navigator.clipboard.writeText(trackingUrl);
                      setCopiedTrackingUrl(true);
                      setTimeout(() => setCopiedTrackingUrl(false), 2000);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 text-slate-800 dark:text-gray-200 text-xs font-bold transition-colors"
                  >
                    {copiedTrackingUrl ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedTrackingUrl ? 'Tracking Link Copied!' : 'Copy Tracking Link'}</span>
                  </button>
                </div>

                {receiverEmailSuccessFeedback && (
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>{receiverEmailSuccessFeedback}</span>
                  </div>
                )}
              </div>

              {/* Waybill Code Pill (Shipment ID) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 flex items-center justify-between font-mono-tech">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Shipment ID / Waybill #</span>
                  <span className="font-heading font-bold text-sm sm:text-base text-slate-900 dark:text-white break-all">
                    {createdShipment.trackingNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(createdShipment.trackingNumber)}
                  className="p-2 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 flex items-center gap-1.5 text-xs font-bold shrink-0 ml-2 cursor-pointer"
                  title="Copy Shipment ID"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Route Summary */}
              <div className="text-xs font-mono-tech p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-between">
                <span>{createdShipment.origin.city}</span>
                <span className="text-[#0066FF]">────── {createdShipment.transportMode} ──────▶</span>
                <span>{createdShipment.destination.city}</span>
              </div>

              {/* Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <Link
                  to={`/tracking?number=${createdShipment.trackingNumber}`}
                  className="py-3 px-4 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 shadow-md shadow-[#0066FF]/20 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Public Tracking View</span>
                </Link>

                <Link
                  to={`/admin/shipments/${createdShipment.id}`}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-900 dark:text-white font-heading font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 border border-slate-200 dark:border-white/10"
                >
                  <FileText className="w-4 h-4" />
                  <span>Admin Telemetry Desk</span>
                </Link>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/5 text-xs font-mono-tech">
                <button
                  type="button"
                  onClick={() => {
                    setPrintedShipment(createdShipment);
                    setCreatedShipment(null);
                    setShowPrintModal(true);
                  }}
                  className="text-[#0066FF] hover:underline flex items-center gap-1.5 font-bold cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Consignment Document</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCreatedShipment(null);
                    setCreatedEmailRecord(null);
                    const newCode = generateTrackingCode();
                    setTrackingNumber(newCode);
                    setCarrierReference(newCode);
                  }}
                  className="text-slate-500 hover:text-slate-800 dark:hover:text-white font-bold cursor-pointer"
                >
                  + Create Another
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* OFFICIAL PRINTABLE CONSIGNMENT DOSSIER MODAL */}
      {showPrintModal && printedShipment && (
        <PrintableShipmentDossier
          shipment={printedShipment}
          isModal={true}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
};
