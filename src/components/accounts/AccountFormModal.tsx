import type { Profile } from "../../services/accountService";

export interface AccountFormState {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  role: Profile["role"];
}

interface Props {
  mode: "add" | "edit";
  form: AccountFormState;
  onFormChange: (updater: (f: AccountFormState) => AccountFormState) => void;
  canEditRole: boolean;
  saving: boolean;
  formError: string | null;
  onCancel: () => void;
  onSave: () => void;
}

export function AccountFormModal({
  mode,
  form,
  onFormChange,
  canEditRole,
  saving,
  formError,
  onCancel,
  onSave,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {mode === "add" ? "Thêm tài khoản mới" : "Chỉnh sửa tài khoản"}
          </h2>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Nguyễn Văn A"
              value={form.full_name}
              onChange={(e) =>
                onFormChange((f) => ({ ...f, full_name: e.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Số điện thoại
            </label>
            <input
              type="text"
              placeholder="VD: 0901234567"
              value={form.phone}
              onChange={(e) =>
                onFormChange((f) => ({ ...f, phone: e.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {mode === "add" && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="VD: staff@example.com"
                  value={form.email}
                  onChange={(e) =>
                    onFormChange((f) => ({ ...f, email: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="Ít nhất 6 ký tự"
                  value={form.password}
                  onChange={(e) =>
                    onFormChange((f) => ({ ...f, password: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Vai trò
            </label>
            <select
              value={form.role}
              disabled={!canEditRole}
              onChange={(e) =>
                onFormChange((f) => ({
                  ...f,
                  role: e.target.value as Profile["role"],
                }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="driver">Tài xế</option>
            </select>
            {!canEditRole && (
              <p className="mt-1 text-xs text-slate-400">
                Bạn không thể tự đổi vai trò của chính mình.
              </p>
            )}
          </div>

          {formError && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
              {formError}
            </p>
          )}
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
            onClick={onSave}
            disabled={saving}
            className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving
              ? "Đang lưu..."
              : mode === "add"
                ? "Thêm tài khoản"
                : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}
