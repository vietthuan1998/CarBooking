import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Spin,
  Divider,
  Empty,
  Alert,
} from "antd";
import { ArrowLeftOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { SeatMap } from "@/component/Car/SeatMap";
import { getTripDetails } from "@/services/tripService";
import type { TripWithSeats, SeatInfo } from "@/services/tripService";
import { useBookingStore } from "@/stores/bookingStore";
import {
  formatTime,
  formatVND,
  formatDate,
  VEHICLE_TYPES,
} from "@/constants/appConstants";

export default function Booking() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<TripWithSeats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    setTrip: setBookingTrip,
    selectedSeats,
    addSeat,
    removeSeat,
    totalPrice,
  } = useBookingStore();

  useEffect(() => {
    const loadTrip = async () => {
      if (!tripId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getTripDetails(tripId);
        setTrip(data);
        setBookingTrip(tripId);
      } catch (err) {
        setError("Failed to load trip details. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTrip();
  }, [tripId, setBookingTrip]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Loading trip details..." />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <Empty description="Error" description={error || "Trip not found"} />
          <div className="text-center mt-4">
            <Button onClick={() => navigate("/trips")}>
              Quay lại danh sách chuyến
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const vehicleType =
    trip.vehicle?.seat_count === 4
      ? VEHICLE_TYPES.SEDAN_4SEAT
      : VEHICLE_TYPES.MINIVAN_7SEAT;

  const handleSeatClick = (seat: SeatInfo) => {
    const seatId = `${trip.id}-${seat.seat_number}`;
    const isSelected = selectedSeats.some((s) => s.seatId === seatId);

    if (isSelected) {
      removeSeat(seatId, trip.fare_price);
    } else {
      const isAvailable = trip.seats.find(
        (s) => s.seat_number === seat.seat_number,
      )?.is_available;

      if (isAvailable) {
        addSeat(
          {
            seatId,
            seatNumber: seat.seat_number,
          },
          trip.fare_price,
        );
      }
    }
  };

  const availableSeats = trip.seats.filter((s) => s.is_available).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          Quay lại
        </Button>

        <Row gutter={24}>
          {/* Left: Trip Info & Seat Selection */}
          <Col xs={24} lg={16}>
            <Card className="border-0 shadow-md mb-6">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                  {trip.route?.origin} → {trip.route?.destination}
                </h1>
                <p className="text-gray-600 mt-2">
                  {formatDate(trip.departure_time)} |{" "}
                  {formatTime(trip.departure_time)}
                </p>
              </div>

              {/* Seat Selection */}
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Chọn ghế ngồi
                  </h3>

                  {availableSeats === 0 && (
                    <Alert
                      message="Chuyến xe đã đầy"
                      type="warning"
                      showIcon
                      className="mb-4"
                    />
                  )}

                  <div className="flex justify-center">
                    <div
                      className="relative"
                      style={{
                        width: "480px",
                        height: "250px",
                      }}
                    >
                      <svg
                        width="480"
                        height="250"
                        viewBox="0 0 960 476"
                        className="w-full h-full"
                      >
                        {/* Vehicle outline */}
                        <rect
                          x="50"
                          y="30"
                          width="860"
                          height="416"
                          fill="none"
                          stroke="#ccc"
                          strokeWidth="2"
                          rx="20"
                        />

                        {/* Vehicle type label */}
                        <text
                          x="480"
                          y="460"
                          textAnchor="middle"
                          fontSize="14"
                          fill="#666"
                        >
                          {vehicleType.name}
                        </text>
                      </svg>

                      {/* Seat selector */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <SeatMap
                          layout={vehicleType}
                          occupiedSeats={trip.seats
                            .filter((s) => !s.is_available)
                            .map((s) => s.seat_number)}
                          selectedSeats={selectedSeats.map((s) => s.seatNumber)}
                          onSeatClick={handleSeatClick}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap gap-6 justify-center">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border-2 border-green-500 bg-green-100"
                      style={{ backgroundColor: "#90EE90" }}
                    ></div>
                    <span className="text-sm">Ghế đã chọn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded border-2 border-gray-300 bg-white"></div>
                    <span className="text-sm">Ghế trống</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded border-2 border-gray-500 bg-gray-300"></div>
                    <span className="text-sm">Ghế đã bán</span>
                  </div>
                </div>
              </div>
            </Card>
          </Col>

          {/* Right: Booking Summary */}
          <Col xs={24} lg={8}>
            <Card className="border-0 shadow-md sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Tóm tắt đặt vé
              </h2>

              {/* Trip Details */}
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="large"
              >
                <div className="bg-blue-50 p-4 rounded">
                  <div className="text-sm text-gray-600 mb-1">Chuyến đi</div>
                  <div className="font-semibold text-gray-800">
                    {trip.route?.origin} → {trip.route?.destination}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {formatTime(trip.departure_time)}{" "}
                    {formatDate(trip.departure_time)}
                  </div>
                </div>

                {/* Selected Seats */}
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">
                    Ghế đã chọn ({selectedSeats.length})
                  </div>
                  {selectedSeats.length === 0 ? (
                    <div className="text-gray-500 text-center py-4">
                      Chưa chọn ghế nào
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedSeats.map((seat) => (
                        <div
                          key={seat.seatId}
                          className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200"
                        >
                          <span className="font-semibold">
                            Ghế {seat.seatNumber}
                          </span>
                          <span className="text-green-600 font-semibold">
                            {formatVND(trip.fare_price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Divider style={{ margin: "12px 0" }} />

                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Tổng cộng:</span>
                    <span className="font-semibold">
                      {selectedSeats.length} ghế
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-800">
                    <span>Thành tiền:</span>
                    <span className="text-green-600">
                      {formatVND(totalPrice)}
                    </span>
                  </div>
                </div>

                <Divider style={{ margin: "12px 0" }} />

                {/* Action Button */}
                <Button
                  type="primary"
                  size="large"
                  block
                  disabled={selectedSeats.length === 0}
                  onClick={() => navigate("/booking-confirm")}
                  icon={<CheckCircleOutlined />}
                >
                  {selectedSeats.length === 0
                    ? "Chọn ghế để tiếp tục"
                    : "Tiếp tục thanh toán"}
                </Button>

                <div className="text-xs text-gray-500 text-center">
                  Bạn có thể thay đổi lựa chọn sau
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
