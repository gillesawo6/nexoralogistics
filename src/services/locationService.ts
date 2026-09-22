import { Country, City, ICountry, ICity } from 'country-state-city';
import { GLOBAL_HUBS } from '../data/hubPresets';

export interface StructuredCountry {
  isoCode: string;
  name: string;
  flag: string;
  phonecode: string;
  currency: string;
  latitude: number;
  longitude: number;
}

export interface StructuredCity {
  id: string;
  name: string;
  countryCode: string;
  countryName: string;
  stateCode?: string;
  latitude: number;
  longitude: number;
  isHub?: boolean;
  hubCode?: string;
  hubType?: string;
  facility?: string;
}

// Country aliases for flexible matching
const COUNTRY_ALIASES: Record<string, string> = {
  usa: 'US',
  'united states': 'US',
  'united states of america': 'US',
  us: 'US',
  uk: 'GB',
  'united kingdom': 'GB',
  'great britain': 'GB',
  england: 'GB',
  uae: 'AE',
  'united arab emirates': 'AE',
  china: 'CN',
  prc: 'CN',
  italy: 'IT',
  italia: 'IT',
  germany: 'DE',
  deutschland: 'DE',
  france: 'FR',
  spain: 'ES',
  españa: 'ES',
  netherlands: 'NL',
  holland: 'NL',
  belgium: 'BE',
  switzerland: 'CH',
  japan: 'JP',
  'south korea': 'KR',
  korea: 'KR',
  singapore: 'SG',
  'hong kong': 'HK',
  'hong kong sar': 'HK',
  taiwan: 'TW',
  australia: 'AU',
  canada: 'CA',
  brazil: 'BR',
  brasil: 'BR',
  india: 'IN',
  mexico: 'MX',
  turkey: 'TR',
  türkiye: 'TR',
  saudi: 'SA',
  'saudi arabia': 'SA',
  qatar: 'QA',
  egypt: 'EG',
  cameroon: 'CM',
  cameroun: 'CM',
  'republic of cameroon': 'CM',
  cm: 'CM',
  'south africa': 'ZA',
  nigeria: 'NG',
  kenya: 'KE',
  ghana: 'GH',
  morocco: 'MA',
  vietnam: 'VN',
  thailand: 'TH',
  malaysia: 'MY',
  indonesia: 'ID',
  philippines: 'PH',
};

// Common/Popular logistics countries to feature prominently
const TOP_LOGISTICS_COUNTRY_CODES = [
  'US', 'CN', 'DE', 'NL', 'GB', 'SG', 'AE', 'JP', 'IT', 'FR', 'BE', 'CH',
  'KR', 'HK', 'IN', 'AU', 'CA', 'BR', 'MX', 'ES', 'SA', 'QA', 'TR', 'ZA', 'NG', 'EG'
];

class LocationService {
  private allCountries: StructuredCountry[] = [];
  private countryByCodeMap: Map<string, StructuredCountry> = new Map();
  private countryByNameMap: Map<string, StructuredCountry> = new Map();
  private citiesByCountryCache: Map<string, StructuredCity[]> = new Map();

  constructor() {
    this.initializeCountries();
  }

  private initializeCountries() {
    const rawCountries = Country.getAllCountries();
    this.allCountries = rawCountries.map((c: ICountry) => {
      const countryObj: StructuredCountry = {
        isoCode: c.isoCode,
        name: c.name,
        flag: c.flag || this.getFlagEmoji(c.isoCode),
        phonecode: c.phonecode || '',
        currency: c.currency || 'USD',
        latitude: parseFloat(c.latitude || '0') || 0,
        longitude: parseFloat(c.longitude || '0') || 0,
      };
      return countryObj;
    });

    // Populate lookup maps
    this.allCountries.forEach((c) => {
      this.countryByCodeMap.set(c.isoCode.toUpperCase(), c);
      this.countryByNameMap.set(c.name.toLowerCase(), c);
    });
  }

  public getFlagEmoji(countryCode: string): string {
    if (!countryCode || countryCode.length !== 2) return '🌐';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }

  /**
   * Returns list of all countries sorted alphabetically.
   */
  public getAllCountries(): StructuredCountry[] {
    return this.allCountries;
  }

  /**
   * Returns top featured logistics countries.
   */
  public getPopularCountries(): StructuredCountry[] {
    return TOP_LOGISTICS_COUNTRY_CODES
      .map((code) => this.countryByCodeMap.get(code))
      .filter((c): c is StructuredCountry => Boolean(c));
  }

