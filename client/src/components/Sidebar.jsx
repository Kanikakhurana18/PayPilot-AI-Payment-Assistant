import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Users,
  ChartNoAxesCombined,
  Bot,
  Settings,
  Send,
  Target,
} from "lucide-react";

const menuItems = [
  { name: "Overview", path: "/", icon: LayoutDashboard },
  { name: "Invoices", path: "/invoices", icon: FileText },
  { name: "Payments", path: "/payments", icon: CreditCard },
  { name: "Customers", path: "/customers", icon: Users },
  { name: "Analytics", path: "/analytics", icon: ChartNoAxesCombined },
  { name: "Payment Recovery", path: "/payment-recovery", icon: Target },
  { name: "AI Assistant", path: "/ai-assistant", icon: Bot },
];

function Sidebar({ onNavigate, collapsed = false, onToggle }) {
  const linkStyle = ({ isActive }) =>
    `flex items-center rounded-xl py-3 text-sm font-medium transition-all duration-200
    ${collapsed ? "justify-center px-0" : "gap-3.5 px-4"}
    ${
      isActive
        ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
        : "text-gray-500 hover:bg-violet-50 hover:text-violet-600 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-violet-400"
    }`;

  return (
    <aside
      className={`flex h-screen w-full flex-col overflow-hidden
      bg-white text-gray-800 dark:bg-[#11111b] dark:text-white
      ${collapsed ? "px-3" : "px-5"}`}
    >

      <div className="flex h-22 shrink-0 items-center">
        <button
          type="button"
          onClick={onToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`flex min-w-0 items-center rounded-xl transition-all
          hover:bg-violet-50 dark:hover:bg-white/5
          ${collapsed ? "h-12 w-full justify-center" : "w-full gap-3 p-2"}`}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-500/20">
            <Send size={20} />
          </div>

          {!collapsed && (
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              PayPilot
            </span>
          )}
        </button>
      </div>

      <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto py-3">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={onNavigate}
              title={collapsed ? item.name : ""}
              className={linkStyle}
            >
              <Icon size={20} className="shrink-0" />

              {!collapsed && (
                <span className="truncate">{item.name}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto shrink-0 border-t border-gray-200 py-4 dark:border-white/10">
        <NavLink
          to="/settings"
          onClick={onNavigate}
          title={collapsed ? "Settings" : ""}
          className={linkStyle}
        >
          <Settings size={20} className="shrink-0" />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        {!collapsed && (
          <p className="mt-4 text-center text-xs text-gray-400">
            PayPilot AI • Smart Payments
          </p>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;