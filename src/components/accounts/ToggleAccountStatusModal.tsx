import { AlertTriangle, PowerOff } from "lucide-react";
import type { Profile } from "../../services/accountService";

interface Props {
  account: Profile;
  saving: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ToggleAccountStatusModal({
  account,
  saving,
  onCancel,
  onConfirm,
}: Props) {
  const activating = account.status !== "active";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl">
        <div className="p-6">
          <div
            className={[
              "mb-4 flex h-12 w-12 items-center justify-center rounded-2xl",
              activating ? "bg-emerald-50" : "bg-red-50",
            ].join(" ")}
          >
            {activating ? (
              <AlertTriangle size={22} className="text-emerald-600" />
            ) : (
              <PowerOff size={22} className="text-red-600" />
            )}
          </div>
          <h2 className="mb-1 text-lg font-semibold text-slate-900">
            {activating ? "Kích hoạt lại tài khoản?" : "Vô hiệu hóa tài khoản?"}
          </h2>
          <p className="text-sm text-slate-500">
            {activating ? (
              <>
                Tài khoản{" "}
                <span className="font-semibold text-slate-800">
                  {account.full_name}
                </span>{" "}
                sẽ có thể đăng nhập lại vào hệ thống.
              </>
            ) : (
              <>
                Tài khoản{" "}
                <span className="font-semibold text-slate-800">
                  {account.full_name}
                </span>{" "}
                sẽ không thể đăng nhập nữa. Dữ liệu liên quan (chuyến xe,
                lịch sử...) vẫn được giữ nguyên.
              </>
            )}
          </p>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={saving}
            className={[
              "rounded-xl px-5 py-2 text-sm font-medium text-white transition-colors disabled:opacity-60",
              activating
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-red-600 hover:bg-red-700",
            ].join(" ")}
          >
            {saving
              ? "Đang xử lý..."
              : activating
                ? "Kích hoạt"
                : "Vô hiệu hóa"}
          </button>
        </div>
      </div>
    </div>
  );
}
