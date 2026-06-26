import { useState } from "react";
import Sidebar from "../components/layout/SideBar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-gray-900 shadow-sm ring-1 ring-black/5 transition hover:bg-gray-100"
          >
            <span className="text-lg">☰</span>
            <span className="sr-only">Mở menu</span>
          </button>
          <div className="text-base font-semibold">Dashboard</div>
        </div>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
