import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Search, Compass, CheckCircle2, AlertCircle, Sparkles, Navigation, Globe, Building2, Sliders } from 'lucide-react';
import { CountrySelect } from '../common/CountrySelect';
import { CitySelect } from '../common/CitySelect';
import { locationService, StructuredCountry, StructuredCity } from '../../services/locationService';
import { GLOBAL_HUBS } from '../../data/hubPresets';
import { resolveLocationSync, resolveLocationAsync, validateCoordinates, isMaliAnomaly, GeoLocationResult } from '../../utils/geoUtils';

export interface MilestoneLocationValue {
  locationString: string;
  country: string;
  countryCode?: string;
  city: string;
  facility?: string;
  lat: number;
  lng: number;
}

export interface MilestoneLocationPickerProps {
  value: MilestoneLocationValue;
  onChange: (val: MilestoneLocationValue) => void;
  originHint?: { city: string; country: string; lat: number; lng: number };
  destinationHint?: { city: string; country: string; lat: number; lng: number };
  currentHint?: { city: string; country: string; lat: number; lng: number };
  className?: string;
  autoFocus?: boolean;
}

export const MilestoneLocationPicker: React.FC<MilestoneLocationPickerProps> = ({
  value,
  onChange,
  originHint,
  destinationHint,
  currentHint,
  className = '',
}) => {
  const [mode, setMode] = useState<'structured' | 'quickSearch' | 'manualCoords'>('structured');
  const [quickQuery, setQuickQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GeoLocationResult[]>([]);
  const [facilityName, setFacilityName] = useState(value.facility || '');
  const [manualLat, setManualLat] = useState<string>(validateCoordinates(value.lat, value.lng) ? value.lat.toFixed(5) : '');
  const [manualLng, setManualLng] = useState<string>(validateCoordinates(value.lat, value.lng) ? value.lng.toFixed(5) : '');

  // Leaflet Mini Map Preview refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const isValid = validateCoordinates(value.lat, value.lng);
  const isAnomaly = isValid && isMaliAnomaly(value.lat, value.lng, originHint?.country, destinationHint?.country);

  // Sync internal facility field when value changes externally
  useEffect(() => {
    if (value.facility !== undefined && value.facility !== facilityName) {
      setFacilityName(value.facility || '');
    }
    if (validateCoordinates(value.lat, value.lng)) {
      setManualLat(value.lat.toFixed(5));
      setManualLng(value.lng.toFixed(5));
    }
  }, [value.facility, value.lat, value.lng]);

  // Mini Map Preview Initialization & Update
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    if (!mapInstanceRef.current) {
      // Clean leftover leaflet state
      if ((container as any)._leaflet_id) {
        delete (container as any)._leaflet_id;
      }

      const initialLat = isValid ? value.lat : originHint?.lat || 4.156;
      const initialLng = isValid ? value.lng : originHint?.lng || 9.241;

      const map = L.map(container, {
        center: [initialLat, initialLng],
        zoom: isValid ? 11 : 5,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // User-provided CARTO API access token with environment variable override
      const CARTO_API_KEY =
        (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CARTO_API_KEY) ||
        'cb1_2pdp_1_d42bfbeae3f2fcc35b940957';

      // Seamless, high-performance Dark CARTO basemap raster tile layer with API key
      const cartoUrl = CARTO_API_KEY
        ? `https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${encodeURIComponent(CARTO_API_KEY)}`
        : 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png';

      const tileLayer = L.tileLayer(cartoUrl, {
        maxZoom: 20,
        subdomains: 'abcd',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>',
      });

      tileLayer.on('tileerror', () => {
        tileLayer.setUrl('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png');
      });

      tileLayer.addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    if (map && isValid) {
      map.setView([value.lat, value.lng], 11, { animate: true });

      if (markerRef.current) {
        markerRef.current.setLatLng([value.lat, value.lng]);
      } else {
        const customIcon = L.divIcon({
          className: 'custom-checkpoint-pin',
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 30px; height: 30px;">
              <div style="position: absolute; width: 34px; height: 34px; border-radius: 9999px; background-color: #0066FF; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="width: 18px; height: 18px; border-radius: 9999px; background-color: #0066FF; border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(0,102,255,0.7); display: flex; align-items: center; justify-content: center;">
                <div style="width: 5px; height: 5px; border-radius: 9999px; background-color: #ffffff;"></div>
              </div>
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        markerRef.current = L.marker([value.lat, value.lng], { icon: customIcon }).addTo(map);
      }
    }
  }, [value.lat, value.lng, isValid, originHint?.lat, originHint?.lng]);

  // Clean map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {}
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Helper to compile full location string
  const compileLocationString = (city: string, country: string, facility?: string) => {
    const parts: string[] = [];
    if (facility && facility.trim()) parts.push(facility.trim());
    if (city && city.trim()) parts.push(city.trim());
    if (country && country.trim()) parts.push(country.trim());
    return parts.join(', ') || city || country || 'Custom Location';
  };

  // Handle Country selection
  const handleCountrySelect = (c: StructuredCountry) => {
    const newCountry = c.name;
    const citiesInCountry = locationService.getCitiesByCountry(c.isoCode);
    const hasSameCity = citiesInCountry.some(
      (item) => item.name.toLowerCase() === (value.city || '').toLowerCase().trim()
    );

    const targetCity = hasSameCity ? value.city : (citiesInCountry[0]?.name || '');
    const coords = locationService.resolveCoordinates(targetCity, newCountry);

    const lat = coords.lat || c.latitude;
    const lng = coords.lng || c.longitude;

    const newLocString = compileLocationString(targetCity, newCountry, facilityName);

    onChange({
      country: newCountry,
      countryCode: c.isoCode,
      city: targetCity,
      facility: facilityName,
      locationString: newLocString,
      lat,
      lng,
    });
  };

  // Handle City selection
  const handleCitySelect = (
    c: StructuredCity | { name: string; latitude: number; longitude: number; isHub?: boolean; facility?: string }
  ) => {
    const cityName = c.name;
    const resolved = locationService.resolveCoordinates(cityName, value.country);
    const countryObj = locationService.findCountry(value.country);

    const lat = ('latitude' in c && c.latitude) ? c.latitude : resolved.lat;
    const lng = ('longitude' in c && c.longitude) ? c.longitude : resolved.lng;
    const facility = ('facility' in c && c.facility) ? c.facility : facilityName;

    const newLocString = compileLocationString(cityName, value.country || resolved.country, facility);

    onChange({
      country: value.country || resolved.country,
      countryCode: countryObj?.isoCode || '',
      city: cityName,
      facility,
      locationString: newLocString,
      lat,
      lng,
    });
  };

  // Handle Facility/Checkpoint Name Change
  const handleFacilityChange = (text: string) => {
    setFacilityName(text);
    const newLocString = compileLocationString(value.city, value.country, text);
    onChange({
      ...value,
      facility: text,
      locationString: newLocString,
    });
  };

  // Quick Preset Handlers
  const applyPreset = (preset: { city: string; country: string; lat: number; lng: number }, labelPrefix?: string) => {
    const countryObj = locationService.findCountry(preset.country);
    const facility = labelPrefix || '';
    setFacilityName(facility);
    const locString = compileLocationString(preset.city, preset.country, facility);

    onChange({
      country: preset.country,
      countryCode: countryObj?.isoCode || '',
      city: preset.city,
      facility,
      locationString: locString,
      lat: preset.lat,
      lng: preset.lng,
    });
  };

  // Quick search execution
  const executeQuickSearch = async (searchTerm?: string) => {
    const term = (searchTerm !== undefined ? searchTerm : quickQuery).trim();
    if (!term) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results: GeoLocationResult[] = [];
      const queryLower = term.toLowerCase();

      // 1. Check known global logistics hubs (e.g. Douala, Buea, Bamenda, Yaounde, Frankfurt, Shanghai...)
      const matchedHubs = GLOBAL_HUBS.filter(
        (h) =>
          h.city.toLowerCase() === queryLower ||
          h.city.toLowerCase().includes(queryLower) ||
          queryLower.includes(h.city.toLowerCase()) ||
          h.facility.toLowerCase().includes(queryLower) ||
          (h.code && h.code.toLowerCase() === queryLower)
      );
      matchedHubs.forEach((hub) => {
        results.push({
          city: hub.city,
          country: hub.country,
          lat: hub.lat,
          lng: hub.lng,
          source: 'dictionary',
          displayName: `${hub.facility || hub.city} (${hub.code || hub.city}), ${hub.country}`,
        });
      });

      // 2. Check country matches
      const countryMatch = locationService.findCountry(term);
      if (countryMatch && validateCoordinates(countryMatch.latitude, countryMatch.longitude)) {
        const notYet = !results.some((r) => Math.hypot(r.lat - countryMatch.latitude, r.lng - countryMatch.longitude) < 0.05);
        if (notYet) {
          results.push({
            city: countryMatch.name,
            country: countryMatch.name,
            lat: countryMatch.latitude,
            lng: countryMatch.longitude,
            source: 'dictionary',
            displayName: `${countryMatch.name} (National Logistics Hub)`,
          });
        }
      }

      // 3. Check cities across country hint or Cameroon or all countries
      const targetCountryCode = value.country ? locationService.findCountry(value.country)?.isoCode || 'CM' : 'CM';
      const cityMatches = locationService.searchCities(targetCountryCode, term, 6);
      cityMatches.forEach((cm) => {
        const already = results.some((r) => Math.hypot(r.lat - cm.latitude, r.lng - cm.longitude) < 0.05);
        if (!already && validateCoordinates(cm.latitude, cm.longitude)) {
          results.push({
            city: cm.name,
            country: cm.countryName,
            lat: cm.latitude,
            lng: cm.longitude,
            source: 'dictionary',
            displayName: `${cm.name}, ${cm.countryName}${cm.isHub ? ' [Logistics Hub]' : ''}`,
          });
        }
      });

      // If targetCountryCode wasn't 'CM', also search Cameroon cities
      if (targetCountryCode !== 'CM') {
        const cmCities = locationService.searchCities('CM', term, 4);
        cmCities.forEach((cm) => {
          const already = results.some((r) => Math.hypot(r.lat - cm.latitude, r.lng - cm.longitude) < 0.05);
          if (!already && validateCoordinates(cm.latitude, cm.longitude)) {
            results.push({
              city: cm.name,
              country: cm.countryName,
              lat: cm.latitude,
              lng: cm.longitude,
              source: 'dictionary',
              displayName: `${cm.name}, ${cm.countryName}${cm.isHub ? ' [Logistics Hub]' : ''}`,
            });
          }
        });
      }

      // 4. Perform async geocoding for precise address matching
      const asyncRes = await resolveLocationAsync(term, value.country || originHint?.country);
      if (validateCoordinates(asyncRes.lat, asyncRes.lng) && !isMaliAnomaly(asyncRes.lat, asyncRes.lng, originHint?.country, destinationHint?.country)) {
        const exists = results.some((r) => Math.hypot(r.lat - asyncRes.lat, r.lng - asyncRes.lng) < 0.05);
        if (!exists) {
          results.unshift({
            ...asyncRes,
            displayName: asyncRes.displayName || `${asyncRes.city}, ${asyncRes.country}`,
          });
        }
      }

      setSearchResults(results);
    } catch (err) {
      console.warn('Quick search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced auto-search when quickQuery changes
  useEffect(() => {
    if (mode !== 'quickSearch') return;
    const trimmed = quickQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      executeQuickSearch(trimmed);
    }, 350);
    return () => clearTimeout(timer);
  }, [quickQuery, mode]);

  const selectSearchResult = (item: GeoLocationResult) => {
    const countryObj = locationService.findCountry(item.country);
    const locString = compileLocationString(item.city, item.country, facilityName);

    onChange({
      country: item.country,
      countryCode: countryObj?.isoCode || '',
      city: item.city,
      facility: facilityName,
      locationString: locString,
      lat: item.lat,
      lng: item.lng,
    });
    setSearchResults([]);
    setQuickQuery('');
    setMode('structured');
  };

  // Manual Coordinates Apply
  const applyManualCoordinates = () => {
    const parsedLat = parseFloat(manualLat);
    const parsedLng = parseFloat(manualLng);
    if (validateCoordinates(parsedLat, parsedLng)) {
      const locString = compileLocationString(value.city || 'Custom Checkpoint', value.country || 'Coordinates', facilityName);
      onChange({
        ...value,
        lat: parsedLat,
        lng: parsedLng,
        locationString: locString,
      });
    }
  };

  return (
    <div className={`space-y-4 rounded-2xl bg-slate-50/80 dark:bg-[#0B1528]/80 border border-slate-200 dark:border-white/10 p-4 sm:p-5 ${className}`}>
      {/* Header with Mode Switcher & Presets */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-heading font-extrabold uppercase text-slate-900 dark:text-white tracking-wide">
              Milestone Geographic Verification
            </div>
            <div className="text-[10px] font-mono-tech text-slate-500 dark:text-gray-400">
              Verified GPS positioning coordinates
            </div>
          </div>
        </div>

        {/* Mode Toggle Buttons */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#070D1D] p-1 rounded-xl border border-slate-200 dark:border-white/10 text-[11px] font-mono-tech">
          <button
            type="button"
            onClick={() => setMode('structured')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              mode === 'structured'
                ? 'bg-[#0066FF] text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            City &amp; Country
          </button>
          <button
            type="button"
            onClick={() => setMode('quickSearch')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              mode === 'quickSearch'
                ? 'bg-[#0066FF] text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            Address Search
          </button>
          <button
            type="button"
            onClick={() => setMode('manualCoords')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              mode === 'manualCoords'
                ? 'bg-[#0066FF] text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-950 dark:hover:text-white'
            }`}
          >
            GPS Coordinates
          </button>
        </div>
      </div>

      {/* Quick Corridor Shortcuts */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-gray-500 font-mono-tech">
          Quick Fill:
        </span>
        {originHint && (
          <button
            type="button"
            onClick={() => applyPreset(originHint, 'Origin Facility Departure')}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono-tech font-bold transition-colors flex items-center gap-1 border border-emerald-500/20 cursor-pointer"
          >
            <Navigation className="w-3 h-3 text-emerald-500" />
            <span>Origin: {originHint.city}</span>
          </button>
        )}
        {destinationHint && (
          <button
            type="button"
            onClick={() => applyPreset(destinationHint, 'Destination Customs Clearance')}
            className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-mono-tech font-bold transition-colors flex items-center gap-1 border border-amber-500/20 cursor-pointer"
          >
            <MapPin className="w-3 h-3 text-amber-500" />
            <span>Destination: {destinationHint.city}</span>
          </button>
        )}
        {currentHint && (
          <button
            type="button"
            onClick={() => applyPreset(currentHint, 'Active Transit Checkpoint')}
            className="px-2.5 py-1 rounded-lg bg-[#0066FF]/10 hover:bg-[#0066FF]/20 text-[#0066FF] dark:text-[#38bdf8] text-[10px] font-mono-tech font-bold transition-colors flex items-center gap-1 border border-[#0066FF]/20 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-[#0066FF]" />
            <span>Current: {currentHint.city}</span>
          </button>
        )}
      </div>

      {/* MODE 1: STRUCTURED COUNTRY & CITY SELECTOR */}
      {mode === 'structured' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <CountrySelect
              label="Checkpoint Country *"
              value={value.country}
              onChange={handleCountrySelect}
              required
              showPopularShortcuts
              placeholder="e.g. Cameroon, France, Italy..."
            />
            <CitySelect
              label="Checkpoint City / Terminal *"
              countryValue={value.country}
              value={value.city}
              onChange={handleCitySelect}
              required
              placeholder="e.g. Buea, Bamenda, Douala, Yaoundé..."
              allowCustom
            />
          </div>

          <div>
            <label className="block text-[10px] font-mono-tech font-bold uppercase text-slate-600 dark:text-gray-400 mb-1">
              Specific Checkpoint / Hub / Facility Name (Optional)
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={facilityName}
                onChange={(e) => handleFacilityChange(e.target.value)}
                placeholder="e.g. Central Airside Freight Warehouse, Mile 17 Checkpoint Gate 4..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-[#070D1D] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs font-mono-tech focus:outline-none focus:border-[#0066FF]"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: QUICK ADDRESS SEARCH */}
      {mode === 'quickSearch' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), executeQuickSearch())}
                placeholder="Type location e.g. Bamenda Cameroon, Buea, Douala Port, Paris..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-[#070D1D] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs font-mono-tech focus:outline-none focus:border-[#0066FF]"
              />
            </div>
            <button
              type="button"
              onClick={() => executeQuickSearch()}
              disabled={isSearching || !quickQuery.trim()}
              className="px-4 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold text-xs uppercase font-heading tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSearching ? <span className="animate-spin">⏳</span> : <Search className="w-3.5 h-3.5" />}
              <span>Search</span>
            </button>
          </div>

          {/* Search Results list */}
          {searchResults.length > 0 && (
            <div className="p-2 rounded-xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 space-y-1 max-h-48 overflow-y-auto">
              {searchResults.map((res, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectSearchResult(res)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-mono-tech text-slate-900 dark:text-white flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#0066FF] shrink-0" />
                    <span>{res.displayName || `${res.city}, ${res.country}`}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono-tech">
                    {res.lat.toFixed(4)}, {res.lng.toFixed(4)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODE 3: DIRECT GPS COORDINATES */}
      {mode === 'manualCoords' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono-tech font-bold uppercase text-slate-600 dark:text-gray-400 mb-1">
                Latitude (-90.0 to 90.0) *
              </label>
              <input
                type="number"
                step="any"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                onBlur={applyManualCoordinates}
                placeholder="e.g. 4.1560 (Buea)"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#070D1D] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs font-mono-tech focus:outline-none focus:border-[#0066FF]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono-tech font-bold uppercase text-slate-600 dark:text-gray-400 mb-1">
                Longitude (-180.0 to 180.0) *
              </label>
              <input
                type="number"
                step="any"
                value={manualLng}
                onChange={(e) => setManualLng(e.target.value)}
                onBlur={applyManualCoordinates}
                placeholder="e.g. 9.2410"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#070D1D] border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white text-xs font-mono-tech focus:outline-none focus:border-[#0066FF]"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={applyManualCoordinates}
              className="px-3.5 py-1.5 rounded-lg bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold text-xs uppercase font-mono-tech cursor-pointer"
            >
              Lock GPS Coordinates
            </button>
          </div>
        </div>
      )}

      {/* RESOLVED COORDINATES STATUS BAR */}
      <div className="p-3 rounded-xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono-tech">
        <div className="flex items-center gap-2">
          {isValid && !isAnomaly ? (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>COORDINATES VERIFIED</span>
            </div>
          ) : isAnomaly ? (
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>MALI COORDINATE ANOMALY DETECTED</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-rose-500 font-bold">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>COORDINATES PENDING RESOLUTION</span>
            </div>
          )}
          <span className="text-slate-400 dark:text-gray-500">|</span>
          <span className="text-slate-800 dark:text-gray-200">
            {value.locationString || 'No location configured'}
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-slate-500">LAT:</span>
          <strong className="text-slate-900 dark:text-white">{isValid ? value.lat.toFixed(5) : '---'}</strong>
          <span className="text-slate-500">LNG:</span>
          <strong className="text-slate-900 dark:text-white">{isValid ? value.lng.toFixed(5) : '---'}</strong>
        </div>
      </div>

      {isAnomaly && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-mono-tech flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <strong>Warning:</strong> The resolved coordinates ({value.lat.toFixed(4)}, {value.lng.toFixed(4)}) fall into the Sahara/Mali region, while the corridor is {originHint?.country || value.country}. Please re-select the city from the dropdown above to lock the exact location.
          </div>
        </div>
      )}

      {/* LIVE INTERACTIVE LEAFLET MINI-MAP PREVIEW */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-mono-tech uppercase font-bold text-slate-500 dark:text-gray-400">
          <span>Geographic Marker Verification Preview</span>
          {isValid && (
            <span className="text-emerald-500 flex items-center gap-1">
              ● Marker Placed at {value.city || 'Checkpoint'}
            </span>
          )}
        </div>
        <div
          ref={mapContainerRef}
          className="w-full h-44 rounded-xl border border-slate-300 dark:border-white/15 overflow-hidden shadow-inner bg-[#070D1D]"
        />
      </div>
    </div>
  );
};
