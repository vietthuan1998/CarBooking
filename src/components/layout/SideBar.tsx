import { signOut } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import {
  CalendarDays,
  Car,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Map,
  Route,
  Settings,
  Shuffle,
  UserPlus,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

type MenuItem = {
  name: string;
  path: string;
  icon: LucideIcon;
};

const menuItems: MenuItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Booking", path: "/bookings", icon: CalendarDays },
  { name: "Điều phối", path: "/dispatch", icon: Shuffle },
  { name: "Quản lý xe", path: "/vehicles", icon: Car },
  { name: "Quản lý tài xế", path: "/drivers", icon: UserRound },
  { name: "Quản lý chuyến", path: "/trips", icon: Route },
  { name: "Khách hàng", path: "/customers", icon: Users },
  { name: "Đăng ký", path: "/signup", icon: UserPlus },
  { name: "Báo cáo", path: "/reports", icon: Map },
  { name: "Cài đặt", path: "/settings", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const { profile } = useAuthStore();
  const navigate = useNavigate();

  const fullName = profile?.full_name || "Điều phối viên";
  const role = profile?.role || "Admin";
  const avatarText = fullName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    const { error } = await signOut();

    if (error) {
      console.error(error);
      return;
    }

    navigate("/login", { replace: true });
  };

  return (
    <aside
      className={[
        "fixed left-0 top-0 z-40 flex h-dvh max-h-dvh flex-col overflow-hidden",
        "bg-[#06191D] text-white shadow-[12px_0_30px_rgba(15,23,42,0.22)]",
        "transition-all duration-300 ease-in-out",
        "w-72 max-w-[86vw]",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0",
        isCollapsed ? "lg:w-20" : "lg:w-72",
      ].join(" ")}
    >
      <div className="flex h-full min-h-0 flex-col">
        <div
          className={[
            "flex items-center border-b border-white/10",
            isCollapsed ? "justify-center px-3 py-5" : "justify-between px-5 py-5",
          ].join(" ")}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-lg font-black text-white shadow-lg shadow-emerald-500/30">
              L
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="truncate text-xl font-black tracking-wide">
                  <span className="text-emerald-400">LIMO</span>
                  <span className="text-white">GREEN</span>
                </h1>
                <p className="mt-0.5 truncate text-xs font-semibold tracking-[0.18em] text-emerald-300">
                  HUẾ - ĐÀ NẴNG
                </p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 lg:hidden"
              title="Đóng menu"
            >
              <X size={18} />
            </button>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            className="absolute -right-3 top-7 hidden h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#0B252C] text-white shadow-lg transition hover:bg-emerald-500 lg:flex"
            title={isCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {!isCollapsed && (
            <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Main Menu
            </p>
          )}

          <div className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  title={isCollapsed ? item.name : undefined}
                  onClick={onClose}
                  className={({ isActive }) =>
                    [
                      "group relative flex items-center rounded-2xl text-sm font-semibold transition-all duration-200",
                      isCollapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-3",
                      isActive
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                        : "text-slate-300 hover:bg-white/10 hover:text-white",
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
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-white/[0.06] text-slate-300 group-hover:bg-white/10 group-hover:text-white",
                        ].join(" ")}
                      >
                        <Icon size={18} />
                      </span>

                      {!isCollapsed && (
                        <>
                          <span className="flex-1 whitespace-nowrap">{item.name}</span>
                          <ChevronRight
                            size={16}
                            className={[
                              "transition-all duration-200",
                              isActive
                                ? "translate-x-0 opacity-100"
                                : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100",
                            ].join(" ")}
                          />
                        </>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className={isCollapsed ? "px-3 pb-4" : "px-4 pb-4"}>
          {!isCollapsed && (
            <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
              <p className="text-xs font-semibold text-emerald-300">
                Trạng thái hệ thống
              </p>

              <div className="mt-2 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                <p className="text-sm font-medium text-slate-200">
                  Đang hoạt động
                </p>
              </div>
            </div>
          )}

          <div
            className={[
              "rounded-2xl border border-white/10 bg-white/[0.06]",
              isCollapsed ? "p-2" : "p-3",
            ].join(" ")}
          >
            <div
              className={[
                "flex items-center",
                isCollapsed ? "justify-center" : "gap-3",
              ].join(" ")}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-600 text-sm font-bold text-white shadow-md shadow-emerald-500/20">
                {avatarText}
              </div>

              {!isCollapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">
                      {fullName}
                    </p>
                    <p className="truncate text-xs font-medium capitalize text-slate-400">
                      {role}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.06] text-slate-300 transition hover:bg-red-500/20 hover:text-red-300"
                    title="Đăng xuất"
                  >
                    <LogOut size={17} />
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