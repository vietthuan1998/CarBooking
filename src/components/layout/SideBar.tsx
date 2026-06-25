import { signOut } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: "📊" },
  { name: "Booking", path: "/bookings", icon: "📅" },
  { name: "Điều phối", path: "/dispatch", icon: "🔀" },
  { name: "Quản lý xe", path: "/vehicles", icon: "🚐" },
  { name: "Quản lý tài xế", path: "/drivers", icon: "👨‍✈️" },
  { name: "Khách hàng", path: "/customers", icon: "👥" },
  { name: "Đăng ký", path: "/signup", icon: "✍️" },
];

export default function Sidebar() {
  const { profile } = useAuthStore();
  console.log("    profile,", profile);
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    const { error } = await signOut();

    if (error) {
      console.error(error);
    }
    navigate("/login", { replace: true });
  };

  return (
    <aside
      className={`sticky top-0 h-screen shrink-0 bg-gradient-to-b from-[#06161A] via-[#0A242A] to-[#061216] text-white shadow-[8px_0_30px_rgba(0,0,0,0.2)] transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-72"
      }`}
    >
      <div className="relative flex h-full flex-col">
        {/* Button hide/show */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-7 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#0B252C] text-xs text-white shadow-lg transition hover:bg-emerald-500"
          title={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
        >
          {isCollapsed ? "›" : "‹"}
        </button>

        {/* Logo */}
        <div className={isCollapsed ? "px-3 pt-6 pb-4" : "px-5 pt-6 pb-4"}>
          <div
            className={`rounded-2xl border border-white/10 bg-white/[0.04] shadow-lg transition-all duration-300 ${
              isCollapsed ? "p-3" : "p-4"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 text-lg font-black text-white shadow-lg shadow-green-500/30">
                L
              </div>

              {!isCollapsed && (
                <div className="min-w-0">
                  <h1 className="text-xl font-black tracking-wide">
                    <span className="text-emerald-400">LIMO</span>
                    <span className="text-white">GREEN</span>
                  </h1>
                  <p className="mt-0.5 text-xs font-medium tracking-wide text-gray-400">
                    Booking Manager
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {!isCollapsed && (
            <div className="mb-3 px-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-500">
                Main Menu
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                title={isCollapsed ? item.name : undefined}
                className={({ isActive }) =>
                  [
                    "group relative flex items-center rounded-2xl text-sm font-semibold transition-all duration-200",
                    isCollapsed
                      ? "justify-center px-2 py-3"
                      : "gap-3 px-4 py-3.5",
                    isActive
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25"
                      : "text-gray-300 hover:bg-white/[0.08] hover:text-white",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && !isCollapsed && (
                      <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-white" />
                    )}

                    <span
                      className={[
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg transition-all duration-200",
                        isActive
                          ? "bg-white/20"
                          : "bg-white/[0.06] group-hover:bg-white/10",
                      ].join(" ")}
                    >
                      {item.icon}
                    </span>

                    {!isCollapsed && (
                      <>
                        <span className="flex-1 whitespace-nowrap">
                          {item.name}
                        </span>

                        <span
                          className={[
                            "text-lg transition-all duration-200",
                            isActive
                              ? "translate-x-0 opacity-100"
                              : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
                          ].join(" ")}
                        >
                          ›
                        </span>
                      </>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom section */}
        <div className={isCollapsed ? "px-3 pb-5" : "px-4 pb-5"}>
          {!isCollapsed && (
            <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
              <p className="text-xs font-semibold text-emerald-300">
                Trạng thái hệ thống
              </p>

              <div className="mt-2 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                <p className="text-sm font-medium text-gray-200">
                  Đang hoạt động
                </p>
              </div>
            </div>
          )}

          {/* User Info */}
          <div
            className={`rounded-2xl border border-white/10 bg-white/[0.05] ${
              isCollapsed ? "p-2" : "p-3"
            }`}
          >
            <div
              className={`flex items-center ${
                isCollapsed ? "justify-center" : "gap-3"
              }`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-600 text-sm font-bold text-white shadow-md shadow-green-500/20">
                A
              </div>

              {!isCollapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">
                      {profile?.full_name}
                    </p>
                    <p className="truncate text-xs font-medium text-gray-400">
                      {profile?.role}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLogout()}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-gray-300 transition hover:bg-red-500/20 hover:text-red-300"
                    title="Đăng xuất"
                  >
                    ⎋
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
