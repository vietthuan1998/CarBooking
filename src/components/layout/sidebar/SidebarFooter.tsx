import { LogOut } from "lucide-react";

interface Props {
  isCollapsed: boolean;
  fullName: string;
  role: string;
  avatarText: string;
  onLogout: () => void;
}

export function SidebarFooter({
  isCollapsed,
  fullName,
  role,
  avatarText,
  onLogout,
}: Props) {
  return (
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
                onClick={onLogout}
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
  );
}
