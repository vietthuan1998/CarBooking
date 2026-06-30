import { useEffect, useState } from "react";
import {
  getDashboardStats,
  getPendingBookings2,
  getRunningTrips,
  getUpcomingTrips,
} from "../services/dashboardService";
import type {
  DashboardStats,
  PendingBooking,
  RunningTrip,
  UpcomingTrip,
} from "../features/dashboard/types";

export function useDashboard(selectedDate: Date) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upcomingTrips, setUpcomingTrips] = useState<UpcomingTrip[]>([]);
  const [runningTrips, setRunningTrips] = useState<RunningTrip[]>([]);
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setErrorMessage("");

        const [statsData, upcomingData, runningData, pendingData] =
          await Promise.all([
            getDashboardStats(selectedDate),
            getUpcomingTrips(selectedDate),
            getRunningTrips(selectedDate),
            getPendingBookings2(),
          ]);

        if (!isMounted) return;
        setStats(statsData);
        setUpcomingTrips(upcomingData);
        setRunningTrips(runningData);
        setPendingBookings(pendingData);
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setErrorMessage("Không thể tải dữ liệu dashboard.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  return {
    stats,
    upcomingTrips,
    runningTrips,
    pendingBookings,
    loading,
    errorMessage,
  };
}
