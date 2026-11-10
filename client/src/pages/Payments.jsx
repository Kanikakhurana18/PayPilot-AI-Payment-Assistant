import { useEffect, useState } from "react";
import {
  Search, CreditCard, RefreshCw, ExternalLink,
  CheckCircle2, Clock3, Wallet, Receipt,
  CalendarDays, AlertCircle, X, ArrowUpRight
} from "lucide-react";
import API_URL from "../config/api";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("paypilot-token")}`,
});

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount || 0);

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

const cardClass =
  "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-[#151c2e]";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payingId, setPayingId] = useState("");
  const [error, setError] = useState("");

  const fetchData = async (isRefresh = false) => {
    try {
      setError("");

      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [paymentRes, invoiceRes] = await Promise.all([
        fetch(`${API_URL}/payments`, {
          headers: getAuthHeaders(),
        }),
        fetch(`${API_URL}/invoices`, {
          headers: getAuthHeaders(),
        }),
      ]);

      if (!paymentRes.ok || !invoiceRes.ok) {
        const failedResponse = !paymentRes.ok
          ? paymentRes
          : invoiceRes;

        let message = "Unable to load payment data.";

        try {
          const errorData = await failedResponse.json();
          message = errorData.message || message;
        } catch {
          // Keep default error message
        }

        throw new Error(message);
      }

      const paymentData = await paymentRes.json();
      const invoiceData = await invoiceRes.json();

      setPayments(paymentData.payments || []);
      setInvoices(invoiceData.invoices || []);

    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePayNow = async (invoiceId) => {
    try {
      setError("");
      setPayingId(invoiceId);

      const response = await fetch(`${API_URL}/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ invoiceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not start PayPal checkout.");
      }

      if (!data.approvalUrl) {
        throw new Error("PayPal approval link was not returned.");
      }

      window.location.href = data.approvalUrl;

    } catch (err) {
      setError(err.message);
      setPayingId("");
    }
  };

  const completed = payments.filter(
    (payment) => payment.status === "Completed"
  );

  const totalPaid = completed.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  const outstandingInvoices = invoices.filter(
    (invoice) => invoice.status !== "Paid"
  );

  const overdueInvoices = outstandingInvoices.filter(
    (invoice) =>
      invoice.dueDate && new Date(invoice.dueDate) < new Date()
  );

  const filteredPayments = payments.filter((payment) => {
    const query = search.toLowerCase();

    return (
      payment.customer?.name?.toLowerCase().includes(query) ||
      payment.invoice?.invoiceNumber?.toLowerCase().includes(query) ||
      payment.status?.toLowerCase().includes(query) ||
      payment.paypalOrderId?.toLowerCase().includes(query)
    );
  });

  const getInvoiceStatus = (invoice) => {
    if (invoice.status === "Paid") return "Paid";

    if (invoice.dueDate && new Date(invoice.dueDate) < new Date()) {
      return "Overdue";
    }

    return invoice.status || "Pending";
  };

  const statusStyle = (status) => {
    if (status === "Completed" || status === "Paid") {
      return "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
    }

    if (status === "Overdue" || status === "Failed") {
      return "bg-red-50 text-red-700 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
    }

    return "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
  };

  const stats = [
    {
      label: "Total transactions",
      value: payments.length,
      note: "All payment attempts",
      icon: Receipt,
      iconStyle: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    },
    {
      label: "Successful payments",
      value: completed.length,
      note: "Successfully captured",
      icon: CheckCircle2,
      iconStyle: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    },
    {
      label: "Total collected",
      value: formatCurrency(totalPaid),
      note: "Confirmed revenue",
      icon: Wallet,
      iconStyle: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Payments
          </h1>

          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Track transactions, monitor collections and manage payments.
          </p>
        </div>

        <button
          onClick={() => fetchData(true)}
          disabled={refreshing || loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-[#151c2e] dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          <AlertCircle size={18} />
          <p className="flex-1">{error}</p>
          <button onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151c2e]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </p>

                  <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {stat.value}
                  </h2>
                </div>

                <div className={`rounded-xl p-3 ${stat.iconStyle}`}>
                  <Icon size={21} />
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-400">{stat.note}</p>
            </div>
          );
        })}
      </div>

      <section className={cardClass}>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">
              Outstanding invoices
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Invoices waiting for payment.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
              {outstandingInvoices.length} Pending
            </span>

            {overdueInvoices.length > 0 && (
              <span className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-400">
                {overdueInvoices.length} Overdue
              </span>
            )}
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {loading ? (
            <div className="py-8 text-center text-sm text-slate-400">
              Loading invoices...
            </div>
          ) : outstandingInvoices.length === 0 ? (
            <div className="py-10 text-center">
              <CheckCircle2 size={34} className="mx-auto mb-3 text-emerald-500" />

              <p className="font-semibold text-slate-800 dark:text-white">
                All caught up!
              </p>

              <p className="mt-1 text-sm text-slate-400">
                There are no outstanding invoices.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {outstandingInvoices.map((invoice) => {
                const invoiceStatus = getInvoiceStatus(invoice);

                return (
                  <div
                    key={invoice._id}
                    className="rounded-xl border border-slate-200 p-5 transition hover:border-indigo-200 hover:shadow-md dark:border-slate-700 dark:hover:border-indigo-500/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Invoice
                        </p>

                        <h3 className="mt-1 truncate font-bold text-slate-900 dark:text-white">
                          {invoice.invoiceNumber}
                        </h3>
                      </div>

                      <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyle(invoiceStatus)}`}>
                        {invoiceStatus}
                      </span>
                    </div>

                    <div className="mt-5">
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {invoice.customer?.name || "Unknown customer"}
                      </p>

                      <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                        {invoice.description}
                      </p>

                      <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {formatCurrency(invoice.amount)}
                      </h2>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-700">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <CalendarDays size={14} />
                        Due {formatDate(invoice.dueDate)}
                      </div>

                      <button
                        onClick={() => handlePayNow(invoice._id)}
                        disabled={!!payingId}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
                      >
                        <CreditCard size={14} />
                        {payingId === invoice._id ? "Redirecting..." : "Pay with PayPal"}
                        <ExternalLink size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className={cardClass}>
        <div className="border-b border-slate-100 p-5 dark:border-slate-800 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">
                Transaction history
              </h2>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                A complete record of your payment activity.
              </p>
            </div>

            <span className="text-xs font-medium text-slate-400">
              {filteredPayments.length} transactions
            </span>
          </div>

          <div className="relative mt-5 max-w-4xl">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer, invoice, status..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-[#0d1425] dark:text-slate-100"
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <RefreshCw size={22} className="mx-auto animate-spin text-indigo-500" />
            <p className="mt-3 text-sm text-slate-400">
              Loading transactions...
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-175 text-left">
              <thead className="bg-slate-50/80 dark:bg-[#111827]">
                <tr className="text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Invoice</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment._id}
                    className="border-t border-slate-100 transition hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                          {(payment.customer?.name || "U").charAt(0).toUpperCase()}
                        </div>

                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          {payment.customer?.name || "Unknown"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {payment.invoice?.invoiceNumber || "—"}
                    </td>

                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                      {formatCurrency(payment.amount)}
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {formatDate(payment.createdAt)}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusStyle(payment.status)}`}>
                        {payment.status === "Completed" ? (
                          <CheckCircle2 size={13} />
                        ) : payment.status === "Created" ? (
                          <Clock3 size={13} />
                        ) : (
                          <AlertCircle size={13} />
                        )}

                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <Search size={27} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />

                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        No transactions found
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Try another search term.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/70 px-6 py-4 text-xs text-slate-400 dark:border-slate-800 dark:bg-[#111827]">
          <ArrowUpRight size={14} />
          Only completed transactions are included in total collected.
        </div>
      </section>
    </div>
  );
}
