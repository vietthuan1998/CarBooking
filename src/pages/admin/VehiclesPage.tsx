import { useCallback, useEffect, useTransition, useState } from "react";
import {
  type Vehicle,
  type VehicleFormInput,
  createVehicle,
  deleteVehicle,
  getVehicles,
  updateVehicle,
} from "../../services/vehicleService";
import { VehiclesHeader } from "../../components/vehicles/VehiclesHeader";
import { VehiclesFilterBar } from "../../components/vehicles/VehiclesFilterBar";
import { VehiclesTable } from "../../components/vehicles/VehiclesTable";
import { VehicleFormModal } from "../../components/vehicles/VehicleFormModal";
import { DeleteVehicleModal } from "../../components/vehicles/DeleteVehicleModal";
import type { StatusFilter } from "../../features/vehicles/types";

const EMPTY_FORM: VehicleFormInput = {
  vehicle_name: "",
  plate_number: "",
  seat_count: 7,
  status: "active",
};

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

  const counts: Record<StatusFilter, number> = {
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
      <VehiclesHeader
        activeCount={counts.active}
        inactiveCount={counts.inactive}
        onAdd={openAdd}
      />

      <VehiclesFilterBar
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        counts={counts}
        search={search}
        onSearchChange={setSearch}
      />

      <VehiclesTable
        vehicles={filtered}
        isPending={isPending}
        pageError={pageError}
        search={search}
        onAdd={openAdd}
        onEdit={openEdit}
        onDeleteRequest={setDeleteTarget}
        onToggleStatus={handleToggleStatus}
      />

      {modal && (
        <VehicleFormModal
          mode={modal.mode}
          form={form}
          onFormChange={setForm}
          saving={saving}
          formError={formError}
          onCancel={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <DeleteVehicleModal
          vehicle={deleteTarget}
          deleting={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
