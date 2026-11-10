import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Target,
  Wallet,
  AlertCircle,
  Clock3,
  FileText,
  Sparkles,
  RefreshCw,
  LoaderCircle,
  CalendarClock,
  CheckCircle2,
} from "lucide-react";

const API_URL = "http://localhost:8000/api";

function formatMoney(amount = 0) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);
}

function formatDate(date) {
  if (!date) return "No due date";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "No due date";

  return parsedDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function RecoveryStat({ title, amount, description, icon: Icon, color }) {
  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#11182B] border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </p>

        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-3">
        {amount}
      </h3>

      <p className="text-xs text-slate-400 mt-1">{description}</p>
    </div>
  );
}

function getPriorityStyle(priority) {
  switch (priority) {
    case "Overdue":
      return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300";
    case "Urgent":
      return "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300";
    default:
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300";
  }
}

function RecoveryPlanContent({ content = "" }) {
  const decodeText = (text) => {
    const entities = {
      "&#x43;": "C",
      "&#x53;": "S",
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#39;": "'",
      "&nbsp;": " ",
    };

    return text.replace(
      /&#x43;|&#x53;|&amp;|&lt;|&gt;|&quot;|&#39;|&nbsp;/gi,
      (entity) => entities[entity] || entity
    );
  };

  const lines = decodeText(content)
    .replace(/\r/g, "")
    .split("\n");

  return (
    <div className="space-y-3 text-sm leading-6 wrap-break-word">
      {lines.map((line, index) => {
        let trimmed = line.trim();

        if (!trimmed) return null;

        trimmed = trimmed.replace(/^#{1,6}\s*/, "");

        const headingText = trimmed.replace(/^\*+|\*+$/g, "").trim();

        const isHeading =
          /^(overall assessment|recommended actions)$/i.test(
            headingText
          );

        if (isHeading) {
          return (
            <h3
              key={index}
              className="font-bold text-slate-900 dark:text-white pt-1"
            >
              {headingText}
            </h3>
          );
        }

        const isBullet = /^[-*•]\s?/.test(trimmed);
        const isNumbered = /^\d+[.)]\s?/.test(trimmed);

        let text = trimmed
          .replace(/^[-*•]\s?/, "")
          .replace(/^\d+[.)]\s?/, "");

        text = text
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\*([^*]+)\*\*/g, "$1")
          .replace(/\*+/g, "")
          .trim();

        return (
          <div
            key={index}
            className={
              isBullet || isNumbered
                ? "flex gap-2 items-start"
                : ""
            }
          >
            {(isBullet || isNumbered) && (
              <span className="text-violet-500 shrink-0 font-semibold">
                {isNumbered ? `${trimmed.match(/^\d+/)[0]}.` : "•"}
              </span>
            )}

            <span>{text}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function PaymentRecovery() {
  const [recoveryData, setRecoveryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRecoveryData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(`${API_URL}/ai/recovery`);

      if (response.data.success) {
        setRecoveryData(response.data);
      } else {
        setError("Unable to load payment recovery data.");
      }
    } catch (err) {
      console.error("Recovery API Error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load recovery insights. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecoveryData();
  }, [fetchRecoveryData]);

  const summary = recoveryData?.summary || {};
  const invoices = recoveryData?.prioritizedInvoices || [];
  const customers = recoveryData?.customerOutstanding || [];
  const recoveryPlan = recoveryData?.recoveryPlan || "";

  return (
    <div className="space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center">
              <Target
                size={21}
                className="text-violet-600 dark:text-violet-300"
              />
            </div>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Payment Recovery Copilot
            </h1>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            AI-powered insights to help you recover outstanding payments.
          </p>
        </div>

        <button
          onClick={fetchRecoveryData}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11182B] p-12 flex flex-col items-center justify-center">
          <LoaderCircle size={30} className="animate-spin text-violet-500" />
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
            Analyzing your payment data...
          </p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/5 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-500 shrink-0" size={20} />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>

          <button
            onClick={fetchRecoveryData}
            className="text-sm font-semibold text-red-600 dark:text-red-300 hover:underline"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <RecoveryStat
              title="Total Outstanding"
              amount={formatMoney(summary.totalOutstanding)}
              description="Amount awaiting collection"
              icon={Wallet}
              color="bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"
            />

            <RecoveryStat
              title="Overdue Amount"
              amount={formatMoney(summary.totalOverdue)}
              description="Past-due payments"
              icon={AlertCircle}
              color="bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300"
            />

            <RecoveryStat
              title="Overdue Invoices"
              amount={summary.overdueInvoiceCount || 0}
              description="Invoices past their due date"
              icon={Clock3}
              color="bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300"
            />

            <RecoveryStat
              title="Pending Invoices"
              amount={summary.pendingInvoiceCount || 0}
              description="Invoices awaiting payment"
              icon={FileText}
              color="bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300"
            />
          </div>

          <section className="rounded-2xl border border-violet-200 dark:border-violet-500/20 bg-linear-to-br from-violet-50 to-white dark:from-violet-500/10 dark:to-[#11182B] p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
                <Sparkles
                  size={20}
                  className="text-violet-600 dark:text-violet-300"
                />
              </div>

              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">
                  AI Recovery Strategy
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Recommendations based on your actual invoice data
                </p>
              </div>
            </div>

            {recoveryPlan ? (
              <div className="text-slate-700 dark:text-slate-300">
                <RecoveryPlanContent content={recoveryPlan} />
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <CheckCircle2 size={18} className="text-emerald-500" />
                No recovery recommendations available right now.
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11182B] overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-bold text-slate-900 dark:text-white">
                  Invoices Needing Attention
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Prioritized by payment urgency
                </p>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                {invoices.length} invoices
              </span>
            </div>

            {invoices.length === 0 ? (
              <div className="py-10 px-5 text-center">
                <CheckCircle2
                  size={32}
                  className="mx-auto text-emerald-500"
                />
                <h3 className="font-semibold text-slate-800 dark:text-white mt-3">
                  All caught up!
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  You don't have any unpaid invoices requiring attention.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.invoiceId}
                    className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                          {invoice.invoiceNumber}
                        </h3>

                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-full ${getPriorityStyle(invoice.priority)}`}
                        >
                          {invoice.priority}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                        {invoice.customer || "Unknown customer"}
                      </p>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 flex-wrap">
                        <CalendarClock size={13} />
                        Due {formatDate(invoice.dueDate)}

                        {invoice.priority === "Overdue" && (
                          <span className="text-red-500 font-medium ml-1">
                            · {invoice.daysOverdue} days overdue
                          </span>
                        )}

                        {invoice.priority === "Urgent" && (
                          <span className="text-orange-500 font-medium ml-1">
                            · Due soon
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <p className="text-base font-bold text-slate-900 dark:text-white">
                        {formatMoney(invoice.amount)}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {invoice.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#11182B] overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-bold text-slate-900 dark:text-white">
                Customer Outstanding
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Customers with pending payments
              </p>
            </div>

            {customers.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No outstanding customer balances.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {customers.map((customer, index) => (
                  <div
                    key={`${customer.customer}-${index}`}
                    className="p-4 sm:px-5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 shrink-0 rounded-xl bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center text-sm font-bold text-violet-600 dark:text-violet-300">
                        {(customer.customer || "C").charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                          {customer.customer || "Unknown customer"}
                        </h3>

                        <p className="text-xs text-slate-400 mt-1">
                          {customer.invoiceCount} invoice(s)
                          {customer.overdueInvoiceCount > 0 &&
                            ` · ${customer.overdueInvoiceCount} overdue`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {formatMoney(customer.outstandingAmount)}
                      </p>

                      {customer.overdueAmount > 0 && (
                        <p className="text-xs text-red-500 mt-1">
                          {formatMoney(customer.overdueAmount)} overdue
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <p className="text-[11px] text-slate-400 text-center">
            AI recommendations are suggestions only. No payment reminders are
            automatically sent and no transactions are initiated.
          </p>
        </>
      )}
    </div>
  );
}