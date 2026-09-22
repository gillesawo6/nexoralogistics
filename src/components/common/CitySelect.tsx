import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Check, ChevronDown, X, Building2, Anchor, Plane, Train, Plus } from 'lucide-react';
import { locationService, StructuredCity } from '../../services/locationService';

export interface CitySelectProps {
  countryValue: string; // country name or ISO code
  value: string; // city name
  onChange: (city: StructuredCity | { name: string; latitude: number; longitude: number; isHub?: boolean }) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  error?: string;
  allowCustom?: boolean;
}

export const CitySelect: React.FC<CitySelectProps> = ({
  countryValue,
  value,
  onChange,
  label = 'City / Port Hub',
  placeholder = 'Select City or Terminal...',
  required = false,
  disabled = false,
  className = '',
  id,
  error,
  allowCustom = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const country = locationService.findCountry(countryValue);
  const hasCountry = Boolean(country);
  const cities = hasCountry ? locationService.searchCities(country!.isoCode, searchQuery, 80) : [];

  // Find currently selected city object if present
  const selectedCity = hasCountry
    ? cities.find((c) => c.name.toLowerCase() === value.toLowerCase().trim())
    : null;

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleSelect = (city: StructuredCity) => {
    onChange(city);
    setIsOpen(false);
  };

  const handleSelectCustom = (cityName: string) => {
    if (!cityName.trim()) return;
    const resolved = locationService.resolveCoordinates(cityName.trim(), countryValue);
    onChange({
      name: cityName.trim(),
      latitude: resolved.lat,
      longitude: resolved.lng,
      isHub: false,
    });
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({
      name: '',
      latitude: country?.latitude || 0,
      longitude: country?.longitude || 0,
    });
  };

  const isCustomCandidate =
    allowCustom &&
    searchQuery.trim().length > 1 &&
    !cities.some((c) => c.name.toLowerCase() === searchQuery.toLowerCase().trim());

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative ${className}`}
      ref={dropdownRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {label && (
        <label
          htmlFor={id}
          className="block text-[11px] font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5 flex items-center justify-between"
        >
          <span className="truncate">
            {label} {required && <span className="text-rose-500">*</span>}
          </span>
        </label>
      )}

      {/* Hover Tooltip when Country is not yet selected */}
      {!hasCountry && isHovered && (
        <div
          role="tooltip"
          className="absolute z-40 -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-slate-900/95 dark:bg-slate-800/95 text-amber-400 text-[10px] font-mono-tech font-bold shadow-xl border border-amber-500/30 whitespace-nowrap flex items-center gap-1.5 pointer-events-none animate-in fade-in zoom-in-95 duration-150 backdrop-blur-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          <span>Requires Country first</span>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-900/95 dark:border-t-slate-800/95" />
        </div>
      )}

      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled || !hasCountry}
        title={!hasCountry ? 'Requires Country first' : undefined}
        onClick={() => hasCountry && setIsOpen(!isOpen)}
        className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-left font-mono-tech text-xs transition-all flex items-center justify-between gap-2 border touch-manipulation ${
          disabled || !hasCountry
            ? 'bg-slate-100 dark:bg-slate-900/80 border-slate-200 dark:border-white/5 opacity-60 cursor-not-allowed text-slate-400 select-none'
            : isOpen
            ? 'bg-white dark:bg-[#070D1D] border-[#0066FF] ring-2 ring-[#0066FF]/20 shadow-md cursor-pointer'
            : error
            ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-400 text-slate-900 dark:text-white cursor-pointer'
            : 'bg-slate-50 dark:bg-[#0D1527] hover:bg-white dark:hover:bg-[#0a1224] border-slate-300 dark:border-white/15 text-slate-900 dark:text-white cursor-pointer'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <MapPin className={`w-4 h-4 shrink-0 ${value ? 'text-[#0066FF] dark:text-[#38bdf8]' : 'text-slate-400'}`} />
          <div className="flex items-center gap-2 min-w-0 truncate">
            <span className={`truncate font-medium ${!value ? 'text-slate-400' : 'text-slate-950 dark:text-white font-bold'}`}>
              {value || (hasCountry ? placeholder : 'Select City...')}
            </span>
            {selectedCity?.hubCode && (
              <span className="px-1.5 py-0.5 rounded bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] text-[9px] font-bold shrink-0">
                {selectedCity.hubCode}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {value && !disabled && hasCountry && (
            <span
              onClick={handleClear}
              className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#0066FF]' : ''}`} />
        </div>
      </button>

      {error && <p className="text-[10px] text-rose-500 font-mono-tech mt-1">{error}</p>}

      {/* Popover Dropdown */}
      {isOpen && hasCountry && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 rounded-2xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/15 shadow-2xl overflow-hidden font-mono-tech text-xs backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
          {/* Search Input */}
          <div className="p-2.5 border-b border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-[#0B1528]/80">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search cities in ${country.name}...`}
                className="w-full pl-8 pr-7 py-2 rounded-lg bg-white dark:bg-[#050914] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#0066FF] placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Cities List */}
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
            {/* Custom entry candidate */}
            {isCustomCandidate && (
              <button
                type="button"
                onClick={() => handleSelectCustom(searchQuery)}
                className="w-full px-3.5 py-2.5 text-left bg-blue-50/80 dark:bg-[#0066FF]/10 hover:bg-blue-100 dark:hover:bg-[#0066FF]/20 text-[#0066FF] dark:text-[#38bdf8] flex items-center justify-between gap-2 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span>
                    Use custom city: <strong className="font-bold">"{searchQuery.trim()}"</strong>
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#0066FF]/20">
                  Custom
                </span>
              </button>
            )}

            {cities.length > 0 ? (
              cities.map((c) => {
                const isSelected = value.toLowerCase().trim() === c.name.toLowerCase().trim();
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-[#0066FF]/15 text-[#0066FF] dark:text-[#38bdf8] font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-800 dark:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {c.isHub ? (
                        c.hubType?.includes('Air') ? (
                          <Plane className="w-3.5 h-3.5 text-[#0066FF] dark:text-[#38bdf8] shrink-0" />
                        ) : c.hubType?.includes('Maritime') || c.hubType?.includes('Ocean') ? (
                          <Anchor className="w-3.5 h-3.5 text-[#0066FF] dark:text-[#38bdf8] shrink-0" />
                        ) : (
                          <Building2 className="w-3.5 h-3.5 text-[#0066FF] dark:text-[#38bdf8] shrink-0" />
                        )
                      ) : (
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <div className="truncate">
                        <span className="truncate">{c.name}</span>
                        {c.facility && (
                          <span className="block text-[10px] text-slate-400 truncate font-normal">
                            {c.facility}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {c.hubCode && (
                        <span className="px-1.5 py-0.5 rounded bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] text-[9px] font-bold">
                          {c.hubCode}
                        </span>
                      )}
                      {c.stateCode && !c.hubCode && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-[9px] text-slate-500 dark:text-gray-400 font-mono">
                          {c.stateCode}
                        </span>
                      )}
                      {isSelected && <Check className="w-4 h-4 text-[#0066FF] dark:text-[#38bdf8]" />}
                    </div>
                  </button>
                );
              })
            ) : !isCustomCandidate ? (
              <div className="p-4 text-center text-slate-400 text-xs">
                No cities found for "{searchQuery}".
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
