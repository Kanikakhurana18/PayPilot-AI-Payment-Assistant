import { Link } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";

function PaymentCancel() {
  return (
    <div className="flex min-h-[calc(100vh-100px)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-[#151c2e] sm:p-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
          <RotateCcw size={34} />
        </div>

        <p className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">
          PayPilot checkout
        </p>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Payment cancelled
        </h1>

        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
          Your payment wasn't completed. No successful payment has been recorded
          through this checkout. You can return and try again whenever you're ready.
        </p>

        <Link
          to="/payments"
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          <ArrowLeft size={16} />
          Back to Payments
        </Link>
      </div>
    </div>
  );
}

export default PaymentCancel;
