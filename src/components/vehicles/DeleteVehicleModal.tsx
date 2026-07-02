import { Trash2 } from "lucide-react";
import type { Vehicle } from "../../services/vehicleService";

interface Props {
  vehicle: Vehicle;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteVehicleModal({
  vehicle,
  deleting,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white shadow-2xl">
        <div className="p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
            <Trash2 size={22} className="text-red-600" />
          </div>
          <h2 className="mb-1 text-lg font-semibold text-slate-900">
            Xóa xe này?
          </h2>
          <p className="text-sm text-slate-500">
            Bạn chắc chắn muốn xóa{" "}
            <span className="font-semibold text-slate-800">
              {vehicle.vehicle_name}
            </span>{" "}
            ({vehicle.plate_number})? Hành động này không thể hoàn tác.
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
            disabled={deleting}
            className="rounded-xl bg-red-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {deleting ? "Đang xóa..." : "Xóa xe"}
          </button>
        </div>
      </div>
    </div>
  );
}
