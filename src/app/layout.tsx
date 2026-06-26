import { useState } from "react";
import Sidebar from "../components/layout/SideBar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-950">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Đóng menu"
          className="fixed inset-0 z-30 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />

      <div
        className={[
          "min-h-dvh transition-[padding] duration-300 ease-in-out",
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-72",
        ].join(" ")}
      >
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100"
          >
            <span className="text-xl">☰</span>
            <span className="sr-only">Mở menu</span>
          </button>

          <div className="text-base font-bold text-slate-900">Dashboard</div>

          <div className="h-10 w-10" />
        </header>

        <main className="min-h-dvh overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}