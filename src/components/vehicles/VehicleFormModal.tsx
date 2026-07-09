import type { VehicleFormInput } from "../../services/vehicleService";

interface Props {
  mode: "add" | "edit";
  form: VehicleFormInput;
  onFormChange: (updater: (f: VehicleFormInput) => VehicleFormInput) => void;
  saving: boolean;
  formError: string | null;
  onCancel: () => void;
  onSave: () => void;
}

export function VehicleFormModal({
  mode,
  form,
  onFormChange,
  saving,
  formError,
  onCancel,
  onSave,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="max-h-full w-full max-w-md overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {mode === "add" ? "Thêm xe mới" : "Chỉnh sửa thông tin xe"}
          </h2>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label
              htmlFor="vehicle-name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Tên xe <span className="text-red-500">*</span>
            </label>
            <input
              id="vehicle-name"
              type="text"
              placeholder="VD: Ford Transit 7 chỗ"
              value={form.vehicle_name}
              onChange={(e) =>
                onFormChange((f) => ({ ...f, vehicle_name: e.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div>
            <label
              htmlFor="vehicle-plate"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Biển số xe <span className="text-red-500">*</span>
            </label>
            <input
              id="vehicle-plate"
              type="text"
              placeholder="VD: 75A-12345"
              value={form.plate_number}
              onChange={(e) =>
                onFormChange((f) => ({
                  ...f,
                  plate_number: e.target.value.toUpperCase(),
                }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-sm placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="vehicle-seat-count"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Số chỗ ngồi <span className="text-red-500">*</span>
              </label>
              <select
                id="vehicle-seat-count"
                value={form.seat_count}
                onChange={(e) =>
                  onFormChange((f) => ({
                    ...f,
                    seat_count: Number(e.target.value),
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                <option value={4}>4 chỗ</option>
                <option value={7}>7 chỗ</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="vehicle-status"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Trạng thái
              </label>
              <select
                id="vehicle-status"
                value={form.status}
                onChange={(e) =>
                  onFormChange((f) => ({
                    ...f,
                    status: e.target.value as VehicleFormInput["status"],
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                <option value="pending">Chờ duyệt</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Ngưng hoạt động</option>
              </select>
            </div>
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
            {saving ? "Đang lưu..." : mode === "add" ? "Thêm xe" : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}
