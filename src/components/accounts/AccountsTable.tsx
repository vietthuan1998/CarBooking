import {
  CheckCircle2,
  KeyRound,
  Pencil,
  Power,
  PowerOff,
  UserRound,
  XCircle,
} from "lucide-react";
import type { Profile } from "../../services/accountService";
import { displayName } from "../../utils/helpers";

const ROLE_BADGE: Record<Profile["role"], string> = {
  admin: "bg-purple-50 text-purple-700",
  staff: "bg-blue-50 text-blue-700",
  driver: "bg-amber-50 text-amber-700",
};

const ROLE_LABEL: Record<Profile["role"], string> = {
  admin: "Admin",
  staff: "Staff",
  driver: "Tài xế",
};

interface Props {
  accounts: Profile[];
  currentUserId: string | undefined;
  isPending: boolean;
  pageError: string | null;
  search: string;
  canEdit: (p: Profile) => boolean;
  canToggleStatus: (p: Profile) => boolean;
  canResetPassword: (p: Profile) => boolean;
  onEdit: (p: Profile) => void;
  onToggleStatus: (p: Profile) => void;
  onResetPassword: (p: Profile) => void;
}

export function AccountsTable({
  accounts,
  currentUserId,
  isPending,
  pageError,
  search,
  canEdit,
  canToggleStatus,
  canResetPassword,
  onEdit,
  onToggleStatus,
  onResetPassword,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {isPending ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      ) : pageError ? (
        <div className="py-12 text-center text-sm text-red-600">
          {pageError}
        </div>
      ) : accounts.length === 0 ? (
        <div className="py-16 text-center">
          <UserRound size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">
            {search ? "Không tìm thấy tài khoản phù hợp" : "Chưa có tài khoản nào"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-4 py-3 text-left font-medium text-slate-500">
                  #
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">
                  Họ và tên
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">
                  Số điện thoại
                </th>
                <th className="px-4 py-3 text-center font-medium text-slate-500">
                  Vai trò
                </th>
                <th className="px-4 py-3 text-center font-medium text-slate-500">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-500">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accounts.map((p, idx) => {
                const isSelf = p.id === currentUserId;
                const editable = canEdit(p);
                const toggleable = canToggleStatus(p);
                const resettable = canResetPassword(p);
                return (
                  <tr
                    key={p.id}
                    className="transition-colors hover:bg-slate-50/50"
                  >
                    <td className="px-4 py-3.5 text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">
                      {displayName(p.full_name)}
                      {isSelf && (
                        <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-500">
                          Bạn
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-700">
                      {p.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={[
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
                          ROLE_BADGE[p.role],
                        ].join(" ")}
                      >
                        {ROLE_LABEL[p.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={[
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                          p.status === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500",
                        ].join(" ")}
                      >
                        {p.status === "active" ? (
                          <>
                            <CheckCircle2 size={12} /> Hoạt động
                          </>
                        ) : (
                          <>
                            <XCircle size={12} /> Vô hiệu hóa
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        {editable && (
                          <button
                            type="button"
                            onClick={() => onEdit(p)}
                            title="Chỉnh sửa"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                        {resettable && (
                          <button
                            type="button"
                            onClick={() => onResetPassword(p)}
                            title="Đặt lại mật khẩu"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-amber-50 hover:text-amber-600"
                          >
                            <KeyRound size={15} />
                          </button>
                        )}
                        {toggleable && (
                          <button
                            type="button"
                            onClick={() => onToggleStatus(p)}
                            title={
                              p.status === "active"
                                ? "Vô hiệu hóa tài khoản"
                                : "Kích hoạt tài khoản"
                            }
                            className={[
                              "inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors",
                              p.status === "active"
                                ? "hover:bg-red-50 hover:text-red-600"
                                : "hover:bg-emerald-50 hover:text-emerald-600",
                            ].join(" ")}
                          >
                            {p.status === "active" ? (
                              <PowerOff size={15} />
                            ) : (
                              <Power size={15} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
