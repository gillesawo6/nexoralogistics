import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { SERVICES_DATA } from '../data/mockData';
import { updatePageSeo } from '../services/seoService';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Globe2, 
  ShieldCheck, 
  Layers, 
  Plane, 
  Ship, 
  Truck, 
  Warehouse, 
  FileCheck, 
  Network 
} from 'lucide-react';

export const ServiceDetailPage: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();

  const service = SERVICES_DATA.find((s) => s.id === serviceId) || SERVICES_DATA[0];

  useEffect(() => {
    updatePageSeo({
      title: `${service.title} | NEXORA LOGISTICS`,
      description: service.description,
      canonical: `https://nexoralogistics.com/services/${service.id}`,
    });
  }, [service]);

  return (
    <div className="pt-28 pb-24 bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back navigation */}
        <Link
          to="/services"
          className="inline-flex items-center gap-2 text-xs font-mono-tech text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-wider mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Services</span>
        </Link>

        {/* Hero Banner Header */}
        <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/15 p-6 sm:p-12 mb-12 shadow-xl">
          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0066FF]/40 bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] font-mono-tech text-xs uppercase tracking-widest font-bold">
              <span>SERVICE {service.number} SPECIFICATION</span>
            </div>

            <h1 className="font-heading font-black uppercase text-3xl sm:text-5xl md:text-6xl text-slate-950 dark:text-white tracking-tight leading-none">
              {service.title}
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 dark:text-gray-300 font-light leading-relaxed">
              {service.tagline}
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to={`/quote?service=${encodeURIComponent(service.title)}`}
                className="px-8 py-4 bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xl shadow-[#0066FF]/30 flex items-center gap-2 cursor-pointer"
              >
                <span>REQUEST INSTANT RATE QUOTE</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Background image overlay */}
          <div className="absolute right-0 top-0 bottom-0 w-full lg:w-1/2 opacity-20 lg:opacity-30 dark:opacity-20 dark:lg:opacity-40 pointer-events-none">
            <img
              src={service.image}
              alt={service.title}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white dark:from-[#070D1D] via-white/80 dark:via-[#070D1D]/70 to-transparent" />
          </div>
        </div>

        {/* Deep Dive Content Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-10">
            <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-10 space-y-6 shadow-md">
              <h2 className="font-heading font-bold text-2xl uppercase text-slate-900 dark:text-white">
                Operational Overview & SLAs
              </h2>
              <p className="text-slate-600 dark:text-gray-300 leading-relaxed text-sm sm:text-base font-light">
                {service.description}
              </p>

              <div className="pt-4 space-y-4">
                <h3 className="font-heading font-bold text-lg uppercase text-slate-900 dark:text-white">
                  Key Technical Features & Protocols
                </h3>
                <div className="space-y-3">
                  {service.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 dark:bg-[#0D1527] rounded-xl border border-slate-200 dark:border-white/5 flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-5 h-5 text-[#0066FF] dark:text-[#38bdf8] shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-700 dark:text-gray-200">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {service.stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 p-6 rounded-2xl text-center shadow-md"
                >
                  <div className="font-heading font-black text-3xl text-[#0066FF] dark:text-[#38bdf8]">
                    {stat.value}
                  </div>
                  <div className="font-mono-tech text-xs text-slate-500 dark:text-gray-400 mt-1 uppercase font-bold">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Specs Card */}
            <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-3xl p-6 space-y-4 font-mono-tech text-xs shadow-md">
              <div className="text-slate-900 dark:text-white font-bold uppercase pb-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                <span>SERVICE PARAMETERS</span>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>

              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-gray-500">STANDARD TRANSIT:</span>
                <span className="text-slate-900 dark:text-white font-bold">{service.leadTime}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-gray-500">GEOGRAPHIC SCOPE:</span>
                <span className="text-slate-900 dark:text-white font-bold">{service.coverage}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-gray-500">TRACKING FIDELITY:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Continuous 15m Sat-AIS</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-gray-500">INSURANCE:</span>
                <span className="text-slate-900 dark:text-white font-bold">100% Value Insurable</span>
              </div>

              <Link
                to={`/quote?service=${encodeURIComponent(service.title)}`}
                className="w-full mt-4 py-3 bg-[#0066FF] hover:bg-[#0052cc] rounded-xl text-white font-heading font-bold text-center block uppercase tracking-wider transition-colors"
              >
                Instant Rate Calculator
              </Link>
            </div>

            {/* Other Services Navigation List */}
            <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-3xl p-6 space-y-3 shadow-md">
              <div className="text-xs font-mono-tech text-slate-500 dark:text-gray-400 uppercase mb-2 font-bold">
                OTHER FREIGHT MODES
              </div>
              {SERVICES_DATA.filter((s) => s.id !== service.id).map((other) => (
                <Link
                  key={other.id}
                  to={`/services/${other.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0D1527]/50 hover:bg-slate-100 dark:hover:bg-[#0D1527] border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-colors text-xs font-heading font-bold uppercase text-slate-700 dark:text-gray-300 hover:text-slate-950 dark:hover:text-white"
                >
                  <span>{other.title}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 dark:text-gray-500" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
