import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from "./pages/auth/LoginPage";
// import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminLayout from "./app/layout";

import DashboardPage from './pages/admin/DashboardPage';
import DispatchPage from './pages/admin/DispatchPage';
import DriversPage from './pages/admin/DriversPage';
import VehiclesPage from './pages/admin/VehiclesPage';
import Signup from './pages/Signup';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/"
        element={
          // <ProtectedRoute>
            <AdminLayout />
          // </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />

        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="dispatch" element={<DispatchPage />} />
        <Route path="vehicles" element={<VehiclesPage />} />
        <Route path="drivers" element={<DriversPage />} />
      </Route>
    </Routes>
  );
}