import { KeyRound } from "lucide-react";
import type { Profile } from "../../services/accountService";
import { DEFAULT_RESET_PASSWORDS } from "../../utils/constants";
import { displayName } from "../../utils/helpers";

interface Props {
  account: Profile;
  saving: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ResetPasswordModal({
  account,
  saving,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="max-h-full w-full max-w-sm overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
            <KeyRound size={22} className="text-amber-600" />
          </div>
          <h2 className="mb-1 text-lg font-semibold text-slate-900">
            Đặt lại mật khẩu?
          </h2>
          <p className="text-sm text-slate-500">
            Mật khẩu của{" "}
            <span className="font-semibold text-slate-800">
              {displayName(account.full_name)}
            </span>{" "}
            sẽ được đặt lại về{" "}
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono font-semibold text-slate-800">
              {DEFAULT_RESET_PASSWORDS[account.role]}
            </span>
            . Hãy nhắc người dùng đổi mật khẩu sau khi đăng nhập lại.
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
            className="rounded-xl bg-amber-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-60"
          >
            {saving ? "Đang xử lý..." : "Đặt lại mật khẩu"}
          </button>
        </div>
      </div>
    </div>
  );
}
