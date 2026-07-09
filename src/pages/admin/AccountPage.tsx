import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useAuthStore } from "@/stores/authStore";
import {
  type Profile,
  createAccount,
  getProfiles,
  resetPassword,
  updateProfile,
} from "../../services/accountService";
import { AccountsHeader } from "../../components/accounts/AccountsHeader";
import { AccountsFilterBar } from "../../components/accounts/AccountsFilterBar";
import { AccountsTable } from "../../components/accounts/AccountsTable";
import {
  AccountFormModal,
  type AccountFormState,
} from "../../components/accounts/AccountFormModal";
import { ToggleAccountStatusModal } from "../../components/accounts/ToggleAccountStatusModal";
import { ResetPasswordModal } from "../../components/accounts/ResetPasswordModal";
import type { RoleFilter } from "../../features/accounts/types";

const EMPTY_FORM: AccountFormState = {
  email: "",
  password: "",
  full_name: "",
  phone: "",
  role: "staff",
};

export default function SignupPage() {
  const viewer = useAuthStore((s) => s.profile);
  const isAdmin = viewer?.role === "admin";
  const isStaff = viewer?.role === "staff";

  const [isPending, startTransition] = useTransition();
  const [accounts, setAccounts] = useState<Profile[]>([]);
  const [pageError, setPageError] = useState<string | null>(null);

  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [search, setSearch] = useState("");

  const [modal, setModal] = useState<{
    mode: "add" | "edit";
    account?: Profile;
  } | null>(null);
  const [form, setForm] = useState<AccountFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [statusTarget, setStatusTarget] = useState<Profile | null>(null);
  const [togglingStatus, setTogglingStatus] = useState(false);

  const [resetTarget, setResetTarget] = useState<Profile | null>(null);
  const [resetting, setResetting] = useState(false);

  const load = useCallback(() => {
    startTransition(async () => {
      try {
        const data = await getProfiles();
        setAccounts(data);
        setPageError(null);
      } catch (e: unknown) {
        setPageError(
          e instanceof Error ? e.message : "Không thể tải danh sách tài khoản",
        );
      }
    });
  }, [startTransition]);

  useEffect(() => {
    load();
  }, [load]);

  // Staff chỉ được xem: hồ sơ của chính mình + danh sách tài xế.
  // Admin xem được toàn bộ. RLS đã cho phép staff SELECT hết profiles,
  // nên phạm vi hiển thị theo yêu cầu nghiệp vụ được lọc lại ở đây.
  const visibleAccounts = useMemo(() => {
    if (isAdmin) return accounts;
    if (isStaff) {
      return accounts.filter(
        (p) => p.role === "driver" || p.id === viewer?.id,
      );
    }
    return accounts.filter((p) => p.id === viewer?.id);
  }, [accounts, isAdmin, isStaff, viewer?.id]);

  const filtered = visibleAccounts.filter((p) => {
    if (roleFilter !== "all" && p.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.full_name.toLowerCase().includes(q) ||
        (p.phone ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts: Partial<Record<RoleFilter, number>> = {
    all: visibleAccounts.length,
    admin: visibleAccounts.filter((p) => p.role === "admin").length,
    staff: visibleAccounts.filter((p) => p.role === "staff").length,
    driver: visibleAccounts.filter((p) => p.role === "driver").length,
  };

  const canEdit = (p: Profile) =>
    isAdmin || p.id === viewer?.id || (isStaff && p.role === "driver");
  const canToggleStatus = (p: Profile) =>
    p.id !== viewer?.id && (isAdmin || (isStaff && p.role === "driver"));
  const canEditRole = (p: Profile) => isAdmin && p.id !== viewer?.id;
  const canResetPassword = (p: Profile) =>
    isAdmin || p.id === viewer?.id || (isStaff && p.role === "driver");

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormError(null);
    setModal({ mode: "add" });
  };

  const openEdit = (p: Profile) => {
    setForm({
      email: p.email ?? "",
      password: "",
      full_name: p.full_name,
      phone: p.phone ?? "",
      role: p.role,
    });
    setFormError(null);
    setModal({ mode: "edit", account: p });
  };

  const handleSave = async () => {
    // Driver được phép trống tên: account có thể tạo chỉ với email + mật
    // khẩu, driver tự cập nhật thông tin sau trên app mobile.
    if (!form.full_name.trim() && form.role !== "driver") {
      setFormError("Vui lòng nhập họ và tên");
      return;
    }
    if (modal?.mode === "add") {
      if (!form.email.trim()) {
        setFormError("Vui lòng nhập email");
        return;
      }
      if (form.password.length < 6) {
        setFormError("Mật khẩu phải có ít nhất 6 ký tự");
        return;
      }
    }

    setSaving(true);
    setFormError(null);
    try {
      if (modal?.mode === "add") {
        await createAccount({
          email: form.email.trim(),
          password: form.password,
          full_name: form.full_name.trim(),
          phone: form.phone.trim() || null,
          role: form.role,
        });
      } else if (modal?.account) {
        const updates: Parameters<typeof updateProfile>[1] = {
          full_name: form.full_name.trim(),
          phone: form.phone.trim() || null,
        };
        if (canEditRole(modal.account)) {
          updates.role = form.role;
        }
        await updateProfile(modal.account.id, updates);
      }
      setModal(null);
      load();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Lưu thất bại";
      setFormError(
        msg.includes("duplicate") || msg.includes("unique")
          ? "Số điện thoại hoặc email đã tồn tại trong hệ thống"
          : msg,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!statusTarget) return;
    setTogglingStatus(true);
    try {
      await updateProfile(statusTarget.id, {
        status: statusTarget.status === "active" ? "inactive" : "active",
      });
      setStatusTarget(null);
      load();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Cập nhật trạng thái thất bại");
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetTarget) return;
    setResetting(true);
    try {
      const newPassword = await resetPassword(resetTarget.id);
      alert(
        `Đã đặt lại mật khẩu cho ${resetTarget.full_name}: ${newPassword}`,
      );
      setResetTarget(null);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Đặt lại mật khẩu thất bại");
    } finally {
      setResetting(false);
    }
  };

  const roleOptions: RoleFilter[] = isAdmin
    ? ["all", "admin", "staff", "driver"]
    : ["all"];

  return (
    <div className="mx-auto max-w-6xl">
      <AccountsHeader
        title="Quản lý tài khoản"
        subtitle={
          isAdmin
            ? `${counts.all ?? 0} tài khoản trong hệ thống`
            : isStaff
              ? `Hồ sơ của bạn và ${counts.driver ?? 0} tài xế`
              : "Hồ sơ của bạn"
        }
        canCreate={isAdmin}
        onAdd={openAdd}
      />

      <AccountsFilterBar
        roleOptions={roleOptions}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        counts={counts}
        search={search}
        onSearchChange={setSearch}
      />

      <AccountsTable
        accounts={filtered}
        currentUserId={viewer?.id}
        isPending={isPending}
        pageError={pageError}
        search={search}
        canEdit={canEdit}
        canToggleStatus={canToggleStatus}
        canResetPassword={canResetPassword}
        onEdit={openEdit}
        onToggleStatus={setStatusTarget}
        onResetPassword={setResetTarget}
      />

      {modal && (
        <AccountFormModal
          mode={modal.mode}
          form={form}
          onFormChange={setForm}
          canEditRole={modal.mode === "add" || canEditRole(modal.account!)}
          saving={saving}
          formError={formError}
          onCancel={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      {statusTarget && (
        <ToggleAccountStatusModal
          account={statusTarget}
          saving={togglingStatus}
          onCancel={() => setStatusTarget(null)}
          onConfirm={handleToggleStatus}
        />
      )}

      {resetTarget && (
        <ResetPasswordModal
          account={resetTarget}
          saving={resetting}
          onCancel={() => setResetTarget(null)}
          onConfirm={handleResetPassword}
        />
      )}
    </div>
  );
}
