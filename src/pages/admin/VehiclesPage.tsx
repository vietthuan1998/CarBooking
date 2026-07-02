import { useCallback, useEffect, useTransition, useState } from "react";
import {
  Car,
  CheckCircle2,
  Pencil,
  Plus,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  type Vehicle,
  type VehicleFormInput,
  createVehicle,
  deleteVehicle,
  getVehicles,
  updateVehicle,
} from "../../services/vehicleService";

const EMPTY_FORM: VehicleFormInput = {
  vehicle_name: "",
  plate_number: "",
  seat_count: 7,
  status: "active",
};

type StatusFilter = "all" | "active" | "inactive";

export default function VehiclesPage() {
  const [isPending, startTransition] = useTransition();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    vehicle?: Vehicle;
  } | null>(null);
  const [form, setForm] = useState<VehicleFormInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    startTransition(async () => {
      try {
        const data = await getVehicles();
        setVehicles(data);
        setPageError(null);
      } catch (e: unknown) {
        setPageError(
          e instanceof Error ? e.message : "Không thể tải danh sách xe",
        );
      }
    });
  }, [startTransition]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = vehicles.filter((v) => {
    if (statusFilter !== "all" && v.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        v.vehicle_name.toLowerCase().includes(q) ||
        v.plate_number.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    all: vehicles.length,
    active: vehicles.filter((v) => v.status === "active").length,
    inactive: vehicles.filter((v) => v.status === "inactive").length,
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setModal({ mode: "add" });
  };

  const openEdit = (v: Vehicle) => {
    setForm({
      vehicle_name: v.vehicle_name,
      plate_number: v.plate_number,
      seat_count: v.seat_count,
      status: v.status,
    });
    setFormError(null);
    setModal({ mode: "edit", vehicle: v });
  };

  const handleSave = async () => {
    if (!form.vehicle_name.trim()) {
      setFormError("Vui lòng nhập tên xe");
      return;
    }
    if (!form.plate_number.trim()) {
      setFormError("Vui lòng nhập biển số xe");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (modal?.mode === "add") {
        await createVehicle(form);
      } else if (modal?.vehicle) {
        await updateVehicle(modal.vehicle.id, form);
      }
      setModal(null);
      load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Lưu thất bại";
      setFormError(
        msg.includes("duplicate") || msg.includes("unique")
          ? "Biển số xe đã tồn tại trong hệ thống"
          : msg,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteVehicle(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Xóa thất bại";
      alert(
        msg.includes("foreign key") || msg.includes("violates")
          ? "Không thể xóa xe đang được sử dụng trong chuyến xe."
          : msg,
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (v: Vehicle) => {
    try {
      await updateVehicle(v.id, {
        status: v.status === "active" ? "inactive" : "active",
      });
      load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Cập nhật trạng thái thất bại");
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50">
            <Car className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Quản lý xe
            </h1>
            <p className="text-sm text-slate-500">
              {counts.active} xe hoạt động · {counts.inactive} xe ngưng
            </p>
          </div>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
        >
          <Plus size={18} />
          Thêm xe
        </button>
      </div>

      {/* Filter & Search */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {(["all", "active", "inactive"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={[
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                statusFilter === s
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100",
              ].join(" ")}
            >
              {s === "all" ? "Tất cả" : s === "active" ? "Hoạt động" : "Ngưng"}
              <span
                className={[
                  "ml-1.5 rounded-full px-1.5 py-0.5 text-xs",
                  statusFilter === s
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600",
                ].join(" ")}
              >
                {counts[s]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Tìm tên xe, biển số..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm placeholder-slate-400 shadow-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isPending ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : pageError ? (
          <div className="py-12 text-center text-sm text-red-600">
            {pageError}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Car size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">
              {search ? "Không tìm thấy xe phù hợp" : "Chưa có xe nào"}
            </p>
            {!search && (
              <button
                onClick={openAdd}
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
                {filtered.map((v, idx) => (
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
                        onClick={() => handleToggleStatus(v)}
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
                          onClick={() => openEdit(v)}
                          title="Chỉnh sửa"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(v)}
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

      {/* Add / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                {modal.mode === "add"
                  ? "Thêm xe mới"
                  : "Chỉnh sửa thông tin xe"}
              </h2>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Tên xe <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Ford Transit 7 chỗ"
                  value={form.vehicle_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, vehicle_name: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Biển số xe <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: 75A-12345"
                  value={form.plate_number}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      plate_number: e.target.value.toUpperCase(),
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-mono text-sm placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Số chỗ ngồi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.seat_count}
                    onChange={(e) =>
                      setForm((f) => ({
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
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Trạng thái
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        status: e.target.value as "active" | "inactive",
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  >
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
                onClick={() => setModal(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-60"
              >
                {saving
                  ? "Đang lưu..."
                  : modal.mode === "add"
                  ? "Thêm xe"
                  : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
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
                  {deleteTarget.vehicle_name}
                </span>{" "}
                ({deleteTarget.plate_number})? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-xl bg-red-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Đang xóa..." : "Xóa xe"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
