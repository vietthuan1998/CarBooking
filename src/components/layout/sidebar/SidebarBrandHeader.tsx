import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface Props {
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

export function SidebarBrandHeader({
  isCollapsed,
  onClose,
  onToggleCollapse,
}: Props) {
  return (
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
  );
}
