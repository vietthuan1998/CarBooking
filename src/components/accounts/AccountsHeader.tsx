import { UserCog, UserPlus } from "lucide-react";

interface Props {
  title: string;
  subtitle: string;
  canCreate: boolean;
  onAdd: () => void;
}

export function AccountsHeader({ title, subtitle, canCreate, onAdd }: Props) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50">
          <UserCog className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      {canCreate && (
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
        >
          <UserPlus size={18} />
          Thêm tài khoản
        </button>
      )}
    </div>
  );
}
