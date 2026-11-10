import { useState } from "react";
import {
  User,
  Building2,
  Palette,
  CreditCard,
  Database,
  Save,
  Sun,
  Moon,
  CheckCircle2,
  RefreshCw,
  ShieldCheck
} from "lucide-react";

function Settings({ darkMode, toggleTheme }) {
  const [profile, setProfile] = useState({
    name: "Workspace Owner",
    email: "",
    businessName: "My Business",
  });

  const [preferences, setPreferences] = useState({
    currency: "USD",
    timezone: "Asia/Kolkata",
  });

  const [saved, setSaved] = useState(false);

  const updateProfile = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const updatePreference = (field, value) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const saveSettings = () => {
    localStorage.setItem("paypilot-profile", JSON.stringify(profile));
    localStorage.setItem(
      "paypilot-preferences",
      JSON.stringify(preferences)
    );

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const refreshData = () => {
    window.location.reload();
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#151c2e] text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400";

  const labelClass =
    "block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2";

  const sectionClass =
    "bg-white dark:bg-[#151c2e] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm";

  return (
    <div className="space-y-7 pb-10">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Settings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your account and workspace preferences.
          </p>
        </div>

        <button
          onClick={saveSettings}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 transition"
        >
          <Save size={17} />
          Save Changes
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm">
          <CheckCircle2 size={18} />
          Settings saved successfully!
        </div>
      )}

      <section className={sectionClass}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
            <User className="text-indigo-500" size={21} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Profile Information
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Manage your personal account details.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Full Name</label>
            <input
              value={profile.name}
              onChange={(e) => updateProfile("name", e.target.value)}
              className={inputClass}
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className={labelClass}>Email Address</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => updateProfile("email", e.target.value)}
              className={inputClass}
              placeholder="Enter your email"
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Business Name</label>
            <input
              value={profile.businessName}
              onChange={(e) =>
                updateProfile("businessName", e.target.value)
              }
              className={inputClass}
              placeholder="Enter your business name"
            />
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
            <Building2 className="text-violet-500" size={21} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Business Preferences
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Customize your workspace settings.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Default Currency</label>
            <select
              value={preferences.currency}
              onChange={(e) =>
                updatePreference("currency", e.target.value)
              }
              className={inputClass}
            >
              <option value="USD">USD - US Dollar ($)</option>
              <option value="INR">INR - Indian Rupee (₹)</option>
              <option value="EUR">EUR - Euro (€)</option>
              <option value="GBP">GBP - British Pound (£)</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Timezone</label>
            <select
              value={preferences.timezone}
              onChange={(e) =>
                updatePreference("timezone", e.target.value)
              }
              className={inputClass}
            >
              <option value="Asia/Kolkata">India (IST)</option>
              <option value="America/New_York">New York (EST)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Asia/Dubai">Dubai (GST)</option>
            </select>
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
            <Palette className="text-amber-500" size={21} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Appearance
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Choose your preferred dashboard theme.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => darkMode && toggleTheme()}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition ${
              !darkMode
                ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10"
                : "border-slate-200 dark:border-slate-700"
            }`}
          >
            <Sun className="text-amber-500" size={23} />
            <div className="text-left flex-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                Light Mode
              </p>
              <p className="text-xs text-slate-400">Clean and bright</p>
            </div>
            {!darkMode && (
              <CheckCircle2 size={18} className="text-indigo-500" />
            )}
          </button>

          <button
            onClick={() => !darkMode && toggleTheme()}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition ${
              darkMode
                ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10"
                : "border-slate-200 dark:border-slate-700"
            }`}
          >
            <Moon className="text-indigo-500" size={23} />
            <div className="text-left flex-1">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                Dark Mode
              </p>
              <p className="text-xs text-slate-400">Easy on the eyes</p>
            </div>
            {darkMode && (
              <CheckCircle2 size={18} className="text-indigo-500" />
            )}
          </button>
        </div>
      </section>

      <section className={sectionClass}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
            <CreditCard className="text-blue-500" size={21} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Payment Integration
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Payment gateway configuration.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center font-bold text-blue-600">
              P
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">
                PayPal Integration
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Sandbox environment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
            <CheckCircle2 size={17} />
            Configured
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-3">
          PayPal credentials are securely managed through server environment
          variables. They are not editable from this page.
        </p>
      </section>

      <section className={sectionClass}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
            <Database className="text-emerald-500" size={21} />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Data Management
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Manage your dashboard data.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">
              Refresh application
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Reload the application and fetch the latest information.
            </p>
          </div>

          <button
            onClick={refreshData}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw size={16} />
            Refresh Data
          </button>
        </div>
      </section>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
        <ShieldCheck className="text-indigo-500 shrink-0 mt-0.5" size={19} />
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-white">
            Your data is protected
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            PayPilot uses secure backend services for business data and
            payment processing. Never share your API credentials publicly.
          </p>
        </div>
      </div>

    </div>
  );
}

export default Settings;
