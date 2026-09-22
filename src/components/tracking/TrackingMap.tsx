import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Shipment } from '../../types';
import { Ship, Plane, Truck, Navigation2, Maximize2, Compass, Radio } from 'lucide-react';
import { resolveLocationSync, parseCoordinates, resolveShipmentTelemetryLocation } from '../../utils/geoUtils';

interface TrackingMapProps {
  shipment: Shipment;
  height?: string;
}

export const TrackingMap: React.FC<TrackingMapProps> = ({ shipment, height = '480px' }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [activeCoords, setActiveCoords] = useState<{ lat: number; lng: number; locationName: string }>(() => {
    const init = resolveShipmentTelemetryLocation(shipment);
    return {
      lat: init.current.lat,
      lng: init.current.lng,
      locationName: init.current.locationName,
    };
  });

  useEffect(() => {
    let isMounted = true;
    const container = mapContainerRef.current;
    if (!container) return;

    // Safely remove any previous map instance on this container
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.stop();
        mapInstanceRef.current.off();
        mapInstanceRef.current.remove();
      } catch (err) {
        console.warn('Leaflet cleanup error:', err);
      }
      mapInstanceRef.current = null;
    }

    // Clean up container's leftover _leaflet_id if present
    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }

    const { status, origin, destination, shipper, receiver, currentLocation } = shipment;

    const isValidCoord = (lat: any, lng: any) =>
      typeof lat === 'number' && !isNaN(lat) && typeof lng === 'number' && !isNaN(lng) && !(lat === 0 && lng === 0);

    // Resolve exact physical locations specified on shipment record
    const resolved = resolveShipmentTelemetryLocation(shipment);
    const originLat = resolved.origin.lat;
    const originLng = resolved.origin.lng;
    const originLabel = resolved.origin.label;

    const destLat = resolved.destination.lat;
    const destLng = resolved.destination.lng;
    const destLabel = resolved.destination.label;

    const liveLat = resolved.current.lat;
    const liveLng = resolved.current.lng;
    const liveLocationName = resolved.current.locationName;
    const resolvedWaypoints = resolved.waypoints;

    if (isMounted) {
      setActiveCoords({
        lat: liveLat,
        lng: liveLng,
        locationName: liveLocationName,
      });
    }

    // Initialize Map with Center
    const centerLat = isValidCoord(liveLat, liveLng) ? liveLat : (originLat + destLat) / 2 || 45.4642;
    const centerLng = isValidCoord(liveLat, liveLng) ? liveLng : (originLng + destLng) / 2 || 9.1900;

    let map: L.Map;
    try {
      map = L.map(container, {
        center: [centerLat, centerLng],
        zoom: 5,
        zoomControl: false,
        attributionControl: false,
        fadeAnimation: false,
      });
    } catch (err) {
      console.warn('Error creating Leaflet map:', err);
      return;
    }

    if (!isMounted) {
      try {
        map.remove();
      } catch {}
      return;
    }

    mapInstanceRef.current = map;

    // User-provided CARTO API access token with environment variable override
    const CARTO_API_KEY =
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CARTO_API_KEY) ||
      'cb1_2pdp_1_d42bfbeae3f2fcc35b940957';

    // Seamless, high-performance Dark CARTO basemap raster tile layer
    const cartoUrl = CARTO_API_KEY
      ? `https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${encodeURIComponent(CARTO_API_KEY)}`
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png';

    const tileLayer = L.tileLayer(cartoUrl, {
      maxZoom: 20,
      subdomains: 'abcd',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>',
    });

    tileLayer.on('tileerror', () => {
      // Graceful fallback to Carto raster tiles
      tileLayer.setUrl('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png');
    });

    tileLayer.addTo(map);

    // Zoom control in top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Helper: Clean, executive badge label formatter to prevent oversized banners on the map
    const formatMarkerBadgeLabel = (text: string): string => {
      if (!text) return '';
      const parts = text.split(',').map((p) => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const candidate = `${parts[0]}, ${parts[1].replace(/\d+/g, '').trim()}`.trim();
        if (candidate.length <= 26) return candidate;
      }
      if (text.length > 24) {
        return text.substring(0, 22) + '…';
      }
      return text;
    };

    // Helper: Marker Icon Creator
    const createCustomIcon = (color: string, label: string, isPulse: boolean = false) => {
      const displayBadge = formatMarkerBadgeLabel(label);
      return L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; cursor: pointer;">
            ${isPulse ? `<div style="position: absolute; width: 36px; height: 36px; border-radius: 9999px; background-color: ${color}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
            <div style="position: relative; width: 18px; height: 18px; border-radius: 9999px; border: 2px solid white; display: flex; align-items: center; justify-content: center; background-color: ${color}; box-shadow: 0 4px 10px rgba(0,0,0,0.6);">
              <div style="width: 6px; height: 6px; border-radius: 9999px; background-color: white;"></div>
            </div>
            <div style="position: absolute; top: 24px; left: 50%; transform: translateX(-50%); white-space: nowrap; background-color: rgba(13,21,39,0.96); font-size: 10px; font-family: monospace; font-weight: bold; border: 1px solid rgba(255,255,255,0.3); color: white; padding: 2px 8px; border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.6); pointer-events: none; z-index: 500;">
              ${displayBadge}
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
    };

    // Live Cargo Marker Icon with dynamic pulse and vehicle silhouette
    const cargoModeIcon = L.divIcon({
      className: 'custom-cargo-marker',
      html: `
        <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; cursor: pointer;">
          <div style="position: absolute; width: 54px; height: 54px; border-radius: 9999px; background-color: #0066FF; opacity: 0.35; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: absolute; width: 42px; height: 42px; border-radius: 9999px; border: 2px solid #38bdf8; background-color: rgba(0,102,255,0.3); box-shadow: 0 0 20px rgba(56,189,248,0.5);"></div>
          <div style="position: relative; width: 32px; height: 32px; border-radius: 9999px; background: linear-gradient(135deg, #0066FF 0%, #0044bb 100%); border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 25px rgba(0,102,255,0.7); color: white;">
            <svg style="width: 17px; height: 17px; fill: currentColor;" viewBox="0 0 24 24">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
            </svg>
          </div>
          <div style="position: absolute; top: -28px; left: 50%; transform: translateX(-50%); white-space: nowrap; background: #0066FF; font-size: 10px; font-weight: bold; color: white; padding: 2px 8px; border-radius: 9999px; box-shadow: 0 4px 10px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.4); pointer-events: none;">
            ● CURRENT LOCATION
          </div>
        </div>
      `,
      iconSize: [42, 42],
      iconAnchor: [21, 21],
    });

    const polylineCoords: [number, number][] = [];
    const allBoundsCoords: [number, number][] = [];

    // 1. Plot Origin Node
    if (isValidCoord(originLat, originLng)) {
      polylineCoords.push([originLat, originLng]);
      allBoundsCoords.push([originLat, originLng]);
      const originMarker = L.marker([originLat, originLng], {
        icon: createCustomIcon('#10b981', `ORIGIN: ${origin?.city || 'Origin'}`),
      }).addTo(map);

      originMarker.bindTooltip(
        `<div style="font-family: inherit; font-size: 11px;"><strong>ORIGIN DISPATCH:</strong><br/>${originLabel}<br/><span style="color:#10b981;">● Departed Origin Hub</span></div>`,
        { direction: 'top', offset: [0, -14] }
      );

      originMarker.bindPopup(`
        <div style="font-family: inherit; padding: 4px; min-width: 180px;">
          <div style="font-weight: 800; font-size: 13px; color: #10b981; margin-bottom: 4px;">ORIGIN GATEWAY</div>
          <div style="font-size: 12px; font-weight: 700;">${originLabel}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
            Shipper: ${shipper?.name || 'Authorized Shipper'}
          </div>
        </div>
      `);
    }

    // 2. Plot Waypoints & Milestones
    if (resolvedWaypoints && Array.isArray(resolvedWaypoints)) {
      resolvedWaypoints.forEach((wp) => {
        const wpLat = wp.lat;
        const wpLng = wp.lng;
        if (isValidCoord(wpLat, wpLng) && wp.type === 'transit') {
          polylineCoords.push([wpLat, wpLng]);
          allBoundsCoords.push([wpLat, wpLng]);

          // Check if this waypoint is currently where the live telemetry beacon sits
          const isAtLiveBeacon =
            isValidCoord(liveLat, liveLng) &&
            Math.hypot(wpLat - liveLat, wpLng - liveLng) < 0.08;

          // Only render a separate waypoint marker if the live beacon is not already sitting right here
          if (!isAtLiveBeacon) {
            const wpMarker = L.marker([wpLat, wpLng], {
              icon: createCustomIcon(wp.passed ? '#38bdf8' : '#64748b', wp.name),
            }).addTo(map);

            wpMarker.bindTooltip(
              `<div style="font-family: inherit; font-size: 11px;"><strong>CHECKPOINT:</strong><br/>${wp.name}<br/><span style="color: ${wp.passed ? '#38bdf8' : '#94a3b8'}; font-weight: 600;">${wp.passed ? '✓ Cleared Waypoint' : '⏳ In Transit Schedule'}</span></div>`,
              { direction: 'top', offset: [0, -14] }
            );

            wpMarker.bindPopup(`
              <div style="font-family: inherit; padding: 4px; min-width: 180px;">
                <div style="font-weight: 800; font-size: 12px; color: #38bdf8; margin-bottom: 4px;">TRANSIT CHECKPOINT</div>
                <div style="font-size: 12px; font-weight: 700;">${wp.name}</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
                  Status: ${wp.passed ? 'Cleared Milestone' : 'Scheduled Stop'}
                </div>
              </div>
            `);
          }
        }
      });
    }

    // 3. Plot Destination Node
    if (isValidCoord(destLat, destLng)) {
      polylineCoords.push([destLat, destLng]);
      allBoundsCoords.push([destLat, destLng]);
      const destMarker = L.marker([destLat, destLng], {
        icon: createCustomIcon('#f97316', `DEST: ${destination?.city || 'Destination'}`),
      }).addTo(map);

      destMarker.bindTooltip(
        `<div style="font-family: inherit; font-size: 11px;"><strong>DESTINATION HUB:</strong><br/>${destLabel}<br/><span style="color:#f97316;">● Target Reception Hub</span></div>`,
        { direction: 'top', offset: [0, -14] }
      );

      destMarker.bindPopup(`
        <div style="font-family: inherit; padding: 4px; min-width: 180px;">
          <div style="font-weight: 800; font-size: 13px; color: #f97316; margin-bottom: 4px;">DESTINATION TERMINAL</div>
          <div style="font-size: 12px; font-weight: 700;">${destLabel}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
            Consignee: ${receiver?.name || 'Authorized Consignee'}
          </div>
        </div>
      `);
    }

    // 4. Draw Route Polyline with Dual Glow & Dash Layers
    if (polylineCoords.length >= 2) {
      // Atmospheric Glow underlay
      L.polyline(polylineCoords, {
        color: '#0066FF',
        weight: 6,
        opacity: 0.35,
        smoothFactor: 1,
      }).addTo(map);

      // High-visibility dash line
      L.polyline(polylineCoords, {
        color: '#38bdf8',
        weight: 2.5,
        opacity: 0.9,
        dashArray: shipment.status === 'Delivered' ? undefined : '6, 8',
        smoothFactor: 1,
      }).addTo(map);
    }

    // 5. Plot Live Telemetry Cargo Beacon at Actual Specified Location
    if (isValidCoord(liveLat, liveLng)) {
      allBoundsCoords.push([liveLat, liveLng]);
      const liveMarker = L.marker([liveLat, liveLng], {
        icon: cargoModeIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      liveMarker.bindTooltip(
        `<div style="font-family: inherit; font-size: 11px;"><strong>CURRENT LOCATION:</strong><br/>${liveLocationName}<br/><span style="color:#38bdf8;">Status: ${status}</span></div>`,
        { direction: 'top', offset: [0, -22] }
      );

      liveMarker.bindPopup(`
        <div style="font-family: inherit; padding: 6px; min-width: 220px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-weight: 800; font-size: 11px; color: #0066FF; text-transform: uppercase;">● CURRENT LOCATION</span>
            <span style="font-size: 10px; background: rgba(0,102,255,0.1); color: #0066FF; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${status}</span>
          </div>
          <div style="font-size: 13px; font-weight: 800; color: #0f172a; dark:color: #fff;">${liveLocationName}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">
            Carrier: <strong>${shipment.carrier}</strong> (${shipment.transportMode})
          </div>
          <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
            Progress: <strong>${shipment.progressPercent}%</strong> | Ref: <strong>${shipment.vesselOrFlightNumber || shipment.trackingNumber}</strong>
          </div>
        </div>
      `);
    }

    // Fit bounds smoothly
    if (allBoundsCoords.length > 0) {
      try {
        const bounds = L.latLngBounds(allBoundsCoords);
        map.fitBounds(bounds, { padding: [50, 50], animate: false });
      } catch (err) {
        console.warn('fitBounds error:', err);
      }
    }

    const timer = setTimeout(() => {
      if (isMounted && mapInstanceRef.current) {
        try {
          mapInstanceRef.current.invalidateSize({ animate: false });
        } catch {}
      }
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.stop();
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch (err) {
          console.warn('Leaflet unmount error:', err);
        }
        mapInstanceRef.current = null;
      }
      if (container && (container as any)._leaflet_id) {
        delete (container as any)._leaflet_id;
      }
    };
  }, [shipment]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    try {
      mapInstanceRef.current.setView([activeCoords.lat, activeCoords.lng], 6, { animate: true });
    } catch {}
  };

  const handleFitAll = () => {
    if (!mapInstanceRef.current) return;
    const { origin, destination, waypoints } = shipment;
    const points: [number, number][] = [];
    if (origin && typeof origin.lat === 'number') points.push([origin.lat, origin.lng]);
    if (waypoints && Array.isArray(waypoints)) {
      waypoints.forEach((w) => {
        if (typeof w.lat === 'number') points.push([w.lat, w.lng]);
      });
    }
    if (destination && typeof destination.lat === 'number') points.push([destination.lat, destination.lng]);

    if (points.length > 0) {
      try {
        mapInstanceRef.current.fitBounds(L.latLngBounds(points), { padding: [50, 50], animate: true });
      } catch {}
    }
  };

  const getModeIcon = () => {
    switch (shipment.transportMode) {
      case 'Air Freight': return <Plane className="w-4 h-4 text-[#0066FF]" />;
      case 'Ocean Freight': return <Ship className="w-4 h-4 text-[#0066FF]" />;
      case 'Road Transport':
      case 'Land Transport': return <Truck className="w-4 h-4 text-[#0066FF]" />;
      default: return <Navigation2 className="w-4 h-4 text-[#0066FF]" />;
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-950 dark:bg-[#070D1D] shadow-2xl transition-colors">
      {/* Top Left HUD: Carrier, Mode & Flight/Vessel */}
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-2 bg-slate-900/90 dark:bg-[#0D1527]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15 text-xs text-white shadow-xl">
        <span className="flex items-center gap-1.5 font-bold tracking-wider uppercase font-mono-tech text-[#38bdf8]">
          {getModeIcon()}
          {shipment.carrier}
        </span>
        <span className="text-gray-500">•</span>
        <span className="font-mono-tech text-gray-300">{shipment.vesselOrFlightNumber || shipment.trackingNumber}</span>
      </div>

      {/* Top Right Action Controls */}
      <div className="absolute top-3 right-3 z-[400] flex items-center gap-1.5">
        <button
          onClick={handleRecenter}
          className="p-2 rounded-xl bg-slate-900/90 dark:bg-[#0D1527]/90 hover:bg-[#0066FF] text-gray-300 hover:text-white border border-white/15 transition-all shadow-xl backdrop-blur-sm cursor-pointer"
          title="Center on Live Position"
          data-cursor="TARGET"
        >
          <Compass className="w-4 h-4" />
        </button>
        <button
          onClick={handleFitAll}
          className="p-2 rounded-xl bg-slate-900/90 dark:bg-[#0D1527]/90 hover:bg-[#0066FF] text-gray-300 hover:text-white border border-white/15 transition-all shadow-xl backdrop-blur-sm cursor-pointer"
          title="Fit Whole Route Corridor"
          data-cursor="ROUTE"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Live Telemetry Coordinates Banner */}
      <div className="absolute bottom-3 left-3 z-[400] bg-slate-950/90 dark:bg-[#070D1D]/90 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl text-[11px] font-mono-tech text-gray-300 shadow-xl flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold uppercase tracking-wider text-[10px]">CURRENT POSITION</span>
        </div>
        <span className="text-white font-bold truncate max-w-[200px] sm:max-w-xs">{activeCoords.locationName}</span>
        <span className="text-gray-500 hidden sm:inline">|</span>
        <span className="text-gray-400 hidden sm:inline">
          {activeCoords.lat.toFixed(4)}° N, {activeCoords.lng.toFixed(4)}° E
        </span>
      </div>

      {/* Bottom Right Live Telemetry Altitude/Speed */}
      <div className="absolute bottom-3 right-3 z-[400] hidden sm:flex items-center gap-2 bg-slate-950/90 dark:bg-[#070D1D]/90 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl text-[11px] font-mono-tech text-gray-300 shadow-xl">
        <Radio className="w-3.5 h-3.5 text-[#38bdf8] animate-pulse" />
        <span className="text-gray-400">ALT:</span>
        <span className="text-white font-bold">{shipment.currentLocation?.altitudeMeters || '10,600'}m</span>
        <span className="text-gray-500">•</span>
        <span className="text-gray-400">SPD:</span>
        <span className="text-white font-bold">{shipment.currentLocation?.speedKnots || '460'} kn</span>
      </div>

      {/* Leaflet DOM container */}
      <div
        ref={mapContainerRef}
        style={{ height, width: '100%' }}
        className="z-0 bg-[#090e1a]"
      />
    </div>
  );
};

export default TrackingMap;