  /**
   * Finds a country by ISO-2 code or Name (with alias resolution)
   */
  public findCountry(query?: string | null): StructuredCountry | null {
    if (!query || typeof query !== 'string') return null;
    const clean = query.trim().toLowerCase();
    if (!clean) return null;

    // 1. Direct ISO match (2 letters)
    if (clean.length === 2) {
      const upper = clean.toUpperCase();
      if (this.countryByCodeMap.has(upper)) {
        return this.countryByCodeMap.get(upper)!;
      }
    }

    // 2. Direct name match
    if (this.countryByNameMap.has(clean)) {
      return this.countryByNameMap.get(clean)!;
    }

    // 3. Alias match
    if (COUNTRY_ALIASES[clean]) {
      const targetCode = COUNTRY_ALIASES[clean];
      if (this.countryByCodeMap.has(targetCode)) {
        return this.countryByCodeMap.get(targetCode)!;
      }
    }

    // 4. Substring / partial match
    for (const c of this.allCountries) {
      if (c.name.toLowerCase().includes(clean) || clean.includes(c.name.toLowerCase())) {
        return c;
      }
    }

    return null;
  }

  /**
   * Get all cities for a country, enriched with known global hubs and sorted.
   */
  public getCitiesByCountry(countryCodeOrName?: string | null): StructuredCity[] {
    if (!countryCodeOrName) return [];
    const country = this.findCountry(countryCodeOrName);
    if (!country) return [];

    const countryCode = country.isoCode.toUpperCase();
    if (this.citiesByCountryCache.has(countryCode)) {
      return this.citiesByCountryCache.get(countryCode)!;
    }

    // Fetch raw cities from country-state-city
    const rawCities: ICity[] = City.getCitiesOfCountry(countryCode) || [];

    // Find known global logistics hubs for this country
    const countryHubs = GLOBAL_HUBS.filter(
      (h) =>
        h.country.toLowerCase() === country.name.toLowerCase() ||
        h.country.toLowerCase().includes(country.name.toLowerCase()) ||
        country.name.toLowerCase().includes(h.country.toLowerCase())
    );

    const cityMap = new Map<string, StructuredCity>();

    // 1. First add known hubs with highest priority and high-precision coords
    countryHubs.forEach((hub) => {
      const key = hub.city.toLowerCase().trim();
      cityMap.set(key, {
        id: `${countryCode}-${hub.code || hub.city}`,
        name: hub.city,
        countryCode: countryCode,
        countryName: country.name,
        latitude: hub.lat,
        longitude: hub.lng,
        isHub: true,
        hubCode: hub.code,
        hubType: hub.type,
        facility: hub.facility,
      });
    });

    // Special additions for common logistics cities that might be named specifically
    if (countryCode === 'IT') {
      const roccaKey = 'rocca imperiale';
      if (!cityMap.has(roccaKey)) {
        cityMap.set(roccaKey, {
          id: 'IT-ROCCA',
          name: 'Rocca Imperiale (CS)',
          countryCode: 'IT',
          countryName: 'Italy',
          latitude: 40.1111,
          longitude: 16.5786,
          isHub: true,
          hubCode: 'CTA-REG',
          facility: 'Calabria Regional Distribution Hub',
        });
      }
    }

    // 2. Add remaining cities from dataset
    rawCities.forEach((c) => {
      const key = c.name.toLowerCase().trim();
      if (!cityMap.has(key)) {
        const lat = parseFloat(c.latitude || '0') || country.latitude || 0;
        const lng = parseFloat(c.longitude || '0') || country.longitude || 0;
        cityMap.set(key, {
          id: `${countryCode}-${c.stateCode || 'GEN'}-${c.name}`.replace(/\s+/g, '-'),
          name: c.name,
          countryCode: countryCode,
          countryName: country.name,
          stateCode: c.stateCode,
          latitude: lat,
          longitude: lng,
          isHub: false,
        });
      }
    });

    // Sort: Hubs first, then alphabetical by name
    const cityList = Array.from(cityMap.values()).sort((a, b) => {
      if (a.isHub && !b.isHub) return -1;
      if (!a.isHub && b.isHub) return 1;
      return a.name.localeCompare(b.name);
    });

    this.citiesByCountryCache.set(countryCode, cityList);
    return cityList;
  }

  /**
   * Search for cities across a country
   */
  public searchCities(countryCodeOrName: string, query: string, limit = 50): StructuredCity[] {
    const cities = this.getCitiesByCountry(countryCodeOrName);
    if (!query || !query.trim()) {
      return cities.slice(0, limit);
    }
    const cleanQuery = query.toLowerCase().trim();
    return cities
      .filter((c) => {
        return (
          c.name.toLowerCase().includes(cleanQuery) ||
          (c.hubCode && c.hubCode.toLowerCase().includes(cleanQuery)) ||
          (c.facility && c.facility.toLowerCase().includes(cleanQuery)) ||
          (c.stateCode && c.stateCode.toLowerCase().includes(cleanQuery))
        );
      })
      .slice(0, limit);
  }

