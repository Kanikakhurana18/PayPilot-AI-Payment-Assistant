import { useEffect, useState } from "react";
import {
  Plus, Search, X, FileText, CheckCircle2,
  Clock3, AlertCircle, CalendarDays, Receipt
} from "lucide-react";

const API_URL = "http://localhost:8000/api";

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

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    customerId: "",
    description: "",
    amount: "",
    dueDate: "",
  });

  const fetchData = async () => {
    try {
      const [invoiceRes, customerRes] = await Promise.all([
        fetch(`${API_URL}/invoices`, {
          headers: getAuthHeaders(),
        }),
        fetch(`${API_URL}/customers`, {
          headers: getAuthHeaders(),
        }),
      ]);

      if (!invoiceRes.ok || !customerRes.ok) {
        const failedResponse = !invoiceRes.ok ? invoiceRes : customerRes;
        let message = "Could not load invoice data.";

        try {
          const errorData = await failedResponse.json();
          message = errorData.message || message;
        } catch {
          // Keep default error message
        }

        throw new Error(message);
      }

      const invoiceData = await invoiceRes.json();
      const customerData = await customerRes.json();

      setInvoices(invoiceData.invoices || []);
      setCustomers(customerData.customers || []);
    } catch (err) {
      setError(err.message || "Could not load invoice data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !form.customerId ||
      !form.description.trim() ||
      !form.amount ||
      Number(form.amount) <= 0 ||
      !form.dueDate
    ) {
      setError("Please fill in all fields with valid values.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/invoices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not create invoice.");
      }

      setSuccess("Invoice created successfully!");

      setForm({
        customerId: "",
        description: "",
        amount: "",
        dueDate: "",
      });

      setShowForm(false);
      await fetchData();
    } catch (err) {
      setError(err.message || "Could not create invoice.");
    } finally {
      setSaving(false);
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const query = search.toLowerCase();
    const customerName = invoice.customer?.name || "";

    return (
      invoice.invoiceNumber?.toLowerCase().includes(query) ||
      customerName.toLowerCase().includes(query) ||
      invoice.description?.toLowerCase().includes(query) ||
      invoice.status?.toLowerCase().includes(query)
    );
  });

  const paidCount = invoices.filter(
    (i) => i.status === "Paid"
  ).length;

  const pendingCount = invoices.filter(
    (i) => i.status === "Pending"
  ).length;

  const overdueCount = invoices.filter((i) => {
    return (
      i.status !== "Paid" &&
      i.dueDate &&
      new Date(i.dueDate) < new Date()
    );
  }).length;

  const getStatus = (invoice) => {
    if (invoice.status === "Paid") return "Paid";

    if (invoice.dueDate && new Date(invoice.dueDate) < new Date()) {
      return "Overdue";
    }

    return invoice.status || "Pending";
  };

  const statusStyle = (status) => {
    if (status === "Paid") {
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";
    }

    if (status === "Overdue") {
      return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400";
    }

    return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-[#0d1425] dark:text-slate-100 dark:focus:border-indigo-500";

  return (
    <div className="space-y-6 pb-8">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Invoices
          </h1>

          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Create, track and manage your customer invoices.
          </p>
        </div>

        <button
          onClick={() => {
            setError("");
            setSuccess("");
            setShowForm(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700"
        >
          <Plus size={17} />
          Create Invoice
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
          <AlertCircle size={18} />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
          <CheckCircle2 size={18} />
          {success}
          <button
            className="ml-auto"
            onClick={() => setSuccess("")}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total invoices",
            value: invoices.length,
            icon: Receipt,
            color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
          },
          {
            label: "Paid invoices",
            value: paidCount,
            icon: CheckCircle2,
            color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
          },
          {
            label: "Pending invoices",
            value: pendingCount,
            icon: Clock3,
            color: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
          },
          {
            label: "Overdue invoices",
            value: overdueCount,
            icon: AlertCircle,
            color: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-[#151c2e]"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {item.label}
                </p>

                <div className={`rounded-xl p-2.5 ${item.color}`}>
                  <Icon size={19} />
                </div>
              </div>

              <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {item.value}
              </h2>
            </div>
          );
        })}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-[#151c2e]">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">
              All invoices
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              View and monitor your billing activity.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoices..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-[#0d1425] dark:text-slate-100"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-14 text-center text-sm text-slate-400">
            Loading invoices...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-175 text-left">
              <thead className="bg-slate-50/80 dark:bg-[#111827]">
                <tr className="text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4 font-semibold">Invoice</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Due date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredInvoices.map((invoice) => {
                  const status = getStatus(invoice);

                  return (
                    <tr
                      key={invoice._id}
                      className="border-t border-slate-100 transition hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {invoice.invoiceNumber}
                        </p>

                        <p className="mt-1 max-w-50 truncate text-xs text-slate-400">
                          {invoice.description}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        {invoice.customer?.name || "Unknown"}
                      </td>

                      <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                        {formatCurrency(invoice.amount)}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays size={14} />
                          {formatDate(invoice.dueDate)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyle(status)}`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-14 text-center">
                      <FileText
                        size={28}
                        className="mx-auto mb-2 text-slate-300 dark:text-slate-600"
                      />

                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        No invoices found
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Try a different search or create a new invoice.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowForm(false);
          }}
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-[#151c2e]">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">
                  New billing entry
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  Create invoice
                </h2>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Customer
                </label>

                <select
                  name="customerId"
                  value={form.customerId}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="">Select a customer</option>

                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name} — {customer.email}
                    </option>
                  ))}
                </select>

                {customers.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                    No customers found. Add a customer first.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Description
                </label>

                <input
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="e.g. Website Development"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Amount (USD)
                </label>

                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  placeholder="Enter amount"
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Due date
                </label>

                <input
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className={inputClass}
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || customers.length === 0}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
