import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Spin,
  Empty,
  Divider,
  Tag,
  Timeline,
  message,
  Popconfirm,
} from "antd";
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  DeleteOutlined,
  DownloadOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { getBookingDetails, cancelBooking } from "@/services/bookingService";
import type { BookingWithDetails } from "@/services/bookingService";
import {
  formatVND,
  formatTime,
  formatDate,
  formatDateTime,
} from "@/constants/appConstants";

export default function BookingDetails() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getBookingDetails(bookingId);
        setBooking(data);
      } catch (err) {
        setError("Failed to load booking details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId]);

  const handleCancel = async () => {
    if (!bookingId) return;
    setCancelling(true);
    try {
      await cancelBooking(bookingId);
      message.success("Booking cancelled successfully");
      setBooking((prev) =>
        prev ? { ...prev, booking_status: "cancelled" } : null,
      );
    } catch (error) {
      message.error("Failed to cancel booking");
      console.error(error);
    } finally {
      setCancelling(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="Loading booking details..." />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <Empty
            description="Error"
            description={error || "Booking not found"}
          />
          <div className="text-center mt-4">
            <Button onClick={() => navigate("/my-bookings")}>
              Quay lại danh sách
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isCancelled = booking.booking_status === "cancelled";
  const isCompleted = booking.booking_status === "completed";
  const canCancel =
    !isCancelled &&
    !isCompleted &&
    booking.trip?.departure_time &&
    new Date(booking.trip.departure_time) > new Date();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/my-bookings")}
          className="mb-4"
        >
          Quay lại danh sách
        </Button>

        <Row gutter={24}>
          {/* Main Content */}
          <Col xs={24} lg={16}>
            <Card className="border-0 shadow-md mb-6">
              {/* Status & ID */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Chi tiết đặt vé
                  </h1>
                  <p className="text-gray-600">
                    Mã đặt vé:{" "}
                    <span className="font-mono font-semibold">
                      {booking.id}
                    </span>
                  </p>
                </div>
                <Tag
                  color={getStatusColor(booking.booking_status)}
                  className="px-3 py-1 text-base"
                >
                  {getStatusLabel(booking.booking_status)}
                </Tag>
              </div>

              <Divider />

              {/* Trip Information */}
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Thông tin chuyến xe
              </h3>

              <Row gutter={24} className="mb-6">
                <Col xs={24} sm={12}>
                  <div className="bg-blue-50 p-4 rounded">
                    <div className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                      <EnvironmentOutlined />
                      Tuyến đường
                    </div>
                    <div className="text-lg font-bold text-gray-800">
                      {booking.trip?.route?.origin} →{" "}
                      {booking.trip?.route?.destination}
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="bg-blue-50 p-4 rounded">
                    <div className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                      <CalendarOutlined />
                      Ngày khởi hành
                    </div>
                    <div className="text-lg font-bold text-gray-800">
                      {booking.trip?.departure_time
                        ? formatDate(booking.trip.departure_time)
                        : "-"}
                    </div>
                  </div>
                </Col>
              </Row>

              <Row gutter={24} className="mb-6">
                <Col xs={24} sm={12}>
                  <div className="bg-green-50 p-4 rounded">
                    <div className="text-sm text-gray-600 mb-2">
                      Giờ khởi hành
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {booking.trip?.departure_time
                        ? formatTime(booking.trip.departure_time)
                        : "-"}
                    </div>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div className="bg-purple-50 p-4 rounded">
                    <div className="text-sm text-gray-600 mb-2">Xe</div>
                    <div className="text-lg font-bold text-gray-800">
                      {booking.trip?.vehicle?.plate_number} (
                      {booking.trip?.vehicle?.seat_count} chỗ)
                    </div>
                  </div>
                </Col>
              </Row>

              <Divider />

              {/* Passengers & Seats */}
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Hành khách & Ghế
              </h3>

              <div className="bg-gray-50 p-4 rounded mb-6 space-y-3">
                {booking.seats && booking.seats.length > 0 ? (
                  booking.seats.map((seat, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0"
                    >
                      <span className="font-semibold text-gray-800">
                        Hành khách {index + 1}
                      </span>
                      <Tag color="blue" className="text-base py-1 px-2">
                        Ghế {seat.seat_number}
                      </Tag>
                    </div>
                  ))
                ) : (
                  <span className="text-gray-500">Không có ghế nào</span>
                )}
              </div>

              <Divider />

              {/* Timeline */}
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Lịch sử đặt vé
              </h3>

              <Timeline
                items={[
                  {
                    color: "green",
                    children: (
                      <div>
                        <p className="font-semibold">Đặt vé thành công</p>
                        <p className="text-gray-600 text-sm">
                          {booking.created_at
                            ? formatDateTime(booking.created_at)
                            : "N/A"}
                        </p>
                      </div>
                    ),
                  },
                  {
                    color:
                      booking.booking_status === "confirmed" ? "blue" : "gray",
                    children: (
                      <div>
                        <p className="font-semibold">
                          {booking.booking_status === "confirmed"
                            ? "Vé đã được xác nhận"
                            : "Chờ xác nhận"}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {booking.updated_at
                            ? formatDateTime(booking.updated_at)
                            : "N/A"}
                        </p>
                      </div>
                    ),
                  },
                  {
                    color:
                      booking.booking_status === "completed" ||
                      booking.booking_status === "in_transit"
                        ? "green"
                        : "gray",
                    children: (
                      <div>
                        <p className="font-semibold">
                          {booking.booking_status === "completed"
                            ? "Chuyến xe hoàn tất"
                            : "Chờ khởi hành"}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {booking.trip?.departure_time
                            ? formatDateTime(booking.trip.departure_time)
                            : "N/A"}
                        </p>
                      </div>
                    ),
                  },
                ]}
              />
            </Card>
          </Col>

          {/* Right: Summary & Actions */}
          <Col xs={24} lg={8}>
            <Card className="border-0 shadow-md sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Tóm tắt thanh toán
              </h2>

              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="large"
              >
                {/* Price Details */}
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>
                      {booking.seats?.length || 0} ghế ×{" "}
                      {formatVND(booking.trip?.fare_price || 0)}
                    </span>
                    <span className="font-semibold">
                      {formatVND(
                        (booking.seats?.length || 0) *
                          (booking.trip?.fare_price || 0) || 0,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Phí dịch vụ</span>
                    <span>-</span>
                  </div>

                  <div className="flex justify-between text-lg font-bold bg-green-50 -mx-4 -mb-4 px-4 py-3 rounded-b">
                    <span className="text-gray-800">Tổng cộng:</span>
                    <span className="text-green-600">
                      {formatVND(booking.total_price)}
                    </span>
                  </div>
                </div>

                <Divider style={{ margin: "12px 0" }} />

                {/* Actions */}
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Button
                    type="primary"
                    block
                    icon={<PrinterOutlined />}
                    onClick={() => window.print()}
                  >
                    In vé
                  </Button>

                  <Button
                    block
                    icon={<DownloadOutlined />}
                    onClick={() =>
                      message.info("Tính năng tải xuống sẽ sớm có")
                    }
                  >
                    Tải xuống PDF
                  </Button>

                  {canCancel && (
                    <Popconfirm
                      title="Hủy đặt vé"
                      description="Bạn có chắc chắn muốn hủy đặt vé này? Bạn có thể nhận lại tiền."
                      onConfirm={handleCancel}
                      okText="Có"
                      cancelText="Không"
                    >
                      <Button
                        danger
                        block
                        icon={<DeleteOutlined />}
                        loading={cancelling}
                      >
                        Hủy đặt vé
                      </Button>
                    </Popconfirm>
                  )}
                </Space>

                <Divider style={{ margin: "12px 0" }} />

                {/* Support */}
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Cần trợ giúp?
                  </h4>
                  <Space
                    direction="vertical"
                    style={{ width: "100%" }}
                    className="text-sm"
                  >
                    <div className="flex items-center gap-2 text-gray-600 hover:text-blue-600 cursor-pointer">
                      <PhoneOutlined />
                      <span>1900 1234</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 hover:text-blue-600 cursor-pointer">
                      <MailOutlined />
                      <span>support@carshare.com</span>
                    </div>
                  </Space>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
