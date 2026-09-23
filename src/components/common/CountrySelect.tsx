import React, { useState, useEffect, useRef } from 'react';
import { Globe2, Search, Check, ChevronDown, X, Sparkles } from 'lucide-react';
import { locationService, StructuredCountry } from '../../services/locationService';

export interface CountrySelectProps {
  value: string; // country name or ISO code
  onChange: (country: StructuredCountry) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showPopularShortcuts?: boolean;
  id?: string;
  error?: string;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onChange,
  label = 'Country',
  placeholder = 'Select Country...',
  required = false,
  disabled = false,
  className = '',
  showPopularShortcuts = false,
  id,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCountry = locationService.findCountry(value);
  const countries = locationService.searchCountries(searchQuery);
  const popularCountries = locationService.getPopularCountries();

  // Close dropdown on outside click
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

  const handleSelect = (country: StructuredCountry) => {
    onChange(country);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({
      isoCode: '',
      name: '',
      flag: '🌐',
      phonecode: '',
      currency: 'USD',
      latitude: 0,
      longitude: 0,
    });
  };

  const cleanDisplayName = selectedCountry
    ? selectedCountry.name
    : value
    ? value.replace(/^[A-Z]{2}\s*[-–:]*\s*/i, '').trim()
    : placeholder;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label
          htmlFor={id}
          className="block text-[11px] font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5 flex items-center justify-between"
        >
          <span className="truncate">
            {label} {required && <span className="text-rose-500">*</span>}
          </span>
          {selectedCountry && (
            <span className="text-[10px] text-[#0066FF] dark:text-[#38bdf8] font-bold font-mono-tech shrink-0 ml-1">
              ISO: {selectedCountry.isoCode}
            </span>
          )}
        </label>
      )}

      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        title={cleanDisplayName}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-left font-mono-tech text-xs transition-all flex items-center justify-between gap-2 border touch-manipulation cursor-pointer ${
          disabled
            ? 'bg-slate-100 dark:bg-slate-900/80 border-slate-200 dark:border-white/5 opacity-60 cursor-not-allowed text-slate-400 select-none'
            : isOpen
            ? 'bg-white dark:bg-[#070D1D] border-[#0066FF] ring-2 ring-[#0066FF]/20 shadow-md'
            : error
            ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-400 text-slate-900 dark:text-white'
            : 'bg-slate-50 dark:bg-[#0D1527] hover:bg-white dark:hover:bg-[#0a1224] border-slate-300 dark:border-white/15 text-slate-900 dark:text-white'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="text-lg leading-none shrink-0 select-none">
            {selectedCountry ? selectedCountry.flag : '🌐'}
          </span>
          <span className={`truncate font-medium ${!selectedCountry && !value ? 'text-slate-400' : 'text-slate-950 dark:text-white font-bold'}`}>
            {cleanDisplayName}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {(selectedCountry || value) && !disabled && (
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
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 min-w-[280px] sm:min-w-[320px] max-w-full rounded-2xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/15 shadow-2xl overflow-hidden font-mono-tech text-xs backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
          {/* Search Input Box */}
          <div className="p-2.5 border-b border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-[#0B1528]/80">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by country or code (e.g. US, Germany, CN)..."
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

          {/* Quick Popular Country Pills (if enabled) */}
          {showPopularShortcuts && !searchQuery && (
            <div className="px-3 pt-2.5 pb-2 border-b border-slate-100 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.02]">
              <div className="text-[10px] text-slate-400 uppercase font-bold mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#0066FF]" />
                <span>Top Freight Corridors</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                {popularCountries.slice(0, 10).map((pc) => (
                  <button
                    key={pc.isoCode}
                    type="button"
                    onClick={() => handleSelect(pc)}
                    className={`px-2 py-1 rounded-lg text-[11px] flex items-center gap-1 border transition-colors cursor-pointer ${
                      selectedCountry?.isoCode === pc.isoCode
                        ? 'bg-[#0066FF]/15 border-[#0066FF] text-[#0066FF] dark:text-[#38bdf8] font-bold'
                        : 'bg-white dark:bg-[#0D1527] border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:border-[#0066FF]'
                    }`}
                  >
                    <span>{pc.flag}</span>
                    <span>{pc.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Country Options List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
            {countries.length > 0 ? (
              countries.map((c) => {
                const isSelected = selectedCountry?.isoCode === c.isoCode;
                return (
                  <button
                    key={c.isoCode}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-[#0066FF]/15 text-[#0066FF] dark:text-[#38bdf8] font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-800 dark:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base select-none">{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-[10px] font-mono text-slate-500 dark:text-gray-400">
                        {c.isoCode}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-[#0066FF] dark:text-[#38bdf8]" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-slate-400 text-xs">
                No matching countries found for "{searchQuery}".
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
