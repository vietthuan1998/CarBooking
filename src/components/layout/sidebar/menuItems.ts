import {
  CalendarDays,
  Car,
  LayoutDashboard,
  Map,
  Route,
  Settings,
  Shuffle,
  UserPlus,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

export type MenuItem = {
  name: string;
  path: string;
  icon: LucideIcon;
};

export const menuItems: MenuItem[] = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Booking", path: "/bookings", icon: CalendarDays },
  { name: "Điều phối", path: "/dispatch", icon: Shuffle },
  { name: "Quản lý xe", path: "/vehicles", icon: Car },
  { name: "Quản lý tài xế", path: "/drivers", icon: UserRound },
  { name: "Quản lý chuyến", path: "/trips", icon: Route },
  { name: "Khách hàng", path: "/customers", icon: Users },
  { name: "Đăng ký", path: "/signup", icon: UserPlus },
  { name: "Báo cáo", path: "/reports", icon: Map },
  { name: "Cài đặt", path: "/settings", icon: Settings },
];
