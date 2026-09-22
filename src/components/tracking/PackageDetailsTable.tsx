import React from 'react';
import { PackageItem, ShipmentTotals } from '../../types';
import { Box, Layers, Scale, Maximize2, Calculator, CheckCircle2 } from 'lucide-react';

interface PackageDetailsTableProps {
  packages?: PackageItem[];
  totals?: ShipmentTotals;
  defaultWeightKg?: number;
  defaultVolumeCbm?: number;
  defaultCargoDesc?: string;
  defaultPieces?: number;
  defaultPackageType?: string;
}

export const PackageDetailsTable: React.FC<PackageDetailsTableProps> = ({
  packages,
  totals,
  defaultWeightKg = 1000,
  defaultVolumeCbm = 4.0,
  defaultCargoDesc = 'Standard Packaged Consignment',
  defaultPieces = 1,
  defaultPackageType = 'Carton',
}) => {
  // If packages array is empty, construct a fallback single package item
  const packageList: PackageItem[] = (packages && packages.length > 0)
    ? packages
    : [
        {
          packageNumber: 1,
          type: defaultPackageType || 'Carton',
          description: defaultCargoDesc,
          length: Math.round(Math.cbrt(defaultVolumeCbm * 1000000) / 10) * 10 || 70,
          width: Math.round(Math.cbrt(defaultVolumeCbm * 1000000) / 10) * 10 || 40,
          height: Math.round(Math.cbrt(defaultVolumeCbm * 1000000) / 10) * 10 || 25,
          weight: defaultWeightKg || 3,
        },
      ];

  // Calculate totals dynamically if not passed
  const calculatedActualWeight = totals?.actualWeight !== undefined
    ? totals.actualWeight
    : packageList.reduce((acc, p) => acc + (p.weight || 0), 0) || defaultWeightKg;

  const calculatedVolume = totals?.volume !== undefined
    ? totals.volume
    : packageList.reduce((acc, p) => acc + ((p.length * p.width * p.height) / 1000000), 0) || defaultVolumeCbm;

  const calculatedVolumetricWeight = totals?.volumetricWeight !== undefined
    ? totals.volumetricWeight
    : packageList.reduce((acc, p) => acc + ((p.length * p.width * p.height) / 5000), 0);

  return (
    <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 transition-colors">
      {/* Table Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <Box className="w-5 h-5 text-[#0066FF]" />
          <h3 className="font-heading font-bold text-lg text-slate-950 dark:text-white uppercase tracking-wider">
            Itemized Package Breakdown
          </h3>
        </div>
        <span className="font-mono-tech text-xs text-slate-500 dark:text-gray-400 font-semibold">
          {packageList.length} {packageList.length === 1 ? 'Package Line Item' : 'Package Line Items'}
        </span>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left font-mono-tech text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 uppercase text-[10px] tracking-wider font-bold">
              <th className="py-3 px-4">Pkg #</th>
              <th className="py-3 px-4">Package Type</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4 text-center">Length (cm)</th>
              <th className="py-3 px-4 text-center">Width (cm)</th>
              <th className="py-3 px-4 text-center">Height (cm)</th>
              <th className="py-3 px-4 text-right">Weight (kg)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {packageList.map((pkg, idx) => (
              <tr key={pkg.packageNumber || idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 px-4 font-bold text-[#0066FF] dark:text-[#38bdf8]">
                  #{pkg.packageNumber || idx + 1}
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-200 uppercase font-bold text-[10px]">
                    {pkg.type}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-900 dark:text-white font-medium">
                  {pkg.description}
                </td>
                <td className="py-3.5 px-4 text-center text-slate-700 dark:text-gray-300 font-medium">
                  {pkg.length.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-center text-slate-700 dark:text-gray-300 font-medium">
                  {pkg.width.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-center text-slate-700 dark:text-gray-300 font-medium">
                  {pkg.height.toLocaleString()}
                </td>
                <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  {pkg.weight.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })} kg
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {packageList.map((pkg, idx) => (
          <div key={pkg.packageNumber || idx} className="bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/5 rounded-xl p-4 space-y-2 font-mono-tech text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0066FF] dark:text-[#38bdf8]">Package #{pkg.packageNumber || idx + 1}</span>
              <span className="px-2 py-0.5 rounded bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-200 uppercase font-bold text-[10px]">
                {pkg.type}
              </span>
            </div>
            <div className="text-slate-900 dark:text-white font-medium text-xs">
              {pkg.description}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-white/5 text-[11px] text-slate-600 dark:text-gray-300">
              <div>Dimensions: {pkg.length} × {pkg.width} × {pkg.height} cm</div>
              <div className="text-right font-bold text-emerald-600 dark:text-emerald-400">Weight: {pkg.weight} kg</div>
            </div>
          </div>
        ))}
      </div>

      {/* Package Dimension & Weight Summary */}
      <div className="pt-6 border-t border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="w-4 h-4 text-[#0066FF] dark:text-[#38bdf8]" />
          <h4 className="font-heading font-bold text-sm text-slate-950 dark:text-white uppercase tracking-wider">
            Package Dimension &amp; Weight Summary
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono-tech">
          {/* Volumetric Weight */}
          <div className="bg-slate-50 dark:bg-[#0D1527] p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
            <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase flex items-center gap-1 font-bold">
              <Maximize2 className="w-3 h-3 text-[#0066FF] dark:text-sky-400" /> Total Volumetric Weight
            </div>
            <div className="text-slate-950 dark:text-white font-bold text-lg sm:text-xl">
              {calculatedVolumetricWeight.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg
            </div>
            <div className="text-slate-500 dark:text-gray-500 text-[10px]">
              Formula: (L × W × H) / 5000
            </div>
          </div>

          {/* Total Volume */}
          <div className="bg-slate-50 dark:bg-[#0D1527] p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
            <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase flex items-center gap-1 font-bold">
              <Layers className="w-3 h-3 text-purple-600 dark:text-purple-400" /> Total Volume
            </div>
            <div className="text-slate-950 dark:text-white font-bold text-lg sm:text-xl">
              {calculatedVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 3 })} cu. m
            </div>
            <div className="text-slate-500 dark:text-gray-500 text-[10px]">
              Cubic Meters Volume (CBM)
            </div>
          </div>

          {/* Total Actual Weight */}
          <div className="bg-slate-50 dark:bg-[#0D1527] p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
            <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase flex items-center gap-1 font-bold">
              <Scale className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Total Actual Weight
            </div>
            <div className="text-emerald-600 dark:text-emerald-400 font-bold text-lg sm:text-xl">
              {calculatedActualWeight.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg
            </div>
            <div className="text-slate-500 dark:text-gray-500 text-[10px]">
              Physical Gross Verified Mass
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
