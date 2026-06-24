import { Routes, Route, Navigate } from 'react-router-dom';

import Sidebar from './components/layout/SideBar';
import DashboardPage from './pages/admin/DashboardPage';
import DispatchPage from './pages/admin/DispatchPage';
import DriversPage from './pages/admin/DriversPage';
import VehiclesPage from './pages/admin/VehiclesPage';

export default function App() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-6">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dispatch" element={<DispatchPage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/drivers" element={<DriversPage />} />

          <Route path="*" element={<div>Không tìm thấy trang</div>} />
        </Routes>
      </main>
    </div>
  );
}