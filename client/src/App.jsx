import { Routes, Route, Navigate } from "react-router-dom";
import Invoices from "./pages/Invoices";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Payments from "./pages/Payments";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import Customers from "./pages/Customers";
import Analytics from "./pages/Analytics";
import AIAssistant from "./pages/AIAssistant";
import Settings from "./pages/Settings";

function PlaceholderPage({ title }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <p className="text-gray-500 mt-2">
        This section is being set up.
      </p>
    </div>
  );
}

function App() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/settings" element={<Settings/>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </DashboardLayout>
  );
}

export default App;