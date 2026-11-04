
import React, { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function DashboardLayout({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("paypilot-theme") === "dark";
  });

  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem(
      "paypilot-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  // Prevent background scrolling when mobile sidebar is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-[#f7f7fc] font-sans text-slate-900 transition-colors duration-300 dark:bg-[#0b0e17]">

      {/* DESKTOP SIDEBAR */}
      <div
        className={`hidden shrink-0 transition-all duration-300 lg:sticky lg:top-0 lg:block lg:h-screen ${
          desktopSidebarOpen ? "w-64" : "w-24"
        }`}
      >
        <Sidebar
          collapsed={!desktopSidebarOpen}
          onToggle={() =>
            setDesktopSidebarOpen((prev) => !prev)
          }
        />
      </div>

      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* MOBILE SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-[70] w-[280px] max-w-[85vw] transform transition-transform duration-300 lg:hidden ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="relative h-full">
          <Sidebar
            onNavigate={() => setMobileMenuOpen(false)}
          />

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
            className="absolute right-3 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-white"
          >
            <X size={20} />
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">

        <Navbar
          darkMode={darkMode}
          toggleTheme={() => setDarkMode((prev) => !prev)}
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        <main className="min-w-0 flex-1 px-3 pt-2 sm:px-5 md:px-6 xl:px-8">
          {children}
        </main>

      </div>
    </div>
  );
}

export default DashboardLayout;
