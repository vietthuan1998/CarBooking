import { useCallback, useEffect, useState, useTransition } from "react";
import { CheckCircle2, Clock, Phone, User, XCircle } from "lucide-react";
import { getProfiles, type Profile } from "../../services/accountService";
import {
  getVehicles,
  updateVehicle,
  type Vehicle,
} from "../../services/vehicleService";
import { displayName } from "../../utils/helpers";

export default function DriversPage() {
  const [isPending, startTransition] = useTransition();
  const [drivers, setDrivers] = useState<Profile[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);

  const load = useCallback(() => {
    startTransition(async () => {
      try {
        const [profiles, vehicleList] = await Promise.all([
          getProfiles(),
          getVehicles(),
        ]);
        setDrivers(profiles.filter((p) => p.role === "driver"));
        setVehicles(vehicleList);
        setPageError(null);
      } catch (e: unknown) {
        setPageError(
          e instanceof Error ? e.message : "Không thể tải danh sách tài xế",
        );
      }
    });
  }, [startTransition]);

  useEffect(() => {
    load();
  }, [load]);

  const vehicleByDriver = new Map(
    vehicles
      .filter((v) => v.driver_id)
      .map((v) => [v.driver_id as string, v]),
  );

  const pendingCount = vehicles.filter((v) => v.status === "pending").length;

  const handleApprove = async (v: Vehicle) => {
    try {
      await updateVehicle(v.id, { status: "active" });
      load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Duyệt xe thất bại");
    }
  };

  const handleReject = async (v: Vehicle) => {
    if (!window.confirm(`Từ chối đăng ký xe ${v.plate_number}?`)) return;
    try {
      await updateVehicle(v.id, { status: "inactive" });
      load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Từ chối xe thất bại");
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50/80 p-6 shadow-sm">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50">
          <User className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Tài xế
          </h1>
          <p className="text-sm text-slate-500">
            {drivers.length} tài xế · {pendingCount} xe chờ duyệt
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isPending ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : pageError ? (
          <div className="py-12 text-center text-sm text-red-600">
            {pageError}
          </div>
        ) : drivers.length === 0 ? (
          <div className="py-16 text-center text-sm font-medium text-slate-500">
            Chưa có tài xế nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-4 py-3 text-left font-medium text-slate-500">
                    Tài xế
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">
                    Liên hệ
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500">
                    Xe đăng ký
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-slate-500">
                    Trạng thái xe
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drivers.map((d) => {
                  const vehicle = vehicleByDriver.get(d.id);
                  return (
                    <tr
                      key={d.id}
                      className="transition-colors hover:bg-slate-50/50"
                    >
                      <td className="px-4 py-3.5 font-medium text-slate-900">
                        {displayName(d.full_name)}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {d.phone ? (
                          <span className="inline-flex items-center gap-1.5">
                            <Phone size={13} className="text-slate-400" />{" "}
                            {d.phone}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">
                        {vehicle ? (
                          <div>
                            <div className="font-medium">
                              {vehicle.vehicle_name}
                            </div>
                            <div className="font-mono text-xs text-slate-400">
                              {vehicle.plate_number}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-300">
                            Chưa đăng ký xe
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {!vehicle ? (
                          <span className="text-slate-300">—</span>
                        ) : vehicle.status === "pending" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                            <Clock size={12} /> Chờ duyệt
                          </span>
                        ) : vehicle.status === "active" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            <CheckCircle2 size={12} /> Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                            <XCircle size={12} /> Ngưng
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {vehicle?.status === "pending" && (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleApprove(vehicle)}
                              title="Duyệt xe"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-emerald-600 transition-colors hover:bg-emerald-50"
                            >
                              <CheckCircle2 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(vehicle)}
                              title="Từ chối xe"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-50"
                            >
                              <XCircle size={15} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
