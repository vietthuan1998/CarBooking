import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Form,
  Input,
  Select,
  Divider,
  message,
  Spin,
  Steps,
  Alert,
} from "antd";
import { ArrowLeftOutlined, CreditCardOutlined } from "@ant-design/icons";
import { useBookingStore } from "@/stores/bookingStore";
import { useAuthStore } from "@/stores/authStore";
import { getTripDetails } from "@/services/tripService";
import { createBooking } from "@/services/bookingService";
import { formatVND, formatTime, formatDate } from "@/constants/appConstants";

export default function BookingConfirm() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const { tripId, selectedSeats, totalPrice, clearBooking } = useBookingStore();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState<Awaited<
    ReturnType<typeof getTripDetails>
  > | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Load trip details
  useEffect(() => {
    if (!tripId) {
      message.warning("No trip selected");
      navigate("/");
      return;
    }

    const loadTrip = async () => {
      setLoading(true);
      try {
        const data = await getTripDetails(tripId);
        setTrip(data);
      } catch (error) {
        message.error("Failed to load trip details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadTrip();
  }, [tripId, navigate]);

  if (!tripId || selectedSeats.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <h2 className="text-xl font-bold mb-4">Không có chuyến được chọn</h2>
          <p className="text-gray-600 mb-6">
            Vui lòng quay lại và chọn ghế để tiếp tục
          </p>
          <Button type="primary" block onClick={() => navigate("/trips")}>
            Quay lại danh sách chuyến
          </Button>
        </Card>
      </div>
    );
  }

  const onFinish = async () => {
    if (!user?.id) {
      message.error("You must be logged in to confirm booking");
      return;
    }

    setConfirmLoading(true);
    try {
      // Create booking
      const seatIds = selectedSeats.map(
        (s) => `${tripId}-seat-${s.seatNumber}`,
      );

      await createBooking(user.id, tripId, seatIds, totalPrice);

      message.success("Booking confirmed! Check your email for details.");
      clearBooking();
      navigate("/my-bookings");
    } catch (error) {
      message.error("Failed to confirm booking. Please try again.");
      console.error(error);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          Quay lại
        </Button>

        {/* Progress Steps */}
        <Card className="border-0 shadow-md mb-6">
          <Steps
            current={1}
            items={[
              { title: "Chọn ghế", status: "finish" },
              { title: "Xác nhận đặt vé", status: "process" },
              { title: "Thanh toán", status: "wait" },
            ]}
          />
        </Card>

        <Row gutter={24}>
          {/* Left: Booking Form */}
          <Col xs={24} lg={16}>
            <Card className="border-0 shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Xác nhận đặt vé
              </h2>

              <Alert
                message="Vui lòng kiểm tra thông tin trước khi xác nhận"
                type="info"
                showIcon
                className="mb-6"
              />

              <Spin spinning={loading}>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  initialValues={{
                    email: user?.email || "",
                    fullName: user?.user_metadata?.full_name || "",
                    phone: user?.user_metadata?.phone || "",
                  }}
                >
                  {/* Trip Info */}
                  <div className="bg-blue-50 p-4 rounded mb-6">
                    <h3 className="font-semibold text-gray-800 mb-4">
                      Thông tin chuyến xe
                    </h3>
                    {trip ? (
                      <Row gutter={16}>
                        <Col xs={12}>
                          <div className="text-sm text-gray-600">Khởi hành</div>
                          <div className="font-semibold">
                            {formatTime(trip.departure_time)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(trip.departure_time)}
                          </div>
                        </Col>
                        <Col xs={12}>
                          <div className="text-sm text-gray-600">
                            Tuyến đường
                          </div>
                          <div className="font-semibold">
                            {trip.route?.origin} → {trip.route?.destination}
                          </div>
                        </Col>
                      </Row>
                    ) : (
                      <Spin size="small" />
                    )}
                  </div>

                  <Divider />

                  {/* Passenger Info */}
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Thông tin hành khách
                  </h3>

                  <Form.Item
                    label="Họ và tên"
                    name="fullName"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your full name",
                      },
                    ]}
                  >
                    <Input
                      placeholder="John Doe"
                      size="large"
                      disabled={confirmLoading}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: "Please enter your email" },
                      { type: "email", message: "Invalid email" },
                    ]}
                  >
                    <Input
                      placeholder="your@email.com"
                      size="large"
                      disabled={confirmLoading}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Số điện thoại"
                    name="phone"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your phone number",
                      },
                    ]}
                  >
                    <Input
                      placeholder="+84 9XXXXXXXX"
                      size="large"
                      disabled={confirmLoading}
                    />
                  </Form.Item>

                  <Divider />

                  {/* Selected Seats */}
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Ghế đã chọn
                  </h3>

                  <div className="bg-gray-50 p-4 rounded mb-6 space-y-2">
                    {selectedSeats.map((seat) => (
                      <div
                        key={seat.seatId}
                        className="flex justify-between items-center"
                      >
                        <span>Ghế số {seat.seatNumber}</span>
                        <span className="font-semibold text-green-600">
                          {formatVND(trip?.fare_price || 0)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Payment Method */}
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Phương thức thanh toán
                  </h3>

                  <Form.Item
                    label="Chọn phương thức"
                    name="paymentMethod"
                    initialValue="card"
                  >
                    <Select
                      options={[
                        { label: "Thẻ tín dụng / Debit", value: "card" },
                        { label: "Ví điện tử", value: "wallet" },
                        { label: "Chuyển khoản ngân hàng", value: "transfer" },
                      ]}
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      size="large"
                      block
                      loading={confirmLoading}
                      icon={<CreditCardOutlined />}
                      htmlType="submit"
                    >
                      Tiếp tục thanh toán
                    </Button>
                  </Form.Item>
                </Form>
              </Spin>
            </Card>
          </Col>

          {/* Right: Summary */}
          <Col xs={24} lg={8}>
            <Card className="border-0 shadow-md sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Tóm tắt</h2>

              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="large"
              >
                {/* Trip Summary */}
                <div className="bg-blue-50 p-4 rounded">
                  <div className="text-sm text-gray-600 mb-2">Chuyến xe</div>
                  <div className="font-semibold text-gray-800">
                    {trip?.route?.origin} → {trip?.route?.destination}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {trip && formatTime(trip.departure_time)}
                  </div>
                </div>

                {/* Passengers */}
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">
                    Hành khách ({selectedSeats.length})
                  </div>
                  {selectedSeats.map((seat) => (
                    <div
                      key={seat.seatId}
                      className="text-sm text-gray-600 py-1"
                    >
                      • Ghế {seat.seatNumber}
                    </div>
                  ))}
                </div>

                <Divider style={{ margin: "12px 0" }} />

                {/* Pricing */}
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>
                      {selectedSeats.length} ghế ×{" "}
                      {formatVND(trip?.fare_price || 0)}
                    </span>
                    <span className="font-semibold">
                      {formatVND(totalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Phí dịch vụ</span>
                    <span className="font-semibold">-</span>
                  </div>

                  <div
                    className="flex justify-between text-lg font-bold bg-green-50 -mx-4 -mb-4 px-4 py-3 rounded"
                    style={{ borderRadius: "0 0 8px 8px" }}
                  >
                    <span className="text-gray-800">Tổng cộng:</span>
                    <span className="text-green-600">
                      {formatVND(totalPrice)}
                    </span>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}
