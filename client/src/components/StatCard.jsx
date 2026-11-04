import React from "react";
import { ArrowUpRight } from "lucide-react";

export default function StatCard({
  title,
  amount,
  percentage,
  changeText,
  icon: Icon,
  iconBg,
  iconColor,
}) {
  return (
    <div className="relative flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition-colors dark:border-slate-800/80 dark:bg-[#151c2e] sm:rounded-3xl sm:p-5">

      <div className="mb-3 flex min-w-0 items-center gap-2.5 sm:gap-3.5">
        <div className={`shrink-0 rounded-xl p-2.5 sm:rounded-2xl sm:p-3 ${iconBg} ${iconColor}`}>
          <Icon size={20} className="sm:hidden" />
          <Icon size={22} className="hidden sm:block" />
        </div>

        <div className="min-w-0">
          <span className="block text-[10px] font-medium leading-4 text-slate-500 dark:text-slate-400 sm:text-xs">
            {title}
          </span>

          <h3 className="break-words text-lg font-bold leading-6 text-slate-900 dark:text-white sm:text-2xl sm:leading-8">
            {amount}
          </h3>
        </div>
      </div>

      <div className="mt-1 flex min-w-0 flex-wrap items-center justify-between gap-1 text-[10px] sm:text-xs">
        {percentage && (
          <span className="flex shrink-0 items-center gap-0.5 font-semibold text-emerald-600">
            <ArrowUpRight size={14} />
            {percentage}
          </span>
        )}

        <span className="break-words font-medium leading-4 text-slate-400">
          {changeText}
        </span>
      </div>
    </div>
  );
}