  /**
   * Search for countries by name or code
   */
  public searchCountries(query: string, limit = 40): StructuredCountry[] {
    if (!query || !query.trim()) {
      return this.allCountries.slice(0, limit);
    }
    const clean = query.toLowerCase().trim();
    return this.allCountries
      .filter((c) => c.name.toLowerCase().includes(clean) || c.isoCode.toLowerCase().includes(clean))
      .slice(0, limit);
  }

  /**
   * Resolves coordinates for a Country + City pair
   */
  public resolveCoordinates(
    cityName: string,
    countryNameOrCode: string
  ): { lat: number; lng: number; country: string; city: string; code?: string } {
    const country = this.findCountry(countryNameOrCode);
    const countryName = country?.name || countryNameOrCode || 'Global';
    const countryCode = country?.isoCode || 'GL';

    if (!cityName) {
      return {
        lat: country?.latitude || 0,
        lng: country?.longitude || 0,
        country: countryName,
        city: '',
      };
    }

    const cities = this.getCitiesByCountry(countryCode);
    const cleanCity = cityName.toLowerCase().trim();
    
    // 1. Exact match
    const exact = cities.find((c) => c.name.toLowerCase() === cleanCity);
    if (exact && exact.latitude && exact.longitude) {
      return {
        lat: exact.latitude,
        lng: exact.longitude,
        country: countryName,
        city: exact.name,
        code: exact.hubCode || exact.name.substring(0, 3).toUpperCase(),
      };
    }

    // 2. Substring match
    const partial = cities.find((c) => c.name.toLowerCase().includes(cleanCity) || cleanCity.includes(c.name.toLowerCase()));
    if (partial && partial.latitude && partial.longitude) {
      return {
        lat: partial.latitude,
        lng: partial.longitude,
        country: countryName,
        city: partial.name,
        code: partial.hubCode || partial.name.substring(0, 3).toUpperCase(),
      };
    }

    // 3. Fallback to Country centroid or pseudo-deterministic
    let hash = 0;
    const combined = `${cityName} ${countryName}`;
    for (let i = 0; i < combined.length; i++) {
      hash = (hash << 5) - hash + combined.charCodeAt(i);
      hash |= 0;
    }
    const pseudoLat = (country?.latitude || 20) + ((Math.abs(hash) % 100) - 50) / 50;
    const pseudoLng = (country?.longitude || 0) + ((Math.abs(hash >> 2) % 100) - 50) / 50;

    return {
      lat: country?.latitude || pseudoLat,
      lng: country?.longitude || pseudoLng,
      country: countryName,
      city: cityName,
      code: cityName.substring(0, 3).toUpperCase(),
    };
  }

  /**
   * Finds a known hub preset by city and optional country name
   */
  public findHubByCityAndCountry(cityName: string, countryName?: string) {
    if (!cityName) return null;
    const cleanCity = cityName.toLowerCase().trim();
    const cleanCountry = countryName?.toLowerCase().trim();

    return GLOBAL_HUBS.find((h) => {
      const cityMatches = h.city.toLowerCase() === cleanCity || 
                          h.city.toLowerCase().includes(cleanCity) || 
                          cleanCity.includes(h.city.toLowerCase());
      if (!cityMatches) return false;
      if (cleanCountry) {
        return h.country.toLowerCase() === cleanCountry ||
               h.country.toLowerCase().includes(cleanCountry) ||
               cleanCountry.includes(h.country.toLowerCase());
      }
      return true;
    }) || null;
  }

  /**
   * Standardizes a location string (e.g. "Shanghai, China" or "Rotterdam")
   * into structured Country and City.
   */
  public parseLocationString(locationStr: string): { country: string; city: string; countryCode: string } {
    if (!locationStr) return { country: '', city: '', countryCode: '' };

    const parts = locationStr.split(',').map((p) => p.trim());
    if (parts.length >= 2) {
      const lastPart = parts[parts.length - 1];
      const foundCountry = this.findCountry(lastPart);
      if (foundCountry) {
        const cityPart = parts.slice(0, parts.length - 1).join(', ');
        return {
          country: foundCountry.name,
          city: cityPart,
          countryCode: foundCountry.isoCode,
        };
      }
    }

    // Try single query against country dictionary
    const singleCountry = this.findCountry(locationStr);
    if (singleCountry) {
      return {
        country: singleCountry.name,
        city: singleCountry.name,
        countryCode: singleCountry.isoCode,
      };
    }

    return {
      country: '',
      city: locationStr,
      countryCode: '',
    };
  }
}

export const locationService = new LocationService();
