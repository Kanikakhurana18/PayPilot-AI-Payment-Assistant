import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Users, UserPlus, Search, Mail, Phone, Building2, MapPin,
  X, RefreshCw, AlertCircle, Pencil, Trash2
} from "lucide-react";

const API_URL = "http://localhost:8000/api";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  businessName: "",
  address: "",
};

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API_URL}/customers`);
      setCustomers(res.data.customers || res.data);
    } catch {
      setError("Unable to load customers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = search.toLowerCase();

    return customers.filter((customer) =>
      [
        customer.name,
        customer.email,
        customer.phone,
        customer.businessName,
        customer.address,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [customers, search]);

  const openAddModal = () => {
    setEditingCustomer(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setForm({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      businessName: customer.businessName || "",
      address: customer.address || "",
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (editingCustomer) {
        await axios.put(
          `${API_URL}/customers/${editingCustomer._id}`,
          form
        );
      } else {
        await axios.post(`${API_URL}/customers`, form);
      }

      setShowModal(false);
      setEditingCustomer(null);
      setForm(emptyForm);
      await fetchCustomers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to save customer. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (customer) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${customer.name}?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(customer._id);
      setError("");

      await axios.delete(`${API_URL}/customers/${customer._id}`);

      setCustomers((prev) =>
        prev.filter((item) => item._id !== customer._id)
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to delete customer."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-[#111827] dark:text-white";

  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Customers
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your customers and their business information.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <UserPlus size={18} />
          Add Customer
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151c2e]">
          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            <Users size={23} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total Customers
            </p>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {customers.length}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#151c2e]">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <Building2 size={23} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Business Customers
            </p>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {customers.filter((c) => c.businessName).length}
            </h2>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#151c2e]">

        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              All Customers
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {filteredCustomers.length} customers found
            </p>
          </div>

          <div className="flex gap-2">
            <div className="relative w-full sm:w-80">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customers..."
                className={`${inputClass} pl-10`}
              />
            </div>

            <button
              onClick={fetchCustomers}
              className="rounded-xl border border-slate-200 px-3 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              title="Refresh"
            >
              <RefreshCw size={17} />
            </button>
          </div>
        </div>

        {error && !showModal && (
          <div className="m-5 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
            <AlertCircle size={17} />
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Loading customers...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto mb-3 text-slate-300" size={36} />
            <p className="font-medium text-slate-700 dark:text-slate-200">
              No customers found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Add a customer or try another search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-225 text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-[#111827] dark:text-slate-400">
                <tr>
                  <th className="px-5 py-4 font-semibold">Customer</th>
                  <th className="px-5 py-4 font-semibold">Business</th>
                  <th className="px-5 py-4 font-semibold">Phone</th>
                  <th className="px-5 py-4 font-semibold">Address</th>
                  <th className="px-5 py-4 font-semibold">Added On</th>
                  <th className="px-5 py-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                          {customer.name?.charAt(0)?.toUpperCase() || "C"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-white">
                            {customer.name}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <Mail size={12} />
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                      {customer.businessName || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <Phone size={14} />
                        {customer.phone || "—"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <MapPin size={14} />
                        {customer.address || "—"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {customer.createdAt
                        ? new Date(customer.createdAt).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(customer)}
                          className="rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                          title="Edit customer"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() => handleDelete(customer)}
                          disabled={deletingId === customer._id}
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-500/10"
                          title="Delete customer"
                        >
                          {deletingId === customer._id
                            ? <RefreshCw size={17} className="animate-spin" />
                            : <Trash2 size={17} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!saving) setShowModal(false);
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#151c2e]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingCustomer ? "Edit Customer" : "Add New Customer"}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {editingCustomer
                    ? "Update customer information."
                    : "Enter the customer details below."}
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { name: "name", label: "Full Name", placeholder: "Enter customer name", required: true },
                { name: "email", label: "Email Address", placeholder: "Enter email", required: true, type: "email" },
                { name: "phone", label: "Phone Number", placeholder: "Enter phone number" },
                { name: "businessName", label: "Business Name", placeholder: "Enter business name" },
                { name: "address", label: "Address", placeholder: "Enter address" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    {field.label}
                  </label>
                  <input
                    type={field.type || "text"}
                    required={field.required}
                    value={form[field.name]}
                    onChange={(e) =>
                      setForm({ ...form, [field.name]: e.target.value })
                    }
                    placeholder={field.placeholder}
                    className={inputClass}
                  />
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingCustomer
                      ? "Update Customer"
                      : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
