import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  Wallet,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  BellRing,
  Copy,
  LoaderCircle,
} from "lucide-react";
import StatCard from "../components/StatCard";
import RevenueChart from "../components/RevenueChart";
import PaymentStatusChart from "../components/PaymentStatusChart";
import API from "../config/api";

const getArray = (data, key) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  return [];
};

const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatDate = (date) => {
  if (!date) return "";
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toLocaleDateString("en-IN");
};

export default function Dashboard() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [aiInsight, setAiInsight] = useState("");
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reminderDrafts, setReminderDrafts] = useState({});
  const [generatingReminder, setGeneratingReminder] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");

    try {
      const [invoiceRes, paymentRes] = await Promise.all([
        axios.get(`${API}/invoices`),
        axios.get(`${API}/payments`),
      ]);
      setInvoices(getArray(invoiceRes.data, "invoices"));
      setPayments(getArray(paymentRes.data, "payments"));

      try {
        const reminderRes = await axios.get(`${API}/ai/reminders`);

        setReminders(getArray(reminderRes.data, "reminders"));
      } catch (err) {
        console.error("Reminders error:", err);
        setReminders([]);
      }

      try {
        const aiRes = await axios.get(`${API}/ai/insights`);
        setAiInsight(aiRes.data?.insights || "");
      } catch (err) {
        console.error("AI insights error:", err);
        setAiInsight("");
      }
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(
        "Unable to load dashboard data. Please check your server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const completedPayments = useMemo(
    () => payments.filter((payment) => payment.status === "Completed"),
    [payments]
  );

  const totalRevenue = useMemo(
    () =>
      completedPayments.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
      ),
    [completedPayments]
  );

  const pendingInvoices = useMemo(
    () =>
      invoices.filter((invoice) =>
        ["Pending", "Overdue"].includes(invoice.status)
      ),
    [invoices]
  );

  const pendingAmount = useMemo(
    () =>
      pendingInvoices.reduce(
        (sum, invoice) => sum + Number(invoice.amount || 0),
        0
      ),
    [pendingInvoices]
  );

  const recentPayments = useMemo(
    () =>
      [...payments]
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0) -
            new Date(a.createdAt || 0)
        )
        .slice(0, 5),
    [payments]
  );

  const sortedReminders = useMemo(
    () =>
      [...reminders].sort(
        (a, b) =>
          new Date(a.dueDate || 0) -
          new Date(b.dueDate || 0)
      ),
    [reminders]
  );

  const hasOverdue =
    reminders.some((reminder) => reminder.priority === "Overdue") ||
    pendingInvoices.some((invoice) => invoice.status === "Overdue");

  const paymentHealth = hasOverdue
    ? "Needs Attention"
    : pendingInvoices.length > 0
      ? "Payments Pending"
      : "Looking Good";

  const overdueCount = reminders.filter(
    (reminder) => reminder.priority === "Overdue"
  ).length;

  const urgentCount = reminders.filter(
    (reminder) => reminder.priority === "Urgent"
  ).length;

  const upcomingCount = reminders.filter(
    (reminder) => reminder.priority === "Upcoming"
  ).length;

  const nextReminder = sortedReminders[0];

  const generateReminder = async (reminder) => {
    if (!reminder?.invoiceId) return;

    setGeneratingReminder(reminder.invoiceId);

    try {
      const response = await axios.post(`${API}/ai/chat`, {
        message: `Write a very short and polite payment reminder message (maximum 45 words).

Customer: ${reminder.customer}
Invoice: ${reminder.invoiceNumber}
Amount: ${money(reminder.amount)}
Due date: ${formatDate(reminder.dueDate)}

Rules:
- Start with "Hi ${reminder.customer},"
- Write only a simple reminder message.
- No subject line.
- No email format or formal closing.
- No placeholders.
- Maximum 45 words.
- Do not claim the reminder was sent.
- Return only the message.`,
      });

      const reply = response.data?.reply;

      if (!reply) {
        throw new Error("Empty AI response");
      }

      setReminderDrafts((prev) => ({
        ...prev,
        [reminder.invoiceId]: reply,
      }));
    } catch (err) {
      console.error("Reminder error:", err);
      alert("Unable to generate reminder. Please try again.");
    } finally {
      setGeneratingReminder(null);
    }
  };

  const copyReminder = async (invoiceId) => {
    const draft = reminderDrafts[invoiceId];

    if (!draft) return;

    try {
      await navigator.clipboard.writeText(draft);
      alert("Reminder copied!");
    } catch (err) {
      console.error("Copy error:", err);
      alert("Unable to copy reminder.");
    }
  };

  return (
    <div className="w-full min-w-0 space-y-5 sm:space-y-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            Business Overview 
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track your payments and business performance.
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <button
            type="button"
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-[#151c2e] dark:text-slate-300 sm:flex-none"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <Link
            to="/invoices"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:flex-none"
          >
            <Plus size={17} />
            Create Invoice
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          title="Total Revenue"
          amount={loading ? "..." : money(totalRevenue)}
          changeText="From completed payments"
          icon={Wallet}
          iconBg="bg-indigo-100 dark:bg-indigo-500/15"
          iconColor="text-indigo-600 dark:text-indigo-400"
        />

        <StatCard
          title="Successful Payments"
          amount={loading ? "..." : completedPayments.length}
          changeText="Completed transactions"
          icon={CheckCircle2}
          iconBg="bg-emerald-100 dark:bg-emerald-500/15"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />

        <StatCard
          title="Pending Invoices"
          amount={loading ? "..." : money(pendingAmount)}
          changeText={`${pendingInvoices.length} unpaid invoices`}
          icon={Clock}
          iconBg="bg-amber-100 dark:bg-amber-500/15"
          iconColor="text-amber-600 dark:text-amber-400"
        />

        <StatCard
          title="Total Invoices"
          amount={loading ? "..." : invoices.length}
          changeText="Invoices created"
          icon={FileText}
          iconBg="bg-blue-100 dark:bg-blue-500/15"
          iconColor="text-blue-600 dark:text-blue-400"
        />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-12 xl:items-stretch">

        <div className="min-w-0 lg:col-span-2 xl:col-span-5">
          <RevenueChart payments={payments} />
        </div>

        <div className="min-w-0 xl:col-span-3">
          <PaymentStatusChart payments={payments} />
        </div>

        <div className="relative flex min-h-75 min-w-0 flex-col overflow-hidden rounded-2xl bg-linear-to-br from-[#5546df] via-[#392bb5] to-[#21175e] p-5 text-white shadow-sm sm:p-6 lg:col-span-1 xl:col-span-4">

          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-indigo-300/10 blur-3xl" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <Sparkles size={19} className="text-yellow-300" />
              </div>

              <h2 className="text-base font-bold">
                AI Business Insights
              </h2>
            </div>

            <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold">
              AI Powered
            </span>
          </div>

          <div className="relative z-10 mt-6 rounded-xl border border-white/15 bg-white/10 p-4">
            <div className="flex items-center gap-2 text-indigo-100">
              <TrendingUp size={16} className="text-emerald-300" />
              <span className="text-xs font-medium">
                Payment Health
              </span>
            </div>

            <p className="mt-2 wrap-break-word text-xl font-bold">
              {loading ? "Analyzing..." : paymentHealth}
            </p>

            <p className="mt-1 text-xs leading-5 text-indigo-100">
              {hasOverdue
                ? "Some invoices need attention."
                : pendingInvoices.length
                  ? "Follow up on pending payments."
                  : "Your invoices are up to date."}
            </p>
          </div>

          <div className="relative z-10 mt-5 flex-1">
            <p className="flex items-center gap-2 text-xs font-bold text-indigo-200">
              <Sparkles size={14} />
              AI Recommendation
            </p>

            <p className="mt-2 wrap-break-word text-sm leading-6 text-white/95">
              {loading
                ? "Analyzing your payment data..."
                : aiInsight ||
                  "AI recommendations are temporarily unavailable."}
            </p>
          </div>

          <Link
            to="/ai-assistant"
            className="relative z-10 mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-xs font-bold text-indigo-800 transition hover:bg-indigo-50"
          >
            Explore AI Assistant
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-12">

        <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#151c2e] xl:col-span-8">

          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 dark:border-slate-800 sm:px-5">
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent Transactions
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Your latest payment activity.
              </p>
            </div>

            <Link
              to="/payments"
              className="flex shrink-0 items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400"
            >
              View all <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <p className="p-6 text-center text-sm text-slate-500">
              Loading transactions...
            </p>
          ) : recentPayments.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-500">
              No transactions yet.
            </p>
          ) : (
            <>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 sm:hidden">
                {recentPayments.map((payment) => (
                  <div key={payment._id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
                          {payment.customer?.name || "Unknown customer"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {payment.invoice?.invoiceNumber || "—"}
                        </p>
                      </div>

                      <span className="shrink-0 text-sm font-bold text-slate-900 dark:text-white">
                        {money(payment.amount)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          payment.status === "Completed"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                            : payment.status === "Failed"
                              ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
                        }`}
                      >
                        {payment.status}
                      </span>

                      <span className="text-[10px] text-slate-400">
                        {formatDate(payment.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden w-full overflow-x-auto sm:block">
                <table className="w-full min-w-125 text-left text-sm">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Customer</th>
                      <th className="px-5 py-3 font-semibold">Invoice</th>
                      <th className="px-5 py-3 font-semibold">Amount</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recentPayments.map((payment) => (
                      <tr
                        key={payment._id}
                        className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-5 py-3">
                          <p className="font-medium text-slate-800 dark:text-slate-200">
                            {payment.customer?.name || "Unknown customer"}
                          </p>
                        </td>

                        <td className="px-5 py-3 text-xs text-slate-500 dark:text-slate-400">
                          {payment.invoice?.invoiceNumber || "—"}
                        </td>

                        <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-200">
                          {money(payment.amount)}
                        </td>

                        <td className="px-5 py-3">
                          <span
                            className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                              payment.status === "Completed"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                                : payment.status === "Failed"
                                  ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400"
                                  : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="relative flex min-h-70 min-w-0 flex-col overflow-hidden rounded-2xl border border-indigo-100 bg-linear-to-br from-indigo-50 to-purple-100 p-5 dark:border-slate-800 dark:from-[#191b38] dark:to-[#211b42] xl:col-span-4">

          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-400">
              <BellRing size={17} />
              AI Payment Reminders
            </p>

            <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-1 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
              {reminders.length} Active
            </span>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className="min-w-0 rounded-xl border border-red-100 bg-white/70 p-2.5 dark:border-red-500/20 dark:bg-white/5">
              <p className="text-[10px] font-medium text-red-600 dark:text-red-400">
                Overdue
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                {loading ? "..." : overdueCount}
              </p>
            </div>

            <div className="min-w-0 rounded-xl border border-amber-100 bg-white/70 p-2.5 dark:border-amber-500/20 dark:bg-white/5">
              <p className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                Urgent
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                {loading ? "..." : urgentCount}
              </p>
            </div>

            <div className="min-w-0 rounded-xl border border-indigo-100 bg-white/70 p-2.5 dark:border-indigo-500/20 dark:bg-white/5">
              <p className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                Upcoming
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                {loading ? "..." : upcomingCount}
              </p>
            </div>
          </div>

          <div className="mt-4 flex-1">
            {loading ? (
              <p className="text-xs text-slate-500">
                Loading reminders...
              </p>
            ) : !nextReminder ? (
              <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 size={16} />
                All payments are up to date!
              </div>
            ) : (
              <>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Next payment follow-up
                </p>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                      {nextReminder.customer}
                    </p>

                    <p className="mt-1 wrap-break-word text-[11px] text-slate-500 dark:text-slate-400">
                      {nextReminder.invoiceNumber} ·{" "}
                      {money(nextReminder.amount)}
                    </p>
                  </div>

                  <span className="shrink-0 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300">
                    {nextReminder.priority}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => generateReminder(nextReminder)}
                    disabled={
                      generatingReminder === nextReminder.invoiceId
                    }
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-[11px] font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {generatingReminder === nextReminder.invoiceId ? (
                      <LoaderCircle
                        size={13}
                        className="animate-spin"
                      />
                    ) : (
                      <Sparkles size={13} />
                    )}

                    Generate Reminder
                  </button>

                  {reminderDrafts[nextReminder.invoiceId] && (
                    <button
                      type="button"
                      onClick={() =>
                        copyReminder(nextReminder.invoiceId)
                      }
                      className="flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white/70 px-3 py-2 text-[11px] font-semibold text-indigo-700 transition hover:bg-white dark:border-indigo-500/30 dark:bg-white/5 dark:text-indigo-300"
                    >
                      <Copy size={13} />
                      Copy
                    </button>
                  )}
                </div>

                {reminderDrafts[nextReminder.invoiceId] && (
                  <div className="mt-3 max-h-28 overflow-y-auto rounded-lg bg-white/70 p-3 dark:bg-white/5">
                    <p className="whitespace-pre-wrap wrap-break-word text-[11px] leading-5 text-slate-700 dark:text-slate-200">
                      {reminderDrafts[nextReminder.invoiceId]}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <Link
            to="/invoices"
            className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-indigo-700 dark:text-indigo-400"
          >
            View all invoices <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
