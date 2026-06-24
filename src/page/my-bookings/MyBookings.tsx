import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Space,
  Empty,
  Spin,
  Badge,
  Row,
  Col,
  Tag,
  message,
  Popconfirm,
} from "antd";
import {
  ArrowLeftOutlined,
  EyeOutlined,
  DeleteOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "@/stores/authStore";
import { getUserBookings, cancelBooking } from "@/services/bookingService";
import type { BookingWithDetails } from "@/services/bookingService";
import { formatVND, formatTime, formatDate } from "@/constants/appConstants";

export default function MyBookings() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  useEffect(() => {
    const loadBookings = async () => {
      if (!user?.id) {
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const data = await getUserBookings(user.id);
        setBookings(data);
      } catch (error) {
        message.error("Failed to load bookings");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [user?.id, navigate]);

  const handleCancel = async (bookingId: string) => {
    setCancelling(bookingId);
    try {
      await cancelBooking(bookingId);
      message.success("Booking cancelled successfully");
      setBookings(
        bookings.map((b) =>
          b.id === bookingId ? { ...b, booking_status: "cancelled" } : b,
        ),
      );
    } catch (error) {
      message.error("Failed to cancel booking");
      console.error(error);
    } finally {
      setCancelling(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "green";
      case "pending":
        return "blue";
      case "completed":
        return "default";
      case "cancelled":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Đã xác nhận";
      case "pending":
        return "Đang chờ";
      case "completed":
        return "Hoàn tất";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/")}
          >
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">
            Các chuyến của tôi
          </h1>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Spin size="large" tip="Loading bookings..." />
          </div>
        ) : bookings.length === 0 ? (
          <Card className="border-0 shadow-md">
            <Empty
              description="No bookings yet"
              description="Bạn chưa có chuyến đặt vé nào. Hãy bắt đầu tìm kiếm chuyến xe ngay!"
            />
            <div className="text-center mt-6">
              <Button type="primary" onClick={() => navigate("/")}>
                Tìm chuyến xe
              </Button>
            </div>
          </Card>
        ) : (
          <Space direction="vertical" style={{ width: "100%" }} size="large">
            {bookings.map((booking) => {
              const isCompleted = booking.booking_status === "completed";
              const isCancelled = booking.booking_status === "cancelled";
              const canCancel =
                !isCancelled &&
                !isCompleted &&
                booking.trip?.departure_time &&
                new Date(booking.trip.departure_time) > new Date();

              return (
                <Card
                  key={booking.id}
                  className="border-0 shadow-md hover:shadow-lg transition-shadow"
                >
                  <Row gutter={24} align="middle">
                    {/* Left: Trip Info */}
                    <Col xs={24} md={14}>
                      <div>
                        {/* Status Badge */}
                        <div className="mb-4">
                          <Badge
                            status={
                              booking.booking_status === "confirmed"
                                ? "success"
                                : "processing"
                            }
                            text={
                              <Tag
                                color={getStatusColor(booking.booking_status)}
                              >
                                {getStatusLabel(booking.booking_status)}
                              </Tag>
                            }
                          />
                        </div>

                        {/* Trip Route */}
                        <h3 className="text-lg font-bold text-gray-800 mb-4">
                          {booking.trip?.route?.origin} →{" "}
                          {booking.trip?.route?.destination}
                        </h3>

                        {/* Trip Details */}
                        <Row gutter={16} className="mb-4">
                          <Col xs={12} sm={8}>
                            <div className="flex items-start gap-2">
                              <CalendarOutlined className="mt-1 text-blue-600" />
                              <div>
                                <div className="text-xs text-gray-600">
                                  Ngày khởi hành
                                </div>
                                <div className="font-semibold text-gray-800">
                                  {booking.trip?.departure_time
                                    ? formatDate(booking.trip.departure_time)
                                    : "-"}
                                </div>
                              </div>
                            </div>
                          </Col>
                          <Col xs={12} sm={8}>
                            <div className="flex items-start gap-2">
                              <CalendarOutlined className="mt-1 text-blue-600" />
                              <div>
                                <div className="text-xs text-gray-600">
                                  Giờ khởi hành
                                </div>
                                <div className="font-semibold text-gray-800">
                                  {booking.trip?.departure_time
                                    ? formatTime(booking.trip.departure_time)
                                    : "-"}
                                </div>
                              </div>
                            </div>
                          </Col>
                          <Col xs={12} sm={8}>
                            <div className="flex items-start gap-2">
                              <EnvironmentOutlined className="mt-1 text-blue-600" />
                              <div>
                                <div className="text-xs text-gray-600">Xe</div>
                                <div className="font-semibold text-gray-800">
                                  {booking.trip?.vehicle?.plate_number || "N/A"}
                                </div>
                              </div>
                            </div>
                          </Col>
                        </Row>

                        {/* Seats */}
                        <div>
                          <div className="text-sm font-semibold text-gray-700 mb-2">
                            Ghế đã chọn
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {booking.seats && booking.seats.length > 0 ? (
                              booking.seats.map((seat) => (
                                <Tag
                                  key={seat.seat_number}
                                  color="blue"
                                  className="text-base py-1 px-2"
                                >
                                  Ghế {seat.seat_number}
                                </Tag>
                              ))
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Col>

                    {/* Right: Price & Actions */}
                    <Col xs={24} md={10}>
                      <div className="text-right">
                        {/* Price */}
                        <div className="mb-6">
                          <div className="text-sm text-gray-600 mb-1">
                            Tổng giá
                          </div>
                          <div className="text-3xl font-bold text-green-600">
                            {formatVND(booking.total_price)}
                          </div>
                        </div>

                        {/* Booking ID */}
                        <div className="text-xs text-gray-500 mb-6">
                          Mã đặt vé: {booking.id.substring(0, 8)}
                        </div>

                        {/* Actions */}
                        <Space direction="vertical" style={{ width: "100%" }}>
                          <Button
                            type="primary"
                            block
                            icon={<EyeOutlined />}
                            onClick={() =>
                              navigate(`/booking-details/${booking.id}`)
                            }
                          >
                            Xem chi tiết
                          </Button>

                          {canCancel && (
                            <Popconfirm
                              title="Hủy đặt vé"
                              description="Bạn có chắc chắn muốn hủy đặt vé này?"
                              onConfirm={() => handleCancel(booking.id)}
                              okText="Có"
                              cancelText="Không"
                            >
                              <Button
                                danger
                                block
                                icon={<DeleteOutlined />}
                                loading={cancelling === booking.id}
                              >
                                Hủy đặt vé
                              </Button>
                            </Popconfirm>
                          )}
                        </Space>
                      </div>
                    </Col>
                  </Row>
                </Card>
              );
            })}
          </Space>
        )}
      </div>
    </div>
  );
}
