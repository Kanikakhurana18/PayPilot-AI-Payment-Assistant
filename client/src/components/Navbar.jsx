import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User,
  Settings,
  CheckCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  RefreshCw,
  FileText,
  Menu,
  LogOut,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:8000/api";

function Navbar({ darkMode, toggleTheme, onMenuClick }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState([]);
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setShowProfile(false);
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfile(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);

      const [reminderRes, paymentRes] = await Promise.all([
        axios.get(`${API}/ai/reminders`),
        axios.get(`${API}/payments`),
      ]);

      const reminders = reminderRes.data?.reminders || [];
      const payments =
        paymentRes.data?.payments || paymentRes.data || [];

      const reminderNotifications = reminders.map((item) => ({
        id: `invoice-${item.invoiceId}`,
        title:
          item.priority === "Overdue"
            ? "Payment overdue"
            : item.priority === "Urgent"
              ? "Payment due soon"
              : "Upcoming payment",
        description: `${item.invoiceNumber} • $${Number(
          item.amount
        ).toLocaleString("en-US")} • ${item.customer}`,
        type: item.priority,
        path: "/invoices",
        date: item.dueDate,
      }));

      const paymentNotifications = payments
        .filter((item) => item.status === "Completed")
        .slice(0, 5)
        .map((item) => ({
          id: `payment-${item._id}`,
          title: "Payment received",
          description: `${item.invoice?.invoiceNumber || "Invoice"} • $${Number(
            item.amount
          ).toLocaleString("en-US")}`,
          type: "Success",
          path: "/payments",
          date: item.createdAt,
        }));

      const allNotifications = [
        ...reminderNotifications,
        ...paymentNotifications,
      ]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 8);

      setNotifications(allNotifications);

      setReadNotificationIds((previous) =>
        previous.filter((id) =>
          allNotifications.some((item) => item.id === id)
        )
      );
    } catch (error) {
      console.error("Notifications fetch error:", error);
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(
    (item) => !readNotificationIds.includes(item.id)
  ).length;

  const markAllAsRead = () => {
    setReadNotificationIds(notifications.map((item) => item.id));
  };

  const openNotification = (item) => {
    setReadNotificationIds((previous) =>
      previous.includes(item.id)
        ? previous
        : [...previous, item.id]
    );

    setShowNotifications(false);
    navigate(item.path);
  };

  const getNotificationStyle = (type) => {
    if (type === "Overdue") {
      return {
        icon: AlertCircle,
        color: "text-red-500",
        background: "bg-red-50 dark:bg-red-500/10",
      };
    }

    if (type === "Urgent") {
      return {
        icon: Clock,
        color: "text-orange-500",
        background: "bg-orange-50 dark:bg-orange-500/10",
      };
    }

    if (type === "Success") {
      return {
        icon: CheckCircle2,
        color: "text-emerald-500",
        background: "bg-emerald-50 dark:bg-emerald-500/10",
      };
    }

    return {
      icon: FileText,
      color: "text-indigo-500",
      background: "bg-indigo-50 dark:bg-indigo-500/10",
    };
  };

  const handleSearch = async (value) => {
    setSearchQuery(value);

    if (value.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);

      const [invoiceRes, customerRes, paymentRes] = await Promise.all([
        axios.get(`${API}/invoices`),
        axios.get(`${API}/customers`),
        axios.get(`${API}/payments`),
      ]);

      const query = value.toLowerCase();

      const invoices = (invoiceRes.data.invoices || invoiceRes.data)
        .filter((item) =>
          `${item.invoiceNumber} ${item.description} ${item.status} ${
            item.customer?.name || ""
          }`
            .toLowerCase()
            .includes(query)
        )
        .map((item) => ({
          title: item.invoiceNumber,
          subtitle: `${item.description} • ${
            item.customer?.name || "Customer"
          }`,
          type: "Invoice",
          path: "/invoices",
        }));

      const customers = (customerRes.data.customers || customerRes.data)
        .filter((item) =>
          `${item.name} ${item.email} ${item.businessName || ""}`
            .toLowerCase()
            .includes(query)
        )
        .map((item) => ({
          title: item.name,
          subtitle: item.email,
          type: "Customer",
          path: "/customers",
        }));

      const payments = (paymentRes.data.payments || paymentRes.data)
        .filter((item) =>
          `${item.status} ${item.paypalOrderId || ""} ${
            item.invoice?.invoiceNumber || ""
          }`
            .toLowerCase()
            .includes(query)
        )
        .map((item) => ({
          title: item.paypalOrderId || "Payment",
          subtitle: `${item.status} • $${item.amount}`,
          type: "Payment",
          path: "/payments",
        }));

      setSearchResults(
        [...invoices, ...customers, ...payments].slice(0, 8)
      );
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const getInitial = () =>
    user?.name?.charAt(0)?.toUpperCase() || "K";

  return (
    <header className="relative z-40 flex min-h-16 flex-wrap items-center justify-between gap-3 bg-transparent px-3 py-3 sm:h-20 sm:flex-nowrap sm:px-5 sm:py-0 xl:px-8">

      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        className="order-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-slate-700 dark:bg-[#151c2e] dark:text-white lg:hidden"
      >
        <Menu size={20} />
      </button>

      <div
        ref={searchRef}
        className="relative order-3 w-full max-w-none sm:order-0 sm:flex-1 sm:max-w-6xl"
      >
        <div className="flex items-center gap-3 bg-white dark:bg-[#151c2e] border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20">
          <Search size={19} className="text-slate-400 shrink-0" />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search invoices, payments, customers..."
            className="bg-transparent outline-none text-sm w-full text-slate-800 dark:text-white placeholder:text-slate-400"
          />

          {searchLoading && (
            <span className="text-xs text-slate-400">Searching...</span>
          )}

          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
              }}
              className="text-xs text-slate-400 hover:text-indigo-500"
            >
              Clear
            </button>
          )}
        </div>

        {searchQuery.trim().length >= 2 && (
          <div className="absolute top-14 left-0 w-full bg-white dark:bg-[#151c2e] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden">
            {searchResults.length > 0 ? (
              searchResults.map((result, index) => (
                <button
                  key={`${result.type}-${index}`}
                  onClick={() => {
                    navigate(result.path);
                    setSearchQuery("");
                    setSearchResults([]);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-indigo-50 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0"
                >
                  <div className="flex justify-between items-center gap-3">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">
                      {result.title}
                    </p>
                    <span className="text-[10px] text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-full">
                      {result.type}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1">
                    {result.subtitle}
                  </p>
                </button>
              ))
            ) : (
              <p className="text-sm text-slate-400 text-center p-5">
                {searchLoading
                  ? "Searching..."
                  : "No matching results found"}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="order-2 ml-auto flex shrink-0 items-center gap-2 sm:order-0 sm:ml-0 sm:gap-3">

        <div className="flex items-center p-1 rounded-full bg-amber-100/60 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
          <button
            onClick={() => darkMode && toggleTheme()}
            aria-label="Switch to light mode"
            className={`p-2 rounded-full transition ${
              !darkMode
                ? "bg-white text-amber-500 shadow-sm"
                : "text-slate-400"
            }`}
          >
            <Sun size={16} />
          </button>

          <button
            onClick={() => !darkMode && toggleTheme()}
            aria-label="Switch to dark mode"
            className={`p-2 rounded-full transition ${
              darkMode
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400"
            }`}
          >
            <Moon size={16} />
          </button>
        </div>

        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            aria-label="Notifications"
            className="relative p-3 rounded-2xl bg-white dark:bg-[#151c2e] border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-sm hover:border-indigo-300 transition"
          >
            <Bell size={19} />

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-[#151c2e]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-14 w-85 max-w-[calc(100vw-2rem)] bg-white dark:bg-[#151c2e] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 overflow-hidden">

              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
                <div>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                    Notifications
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {unreadCount} unread updates
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchNotifications}
                    title="Refresh notifications"
                    className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <RefreshCw
                      size={15}
                      className={notificationsLoading ? "animate-spin" : ""}
                    />
                  </button>

                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      title="Mark all as read"
                      className="p-2 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                    >
                      <CheckCheck size={17} />
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-90 overflow-y-auto">
                {notificationsLoading ? (
                  <div className="p-8 text-center">
                    <RefreshCw
                      size={22}
                      className="animate-spin text-indigo-500 mx-auto mb-3"
                    />
                    <p className="text-sm text-slate-400">
                      Loading notifications...
                    </p>
                  </div>
                ) : notifications.length > 0 ? (
                  notifications.map((item) => {
                    const style = getNotificationStyle(item.type);
                    const Icon = style.icon;
                    const isRead = readNotificationIds.includes(item.id);

                    return (
                      <button
                        key={item.id}
                        onClick={() => openNotification(item)}
                        className={`w-full flex gap-3 text-left p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 transition hover:bg-slate-50 dark:hover:bg-slate-800/70 ${
                          !isRead
                            ? "bg-indigo-50/40 dark:bg-indigo-500/5"
                            : ""
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.background}`}
                        >
                          <Icon size={18} className={style.color} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold text-slate-800 dark:text-white">
                              {item.title}
                            </p>

                            {!isRead && (
                              <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                            )}
                          </div>

                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 wrap-break-word">
                            {item.description}
                          </p>

                          <p className="text-[10px] text-slate-400 mt-2">
                            {item.date
                              ? new Date(item.date).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "Recent update"}
                          </p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="p-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mx-auto mb-3">
                      <Bell size={21} className="text-indigo-500" />
                    </div>

                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      You're all caught up!
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      New payment updates will appear here.
                    </p>
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-slate-100 dark:border-slate-700 text-center">
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    navigate("/invoices");
                  }}
                  className="text-xs font-semibold text-indigo-500 hover:text-indigo-600"
                >
                  View all invoices →
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 sm:gap-3 p-1.5 sm:pl-2 bg-white dark:bg-[#151c2e] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm hover:border-indigo-300 transition"
          >
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-sm">
              {getInitial()}
            </div>

            <div className="hidden sm:block text-left">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                {user?.name || "Account"}
              </p>
              <p className="text-[11px] text-slate-400">
                {user?.businessName || "Workspace Owner"}
              </p>
            </div>

            <ChevronDown size={15} className="text-slate-400 mr-1" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-14 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-[#151c2e]">

              <div className="border-b border-slate-100 px-3 py-3 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {user?.name || "PayPilot Account"}
                </p>
                <p className="mt-1 truncate text-xs text-slate-400">
                  {user?.email || "Workspace Owner"}
                </p>
              </div>

              <Link
                to="/settings"
                onClick={() => setShowProfile(false)}
                className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <User size={17} />
                My Profile
              </Link>

              <Link
                to="/settings"
                onClick={() => setShowProfile(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Settings size={17} />
                Settings
              </Link>

              <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
