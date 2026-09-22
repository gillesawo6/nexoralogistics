import React from 'react';
import { MessageSquare, Star, Building2, User } from 'lucide-react';
import { TESTIMONIALS_DATA } from '../../data/mockData';
import { updatePageSeo } from '../../services/seoService';

export const TestimonialsAdminPage: React.FC = () => {
  React.useEffect(() => {
    updatePageSeo({
      title: 'Client Testimonials | NEXORA Admin',
      description: 'Endorsements from global supply chain leaders and logistics vice presidents.',
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-950 dark:text-white uppercase tracking-tight">
            Client Testimonials &amp; Reviews
          </h1>
          <p className="text-slate-600 dark:text-gray-400 text-xs font-mono-tech mt-1">
            Verified ratings and customer feedback from Fortune 500 partners.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono-tech text-xs">
        {TESTIMONIALS_DATA.map((t) => (
          <div
            key={t.id}
            className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(t.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>

              <p className="font-sans text-sm text-slate-700 dark:text-gray-300 italic leading-relaxed">
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center gap-3">
              <img
                src={t.avatar}
                alt={t.client}
                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-white/10"
              />
              <div>
                <div className="font-heading font-bold text-sm text-slate-950 dark:text-white uppercase">
                  {t.client}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-gray-400">
                  {t.role}, {t.company}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
