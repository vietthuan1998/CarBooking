import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Empty,
  Spin,
  Divider,
  Badge,
} from "antd";
import { ClockCircleOutlined, CarOutlined } from "@ant-design/icons";
import { fetchTrips } from "@/services/tripService";
import type { TripWithSeats } from "@/services/tripService";
import {
  formatTime,
  formatVND,
  formatDate,
  ROUTES,
} from "@/constants/appConstants";

export default function Trips() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [trips, setTrips] = useState<TripWithSeats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const routeId = searchParams.get("route") || "hue-da-nang";
  const dateStr =
    searchParams.get("date") || new Date().toISOString().split("T")[0];

  const route = Object.values(ROUTES).find((r) => r.id === routeId);

  useEffect(() => {
    const loadTrips = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTrips(routeId, dateStr);
        setTrips(data);
      } catch (err) {
        setError("Failed to load trips. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTrips();
  }, [routeId, dateStr]);

  const handleBooking = (tripId: string) => {
    navigate(`/booking/${tripId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Loading trips..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <Card className="mb-8 border-0 shadow-md bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {route?.origin} → {route?.destination}
            </h1>
            <p className="text-gray-600">
              {formatDate(dateStr)} | {route?.distance} km | ~
              {route?.estimatedDuration} giờ
            </p>
          </div>
        </Card>

        {/* Trips List */}
        {error ? (
          <Card>
            <Empty description="Error" description={error} />
          </Card>
        ) : trips.length === 0 ? (
          <Card>
            <Empty
              description="No trips available"
              description="Không có chuyến xe nào khả dụng cho ngày này. Vui lòng thử ngày khác."
            />
            <div className="text-center mt-4">
              <Button type="primary" onClick={() => navigate("/")}>
                Quay lại tìm kiếm
              </Button>
            </div>
          </Card>
        ) : (
          <Space direction="vertical" style={{ width: "100%" }}>
            {trips.map((trip) => {
              const availableSeats = trip.seats.filter(
                (s) => s.is_available,
              ).length;
              const occupancyPercent =
                (trip.booked_seats / trip.vehicle?.seat_count) * 100 || 0;

              return (
                <Card
                  key={trip.id}
                  className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleBooking(trip.id)}
                >
                  <Row gutter={24} align="middle">
                    {/* Time */}
                    <Col xs={24} sm={6}>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatTime(trip.departure_time)}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center justify-center gap-1 mt-1">
                          <ClockCircleOutlined />
                          {trip.route?.destination}
                        </div>
                        <Divider style={{ margin: "8px 0" }} />
                        <div className="text-sm text-gray-500">
                          ~{trip.route ? 2.5 : 2}h
                        </div>
                      </div>
                    </Col>

                    {/* Vehicle & Seats */}
                    <Col xs={24} sm={6}>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CarOutlined className="text-lg" />
                          <span className="font-semibold">
                            {trip.vehicle?.plate_number}
                          </span>
                        </div>
                        <Badge
                          status="success"
                          text={`${trip.vehicle?.seat_count} chỗ ngồi`}
                        />
                        <div className="text-xs text-gray-500 mt-2">
                          {availableSeats} ghế còn trống
                        </div>
                      </div>
                    </Col>

                    {/* Occupancy Bar */}
                    <Col xs={24} sm={6}>
                      <div>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-semibold">Tình trạng</span>
                          <span className="text-gray-600">
                            {occupancyPercent.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.min(occupancyPercent, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          {trip.booked_seats}/{trip.vehicle?.seat_count} ghế đã
                          đặt
                        </div>
                      </div>
                    </Col>

                    {/* Price & Button */}
                    <Col xs={24} sm={6} className="text-right">
                      <div className="mb-4">
                        <div className="text-xs text-gray-600 mb-1">
                          Giá/chỗ
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatVND(trip.fare_price)}
                        </div>
                      </div>
                      <Button
                        type="primary"
                        block
                        disabled={availableSeats === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBooking(trip.id);
                        }}
                      >
                        {availableSeats === 0 ? "Hết ghế" : "Chọn ghế"}
                      </Button>
                    </Col>
                  </Row>
                </Card>
              );
            })}
          </Space>
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Button onClick={() => navigate("/")}>Quay lại</Button>
        </div>
      </div>
    </div>
  );
}
