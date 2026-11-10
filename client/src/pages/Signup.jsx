import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Send,
  ArrowRight,
  LoaderCircle,
  User,
  Building2,
  Mail,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signup(formData);
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to create your account."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7fc] flex items-center justify-center px-4 py-8 sm:px-6">

      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">

        <div className="hidden md:flex flex-col justify-between bg-[#faf9ff] p-10 lg:p-12 border-r border-gray-100">

          <div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-500/20">
                <Send size={21} />
              </div>

              <span className="text-2xl font-bold tracking-tight text-gray-900">
                PayPilot
              </span>
            </div>

            <div className="mt-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 border border-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-600">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-600" />
                YOUR BUSINESS, SIMPLIFIED
              </span>

              <h1 className="mt-6 text-2xl lg:text-[42px] font-bold leading-tight tracking-tight text-gray-900">
                Smarter payments.
                <span className="block text-violet-600">
                  Stronger business.
                </span>
              </h1>

              <p className="mt-5 max-w-sm text-sm leading-7 text-gray-500">
                Create your PayPilot account and bring your invoices,
                payments and business insights together.
              </p>
            </div>

            <div className="mt-12 space-y-4">
              {[
                "Organize all your invoices",
                "Keep track of incoming payments",
                "Make smarter decisions with AI",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                    <ShieldCheck size={15} />
                  </div>
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-400">
            © 2026 PayPilot. Your AI-powered payment assistant.
          </p>
        </div>

        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">

          <div className="flex items-center gap-3 mb-8 md:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md shadow-violet-500/20">
              <Send size={20} />
            </div>
            <span className="text-xl font-bold text-gray-900">
              PayPilot
            </span>
          </div>

          <div className="mb-7">
            <p className="text-sm font-semibold text-violet-600 mb-3">
              GET STARTED
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Create your account
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Set up your business workspace to get started.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Full Name
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Business Name
              </label>

              <div className="relative">
                <Building2
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  placeholder="Enter your business name"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-12 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-violet-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle size={19} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-violet-600 transition hover:text-violet-700"
            >
              Sign in
            </Link>
          </p>

          <div className="mt-7 flex items-center justify-center gap-2 text-xs text-gray-400">
            <ShieldCheck size={15} />
            Your business workspace starts here
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
