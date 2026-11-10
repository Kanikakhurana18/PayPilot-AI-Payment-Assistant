import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  BarChart,
  Bar,
} from "recharts";
import {
  TrendingUp,
  Wallet,
  Receipt,
  Clock,
  RefreshCw,
  AlertCircle,
  Users,
  Sparkles,
  LoaderCircle,
} from "lucide-react";
import API from "../config/api";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const STATUS_COLORS = {
  Paid: "#6366f1",
  Pending: "#f59e0b",
  Overdue: "#ef4444",
};

export default function Analytics() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [period, setPeriod] = useState("6M");
  const [forecastPeriod, setForecastPeriod] = useState("30D");
  const [loading, setLoading] = useState(true);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiForecastInsight, setAiForecastInsight] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const [invoiceRes, paymentRes] = await Promise.all([
        axios.get(`${API}/invoices`),
        axios.get(`${API}/payments`),
      ]);

      const invoiceData =
        invoiceRes.data.invoices || invoiceRes.data;

      const paymentData =
        paymentRes.data.payments || paymentRes.data;

      setInvoices(Array.isArray(invoiceData) ? invoiceData : []);
      setPayments(Array.isArray(paymentData) ? paymentData : []);
    } catch (err) {
      console.error("Analytics Error:", err);
      setError("Unable to load analytics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const completedPayments = useMemo(
    () => payments.filter((p) => p.status === "Completed"),
    [payments]
  );

  const revenue = completedPayments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  const paidInvoices = invoices.filter(
    (invoice) => invoice.status === "Paid"
  );

  const pendingInvoices = invoices.filter((invoice) => {
    const dueDate = invoice.dueDate
      ? new Date(invoice.dueDate)
      : null;

    const overdue =
      invoice.status !== "Paid" &&
      dueDate &&
      !Number.isNaN(dueDate.getTime()) &&
      dueDate < new Date();

    return invoice.status === "Pending" && !overdue;
  });

  const overdueInvoices = invoices.filter((invoice) => {
    const dueDate = invoice.dueDate
      ? new Date(invoice.dueDate)
      : null;

    return (
      invoice.status === "Overdue" ||
      (invoice.status !== "Paid" &&
        dueDate &&
        !Number.isNaN(dueDate.getTime()) &&
        dueDate < new Date())
    );
  });

  const totalInvoices = invoices.length;

  const successRate =
    payments.length > 0
      ? (completedPayments.length / payments.length) * 100
      : 0;

  const revenueData = useMemo(() => {
    const months = period === "3M" ? 3 : period === "6M" ? 6 : 12;
    const now = new Date();

    const data = Array.from({ length: months }, (_, index) => {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - months + 1 + index,
        1
      );

      return {
        month: date.toLocaleString("en-US", { month: "short" }),
        year: date.getFullYear(),
        revenue: 0,
      };
    });

    completedPayments.forEach((payment) => {
      const date = new Date(payment.createdAt);

      if (Number.isNaN(date.getTime())) return;

      const item = data.find(
        (entry) =>
          entry.year === date.getFullYear() &&
          entry.month ===
          date.toLocaleString("en-US", { month: "short" })
      );

      if (item) {
        item.revenue += Number(payment.amount || 0);
      }
    });

    return data;
  }, [completedPayments, period]);

  const statusData = [
    { name: "Paid", value: paidInvoices.length },
    { name: "Pending", value: pendingInvoices.length },
    { name: "Overdue", value: overdueInvoices.length },
  ]
    .filter((item) => item.value > 0)
    .map((item) => ({
      ...item,
      fill: STATUS_COLORS[item.name],
    }));

  const topCustomers = useMemo(() => {
    const customerMap = {};

    completedPayments.forEach((payment) => {
      const customer = payment.customer;
      const id = customer?._id || customer?.email || customer?.name;

      if (!id) return;

      if (!customerMap[id]) {
        customerMap[id] = {
          name: customer.name || "Unknown customer",
          revenue: 0,
          transactions: 0,
        };
      }

      customerMap[id].revenue += Number(payment.amount || 0);
      customerMap[id].transactions += 1;
    });

    return Object.values(customerMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [completedPayments]);

  const transactionData = useMemo(() => {
    return revenueData.map((month) => {
      const count = completedPayments.filter((payment) => {
        const date = new Date(payment.createdAt);

        return (
          !Number.isNaN(date.getTime()) &&
          date.getFullYear() === month.year &&
          date.toLocaleString("en-US", { month: "short" }) ===
          month.month
        );
      }).length;

      return { ...month, transactions: count };
    });
  }, [revenueData, completedPayments]);

  const forecastData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = forecastPeriod === "7D" ? 7 : 30;

    const endDate = new Date(today);
    endDate.setDate(today.getDate() + days);

    const upcomingInvoices = invoices.filter((invoice) => {
      if (
        invoice.status === "Paid" ||
        !invoice.dueDate
      ) {
        return false;
      }

      const dueDate = new Date(invoice.dueDate);

      if (Number.isNaN(dueDate.getTime())) return false;

      dueDate.setHours(0, 0, 0, 0);

      return dueDate >= today && dueDate < endDate;
    });

    const overdueAmount = invoices.reduce((sum, invoice) => {
      if (invoice.status === "Paid" || !invoice.dueDate) {
        return sum;
      }

      const dueDate = new Date(invoice.dueDate);

      if (Number.isNaN(dueDate.getTime())) return sum;

      dueDate.setHours(0, 0, 0, 0);

      return dueDate < today
        ? sum + Number(invoice.amount || 0)
        : sum;
    }, 0);

    const bucketCount = forecastPeriod === "7D" ? 7 : 5;

    const buckets = Array.from(
      { length: bucketCount },
      (_, index) => {
        const start = new Date(today);

        if (forecastPeriod === "7D") {
          start.setDate(today.getDate() + index);
        } else {
          start.setDate(today.getDate() + index * 7);
        }

        const end = new Date(start);

        if (forecastPeriod === "7D") {
          end.setDate(start.getDate() + 1);
        } else {
          end.setDate(start.getDate() + 7);
        }

        if (forecastPeriod === "30D" && index === 4) {
          end.setTime(endDate.getTime());
        }

        const amount = upcomingInvoices.reduce(
          (sum, invoice) => {
            const dueDate = new Date(invoice.dueDate);
            dueDate.setHours(0, 0, 0, 0);

            return dueDate >= start && dueDate < end
              ? sum + Number(invoice.amount || 0)
              : sum;
          },
          0
        );

        return {
          period:
            forecastPeriod === "7D"
              ? start.toLocaleDateString("en-US", {
                day: "numeric",
                month: "short",
              })
              : `Week ${index + 1}`,
          amount,
        };
      }
    );

    const totalExpected = upcomingInvoices.reduce(
      (sum, invoice) =>
        sum + Number(invoice.amount || 0),
      0
    );

    return {
      buckets,
      upcomingInvoices,
      totalExpected,
      overdueAmount,
      invoiceCount: upcomingInvoices.length,
    };
  }, [invoices, forecastPeriod]);

  useEffect(() => {
    if (loading) return;

    if (!invoices.length) {
      setAiForecastInsight(
        "Create invoices with upcoming due dates to generate a cash flow forecast."
      );
      return;
    }

    let cancelled = false;

    const generateInsight = async () => {
      setForecastLoading(true);
      setAiForecastInsight("");

      try {
        const response = await axios.post(`${API}/ai/chat`, {
          message: `Analyze this cash flow forecast for the next ${forecastPeriod === "7D" ? "7 days" : "30 days"
            }.

Expected collections: ${formatCurrency(forecastData.totalExpected)}
Upcoming unpaid invoices: ${forecastData.invoiceCount}
Overdue outstanding amount: ${formatCurrency(forecastData.overdueAmount)}

Give a short business insight in 2-3 sentences. Explain expected incoming payments and one practical action. Do not treat unpaid invoices as guaranteed revenue. Do not invent data.`,
        });

        if (!cancelled) {
          setAiForecastInsight(
            response.data.reply ||
            response.data.message ||
            response.data.response ||
            "No AI insight was returned."
          );
        }
      } catch (err) {
        console.error("AI Forecast Error:", err);

        if (!cancelled) {
          setAiForecastInsight(
            "Your forecast is calculated from upcoming invoice due dates. AI insights are temporarily unavailable."
          );
        }
      } finally {
        if (!cancelled) {
          setForecastLoading(false);
        }
      }
    };

    generateInsight();

    return () => {
      cancelled = true;
    };
  }, [
    loading,
    forecastPeriod,
    forecastData.totalExpected,
    forecastData.invoiceCount,
    forecastData.overdueAmount,
    invoices.length,
  ]);

  const cardClass =
    "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151c2e]";

  const tooltipStyle = {
    backgroundColor: "#151c2e",
    border: "1px solid #334155",
    borderRadius: "12px",
    color: "#fff",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track your business performance and payment trends.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-[#151c2e] dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-[#151c2e]">
          Loading analytics...
        </div>
      ) : (
        <>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className={cardClass}>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Total Revenue
                </span>
                <Wallet className="text-indigo-500" size={21} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(revenue)}
              </h2>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                From completed payments
              </p>
            </div>

            <div className={cardClass}>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Successful Payments
                </span>
                <TrendingUp className="text-emerald-500" size={21} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {completedPayments.length}
              </h2>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Completed transactions
              </p>
            </div>

            <div className={cardClass}>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Pending Invoices
                </span>
                <Clock className="text-amber-500" size={21} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {pendingInvoices.length}
              </h2>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Awaiting payment
              </p>
            </div>

            <div className={cardClass}>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Total Invoices
                </span>
                <Receipt className="text-purple-500" size={21} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {totalInvoices}
              </h2>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                All created invoices
              </p>
            </div>
          </div>

          <section className={`${cardClass} space-y-5`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-500/15 flex items-center justify-center">
                    <TrendingUp
                      className="text-violet-600 dark:text-violet-300"
                      size={19}
                    />
                  </div>

                  <h2 className="font-semibold text-slate-900 dark:text-white">
                    AI Cash Flow Forecast
                  </h2>
                </div>

                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Estimated collections based on upcoming unpaid invoices
                </p>
              </div>

              <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-[#0f172a]">
                {["7D", "30D"].map((item) => (
                  <button
                    key={item}
                    onClick={() => setForecastPeriod(item)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold ${forecastPeriod === item
                        ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white"
                        : "text-slate-500 dark:text-slate-400"
                      }`}
                  >
                    {item === "7D" ? "7 Days" : "30 Days"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl bg-violet-50 dark:bg-violet-500/10 p-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Expected Collections
                </p>

                <h3 className="text-2xl font-bold text-violet-700 dark:text-violet-300 mt-2">
                  {formatCurrency(forecastData.totalExpected)}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  From {forecastData.invoiceCount} upcoming invoice(s)
                </p>
              </div>

              <div className="rounded-xl bg-red-50 dark:bg-red-500/10 p-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Overdue Outstanding
                </p>

                <h3 className="text-2xl font-bold text-red-600 dark:text-red-300 mt-2">
                  {formatCurrency(forecastData.overdueAmount)}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Not included in expected collections
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-1">
                Expected Cash Inflow
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Invoice amounts grouped by their due dates
              </p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData.buckets}>
                    <defs>
                      <linearGradient
                        id="cashForecast"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#94a3b8"
                      opacity={0.2}
                    />

                    <XAxis
                      dataKey="period"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      tickFormatter={(value) => `$${value}`}
                    />

                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => formatCurrency(value)}
                    />

                    <Area
                      type="monotone"
                      dataKey="amount"
                      name="Expected collections"
                      stroke="#8b5cf6"
                      strokeWidth={2.5}
                      fill="url(#cashForecast)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-violet-200 dark:border-violet-500/20 bg-violet-50/70 dark:bg-violet-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles
                  size={17}
                  className="text-violet-600 dark:text-violet-300"
                />

                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  AI Forecast Insight
                </h3>
              </div>

              {forecastLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <LoaderCircle size={15} className="animate-spin" />
                  Analyzing your cash flow...
                </div>
              ) : (
                <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                  {aiForecastInsight || "No forecast insight available."}
                </p>
              )}
            </div>

            <p className="text-[11px] text-slate-400">
              Forecasts are estimates based on unpaid invoice due dates, not guaranteed payments. Overdue invoices are excluded from expected collections.
            </p>
          </section>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            <div className={`${cardClass} xl:col-span-2`}>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">
                    Revenue Overview
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Monthly completed payment revenue
                  </p>
                </div>

                <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-[#0f172a]">
                  {["3M", "6M", "12M"].map((item) => (
                    <button
                      key={item}
                      onClick={() => setPeriod(item)}
                      className={`rounded-md px-3 py-1.5 text-xs font-semibold ${period === item
                          ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white"
                          : "text-slate-500 dark:text-slate-400"
                        }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient
                        id="analyticsRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#94a3b8"
                      opacity={0.2}
                    />

                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#94a3b8" }}
                      tickFormatter={(value) => `$${value}`}
                    />

                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => formatCurrency(value)}
                    />

                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fill="url(#analyticsRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={cardClass}>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Invoice Status
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Distribution of your invoices
              </p>

              {statusData.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-sm text-slate-400">
                  No invoice data available
                </div>
              ) : (
                <>
                  <div className="relative h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={58}
                          outerRadius={82}
                          paddingAngle={4}
                        />
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">
                        {totalInvoices}
                      </span>
                      <span className="text-xs text-slate-500">
                        Invoices
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[
                      { name: "Paid", value: paidInvoices.length },
                      { name: "Pending", value: pendingInvoices.length },
                      { name: "Overdue", value: overdueInvoices.length },
                    ].map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{
                              backgroundColor: STATUS_COLORS[item.name],
                            }}
                          />
                          {item.name}
                        </div>

                        <span className="font-semibold text-slate-900 dark:text-white">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div className={cardClass}>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Transaction Trends
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Number of successful payments per month
              </p>

              <div className="mt-5 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={transactionData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#94a3b8"
                      opacity={0.2}
                    />

                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                    />

                    <YAxis
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                    />

                    <Tooltip contentStyle={tooltipStyle} />

                    <Bar
                      dataKey="transactions"
                      name="Transactions"
                      fill="#8b5cf6"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={cardClass}>
              <div className="mb-5 flex items-center gap-2">
                <Users className="text-indigo-500" size={20} />
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-white">
                    Top Customers
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Ranked by completed payment revenue
                  </p>
                </div>
              </div>

              {topCustomers.length === 0 ? (
                <div className="flex h-52 items-center justify-center text-sm text-slate-400">
                  No completed customer payments yet
                </div>
              ) : (
                <div className="space-y-4">
                  {topCustomers.map((customer, index) => (
                    <div
                      key={`${customer.name}-${index}`}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
                            {customer.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {customer.transactions} successful payment(s)
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 text-sm font-bold text-slate-900 dark:text-white">
                        {formatCurrency(customer.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={cardClass}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">
                  Payment Success Rate
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Completed payments divided by all recorded payment attempts
                </p>
              </div>

              <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {successRate.toFixed(1)}%
              </span>
            </div>

            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{ width: `${successRate}%` }}
              />
            </div>

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {completedPayments.length} completed out of {payments.length} recorded payment attempts.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
