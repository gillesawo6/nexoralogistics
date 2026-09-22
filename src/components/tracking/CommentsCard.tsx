import React from 'react';
import { MessageSquare, AlertCircle, Info, ShieldAlert } from 'lucide-react';

interface CommentsCardProps {
  comments?: string;
}

export const CommentsCard: React.FC<CommentsCardProps> = ({ comments }) => {
  if (!comments || !comments.trim()) return null;

  return (
    <div className="bg-amber-50/70 dark:bg-[#070D1D] border border-amber-300 dark:border-amber-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden transition-colors">
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-500/20 shrink-0 mt-0.5">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div className="space-y-1 flex-1 font-mono-tech">
          <div className="flex items-center gap-2">
            <span className="text-amber-800 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
              Special Handling Notes &amp; Consignee Instructions
            </span>
          </div>
          <p className="text-slate-800 dark:text-gray-200 text-xs sm:text-sm leading-relaxed pt-1">
            {comments}
          </p>
        </div>
      </div>
    </div>
  );
};
