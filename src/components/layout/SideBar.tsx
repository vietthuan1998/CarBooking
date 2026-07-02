import { signOut } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";
import { SidebarBrandHeader } from "./sidebar/SidebarBrandHeader";
import { SidebarNav } from "./sidebar/SidebarNav";
import { SidebarFooter } from "./sidebar/SidebarFooter";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const { profile } = useAuthStore();
  const navigate = useNavigate();

  const fullName = profile?.full_name || "Điều phối viên";
  const role = profile?.role || "Admin";
  const avatarText = fullName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    const { error } = await signOut();

    if (error) {
      console.error(error);
      return;
    }

    navigate("/login", { replace: true });
  };

  return (
    <aside
      className={[
        "fixed left-0 top-0 z-40 flex h-dvh max-h-dvh flex-col overflow-hidden",
        "bg-[#06191D] text-white shadow-[12px_0_30px_rgba(15,23,42,0.22)]",
        "transition-all duration-300 ease-in-out",
        "w-72 max-w-[86vw]",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0",
        isCollapsed ? "lg:w-20" : "lg:w-72",
      ].join(" ")}
    >
      <div className="flex h-full min-h-0 flex-col">
        <SidebarBrandHeader
          isCollapsed={isCollapsed}
          onClose={onClose}
          onToggleCollapse={onToggleCollapse}
        />

        <SidebarNav isCollapsed={isCollapsed} onNavigate={onClose} />

        <SidebarFooter
          isCollapsed={isCollapsed}
          fullName={fullName}
          role={role}
          avatarText={avatarText}
          onLogout={handleLogout}
        />
      </div>
    </aside>
  );
}
