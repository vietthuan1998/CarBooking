import { Car, CheckCircle2, Pencil, Trash2, XCircle } from "lucide-react";
import type { Vehicle } from "../../services/vehicleService";

interface Props {
  vehicles: Vehicle[];
  isPending: boolean;
  pageError: string | null;
  search: string;
  onAdd: () => void;
  onEdit: (v: Vehicle) => void;
  onDeleteRequest: (v: Vehicle) => void;
  onToggleStatus: (v: Vehicle) => void;
}

export function VehiclesTable({
  vehicles,
  isPending,
  pageError,
  search,
  onAdd,
  onEdit,
  onDeleteRequest,
  onToggleStatus,
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
      ) : vehicles.length === 0 ? (
        <div className="py-16 text-center">
          <Car size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">
            {search ? "Không tìm thấy xe phù hợp" : "Chưa có xe nào"}
          </p>
          {!search && (
            <button
              type="button"
              onClick={onAdd}
              className="mt-3 text-sm text-emerald-600 hover:underline"
            >
              Thêm xe đầu tiên
            </button>
          )}
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
                  Tên xe
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">
                  Biển số
                </th>
                <th className="px-4 py-3 text-center font-medium text-slate-500">
                  Số chỗ
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
              {vehicles.map((v, idx) => (
                <tr
                  key={v.id}
                  className="transition-colors hover:bg-slate-50/50"
                >
                  <td className="px-4 py-3.5 text-slate-400">{idx + 1}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-900">
                    {v.vehicle_name}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-slate-700">
                    {v.plate_number}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className="inline-flex h-6 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                      {v.seat_count}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleStatus(v)}
                      title="Nhấn để đổi trạng thái"
                      className={[
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                        v.status === "active"
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                      ].join(" ")}
                    >
                      {v.status === "active" ? (
                        <>
                          <CheckCircle2 size={12} /> Hoạt động
                        </>
                      ) : (
                        <>
                          <XCircle size={12} /> Ngưng
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(v)}
                        title="Chỉnh sửa"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteRequest(v)}
                        title="Xóa xe"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
