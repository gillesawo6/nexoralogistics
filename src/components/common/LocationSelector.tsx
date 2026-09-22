import React from 'react';
import { ArrowRightLeft, Sparkles, MapPin, Navigation } from 'lucide-react';
import { CountrySelect } from './CountrySelect';
import { CitySelect } from './CitySelect';
import { locationService, StructuredCountry, StructuredCity } from '../../services/locationService';

export interface LocationData {
  city: string;
  country: string;
  countryCode?: string;
  address?: string;
  lat?: number;
  lng?: number;
  code?: string;
  facility?: string;
}

export interface SingleLocationSelectorProps {
  country: string;
  city: string;
  address?: string;
  onChange: (data: LocationData) => void;
  countryLabel?: string;
  cityLabel?: string;
  addressLabel?: string;
  showAddress?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  idPrefix?: string;
  showPopularCountries?: boolean;
}

export const SingleLocationSelector: React.FC<SingleLocationSelectorProps> = ({
  country,
  city,
  address = '',
  onChange,
  countryLabel = 'Country',
  cityLabel = 'City / Terminal',
  addressLabel = 'Street Address / Facility (Optional)',
  showAddress = false,
  required = false,
  disabled = false,
  className = '',
  idPrefix = 'loc',
  showPopularCountries = false,
}) => {
  const handleCountryChange = (c: StructuredCountry) => {
    // If country changes, check if current city belongs to the new country, otherwise reset or pick first hub
    const newCountryName = c.name;
    const newCountryCode = c.isoCode;
    const citiesInNewCountry = locationService.getCitiesByCountry(newCountryCode);
    const hasSameCity = citiesInNewCountry.some(
      (item) => item.name.toLowerCase() === city.toLowerCase().trim()
    );

    const targetCity = hasSameCity ? city : '';
    const coords = locationService.resolveCoordinates(targetCity, newCountryName);

    onChange({
      country: newCountryName,
      countryCode: newCountryCode,
      city: targetCity,
      address,
      lat: coords.lat,
      lng: coords.lng,
      code: coords.code,
    });
  };

  const handleCityChange = (
    c: StructuredCity | { name: string; latitude: number; longitude: number; isHub?: boolean; hubCode?: string; facility?: string }
  ) => {
    const coords = locationService.resolveCoordinates(c.name, country);
    const countryObj = locationService.findCountry(country);

    onChange({
      country: country || coords.country,
      countryCode: countryObj?.isoCode || '',
      city: c.name,
      address,
      lat: ('latitude' in c && c.latitude) ? c.latitude : coords.lat,
      lng: ('longitude' in c && c.longitude) ? c.longitude : coords.lng,
      code: ('hubCode' in c && c.hubCode) ? c.hubCode : coords.code,
      facility: ('facility' in c) ? c.facility : undefined,
    });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddr = e.target.value;
    onChange({
      country,
      city,
      address: newAddr,
    });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CountrySelect
          id={`${idPrefix}-country`}
          label={countryLabel}
          value={country}
          onChange={handleCountryChange}
          required={required}
          disabled={disabled}
          showPopularShortcuts={showPopularCountries}
        />

        <CitySelect
          id={`${idPrefix}-city`}
          label={cityLabel}
          countryValue={country}
          value={city}
          onChange={handleCityChange}
          required={required}
          disabled={disabled}
        />
      </div>

      {showAddress && (
        <div>
          <label className="block text-[11px] font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
            {addressLabel}
          </label>
          <input
            type="text"
            value={address}
            onChange={handleAddressChange}
            disabled={disabled}
            placeholder="e.g. Wilhelminakade 902, Terminal Berth 4"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-xs placeholder:text-slate-400 focus:outline-none focus:border-[#0066FF]"
          />
        </div>
      )}
    </div>
  );
};

export interface LocationPairSelectorProps {
  origin: LocationData;
  destination: LocationData;
  onChangeOrigin: (origin: LocationData) => void;
  onChangeDestination: (dest: LocationData) => void;
  onSwap?: () => void;
  showCorridorPresets?: boolean;
  disabled?: boolean;
  className?: string;
}

const COMMON_CORRIDORS = [
  {
    name: 'Asia → Europe Core',
    origin: { city: 'Shanghai', country: 'China' },
    destination: { city: 'Rotterdam', country: 'Netherlands' },
  },
  {
    name: 'Transpacific Express',
    origin: { city: 'Shenzhen', country: 'China' },
    destination: { city: 'Los Angeles', country: 'United States' },
  },
  {
    name: 'Transatlantic Pharma',
    origin: { city: 'Frankfurt', country: 'Germany' },
    destination: { city: 'Chicago', country: 'United States' },
  },
  {
    name: 'Middle East Crossroads',
    origin: { city: 'Dubai', country: 'United Arab Emirates' },
    destination: { city: 'Singapore', country: 'Singapore' },
  },
  {
    name: 'Southern Europe Overland',
    origin: { city: 'Milan', country: 'Italy' },
    destination: { city: 'Rocca Imperiale (CS)', country: 'Italy' },
  },
];

export const LocationPairSelector: React.FC<LocationPairSelectorProps> = ({
  origin,
  destination,
  onChangeOrigin,
  onChangeDestination,
  onSwap,
  showCorridorPresets = true,
  disabled = false,
  className = '',
}) => {
  const handleSwap = () => {
    if (onSwap) {
      onSwap();
    } else {
      const temp = { ...origin };
      onChangeOrigin({ ...destination });
      onChangeDestination(temp);
    }
  };

  const handleApplyPreset = (preset: { origin: { city: string; country: string }; destination: { city: string; country: string } }) => {
    const origCoords = locationService.resolveCoordinates(preset.origin.city, preset.origin.country);
    const destCoords = locationService.resolveCoordinates(preset.destination.city, preset.destination.country);

    const origCountry = locationService.findCountry(preset.origin.country);
    const destCountry = locationService.findCountry(preset.destination.country);

    onChangeOrigin({
      city: preset.origin.city,
      country: origCountry?.name || preset.origin.country,
      countryCode: origCountry?.isoCode || '',
      lat: origCoords.lat,
      lng: origCoords.lng,
      code: origCoords.code,
    });

    onChangeDestination({
      city: preset.destination.city,
      country: destCountry?.name || preset.destination.country,
      countryCode: destCountry?.isoCode || '',
      lat: destCoords.lat,
      lng: destCoords.lng,
      code: destCoords.code,
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Corridor Presets Bar (if enabled) */}
      {showCorridorPresets && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <div className="flex items-center gap-1 text-[11px] font-mono-tech uppercase font-bold text-slate-500 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-[#0066FF]" />
            <span>Frequent Corridors:</span>
          </div>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {COMMON_CORRIDORS.map((corridor, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(corridor)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-[#0066FF]/15 hover:border-[#0066FF] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:text-[#0066FF] dark:hover:text-[#38bdf8] font-mono-tech text-[11px] whitespace-nowrap transition-colors cursor-pointer"
              >
                {corridor.origin.city} → {corridor.destination.city}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Selector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Origin Box */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 shadow-xs">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-white/5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
            <span className="font-heading font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Origin Location & Port
            </span>
          </div>

          <SingleLocationSelector
            country={origin.country}
            city={origin.city}
            address={origin.address}
            onChange={onChangeOrigin}
            countryLabel="Origin Country"
            cityLabel="Origin City / Hub"
            disabled={disabled}
            idPrefix="origin"
            required
          />
        </div>

        {/* Swap Button (Centrally positioned) */}
        <div className="lg:col-span-2 flex justify-center py-1 lg:py-0">
          <button
            type="button"
            onClick={handleSwap}
            disabled={disabled}
            className="flex items-center gap-2 px-4 py-2 lg:p-3 rounded-2xl bg-slate-100 hover:bg-[#0066FF] text-slate-700 hover:text-white dark:bg-white/5 dark:hover:bg-[#0066FF] dark:text-gray-300 border border-slate-200 dark:border-white/10 shadow-xs hover:shadow-md transition-all duration-200 group cursor-pointer text-xs font-mono-tech uppercase font-bold touch-manipulation"
            title="Swap Origin and Destination"
          >
            <ArrowRightLeft className="w-4 h-4 transition-transform group-hover:rotate-180 duration-300 shrink-0" />
            <span className="inline-block lg:hidden text-[11px]">Swap Route</span>
          </button>
        </div>

        {/* Destination Box */}
        <div className="lg:col-span-5 p-4 rounded-2xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 shadow-xs">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-white/5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-500/20" />
            <span className="font-heading font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white">
              Destination Location & Port
            </span>
          </div>

          <SingleLocationSelector
            country={destination.country}
            city={destination.city}
            address={destination.address}
            onChange={onChangeDestination}
            countryLabel="Destination Country"
            cityLabel="Destination City / Hub"
            disabled={disabled}
            idPrefix="dest"
            required
          />
        </div>
      </div>
    </div>
  );
};
