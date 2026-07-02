import { ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import { menuItems } from "./menuItems";

interface Props {
  isCollapsed: boolean;
  onNavigate: () => void;
}

export function SidebarNav({ isCollapsed, onNavigate }: Props) {
  return (
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
              onClick={onNavigate}
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
                      <span className="flex-1 whitespace-nowrap">
                        {item.name}
                      </span>
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
  );
}
