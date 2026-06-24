import Sidebar from '../components/layout/SideBar';
import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Cột Sidebar bên trái */}
      <Sidebar />

      {/* Vùng nội dung chính bên phải */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

