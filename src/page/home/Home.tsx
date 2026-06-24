import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Form,
  Button,
  Select,
  DatePicker,
  Space,
  Divider,
  Statistic,
} from "antd";
import dayjs from "dayjs";
import { SwapOutlined, CarOutlined, TeamOutlined } from "@ant-design/icons";
import { ROUTES } from "@/constants/appConstants";

export default function Home() {
  const [form] = Form.useForm();
  const [swapped, setSwapped] = useState(false);
  const navigate = useNavigate();

  const currentRoute = swapped ? ROUTES.DA_NANG_TO_HUE : ROUTES.HUE_TO_DA_NANG;

  const handleSwap = () => {
    setSwapped(!swapped);
    form.setFieldValue("departure", "");
    form.setFieldValue("arrival", "");
  };

  interface HomeFormValues {
    date?: dayjs.Dayjs;
    passengers?: number;
  }

  const onSearch = (values: HomeFormValues) => {
    const dateStr = values.date?.format("YYYY-MM-DD");
    navigate(
      `/trips?route=${currentRoute.id}&date=${dateStr}&passengers=${
        values.passengers || 1
      }`,
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-2">CarShare</h1>
          <p className="text-xl opacity-90">
            Chia sẻ chuyến xe từ Huế đến Đà Nẵng - Tiết kiệm chi phí, gặp gỡ bạn
            mới
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Main Search Card */}
        <Card className="shadow-2xl mb-8 border-0">
          <Row gutter={24}>
            <Col xs={24} md={18}>
              <Form form={form} layout="vertical" onFinish={onSearch}>
                <Row gutter={16}>
                  {/* Route Selection */}
                  <Col xs={24} md={8}>
                    <Form.Item label="Tuyến đường" required className="mb-0">
                      <Space direction="vertical" style={{ width: "100%" }}>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div>
                            <div className="font-semibold text-gray-800">
                              {currentRoute.origin}
                            </div>
                            <div className="text-sm text-gray-600">
                              Từ {currentRoute.distance} km
                            </div>
                          </div>
                          <SwapOutlined
                            className="text-2xl cursor-pointer text-blue-600 hover:text-blue-800"
                            onClick={handleSwap}
                          />
                          <div className="text-right">
                            <div className="font-semibold text-gray-800">
                              {currentRoute.destination}
                            </div>
                            <div className="text-sm text-gray-600">
                              ~{currentRoute.estimatedDuration}h
                            </div>
                          </div>
                        </div>
                      </Space>
                    </Form.Item>
                  </Col>

                  {/* Date Selection */}
                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Ngày khởi hành"
                      name="date"
                      rules={[
                        { required: true, message: "Vui lòng chọn ngày" },
                      ]}
                      initialValue={dayjs().add(1, "day")}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        disabledDate={(current) =>
                          current && current < dayjs().startOf("day")
                        }
                        placeholder="Chọn ngày"
                      />
                    </Form.Item>
                  </Col>

                  {/* Passengers */}
                  <Col xs={24} md={8}>
                    <Form.Item
                      label="Số hành khách"
                      name="passengers"
                      initialValue={1}
                    >
                      <Select
                        options={[
                          { label: "1 người", value: 1 },
                          { label: "2 người", value: 2 },
                          { label: "3 người", value: 3 },
                          { label: "4 người", value: 4 },
                          { label: "5 người", value: 5 },
                          { label: "6 người", value: 6 },
                          { label: "7 người", value: 7 },
                        ]}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item>
                  <Button
                    type="primary"
                    size="large"
                    block
                    htmlType="submit"
                    className="h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700"
                  >
                    Tìm chuyến xe
                  </Button>
                </Form.Item>
              </Form>
            </Col>

            {/* Stats */}
            <Col xs={24} md={6}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Statistic
                  title="Chuyến xe"
                  value={15}
                  prefix={<CarOutlined />}
                />
                <Divider style={{ margin: "12px 0" }} />
                <Statistic
                  title="Hành khách"
                  value={240}
                  prefix={<TeamOutlined />}
                />
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Feature Cards */}
        <Row gutter={24}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow text-center">
              <CarOutlined className="text-4xl text-blue-600 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Xe tiện nghi</h3>
              <p className="text-gray-600 text-sm">
                Xe 4 & 7 chỗ sạch sẽ, an toàn
              </p>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow text-center">
              <TeamOutlined className="text-4xl text-green-600 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Chia sẻ chi phí</h3>
              <p className="text-gray-600 text-sm">
                Giá rẻ, tiết kiệm so với taxi
              </p>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="text-4xl text-purple-600 mb-4">🛡️</div>
              <h3 className="font-semibold text-lg mb-2">An toàn</h3>
              <p className="text-gray-600 text-sm">
                Xác minh hành khách, theo dõi chuyến xe
              </p>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="text-4xl text-orange-600 mb-4">⚡</div>
              <h3 className="font-semibold text-lg mb-2">Nhanh chóng</h3>
              <p className="text-gray-600 text-sm">Đặt vé chỉ trong vài phút</p>
            </Card>
          </Col>
        </Row>

        {/* Footer info */}
        <Card className="mt-12 border-0 shadow-md bg-blue-50">
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <h3 className="font-semibold text-lg mb-4">
                Tuyến Huế - Đà Nẵng
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Cách quãng: {ROUTES.HUE_TO_DA_NANG.distance} km</li>
                <li>
                  ✓ Thời gian: ~{ROUTES.HUE_TO_DA_NANG.estimatedDuration} giờ
                </li>
                <li>✓ Xe 4-7 chỗ có sẵn</li>
                <li>✓ Chuyến xe mỗi 2 tiếng</li>
              </ul>
            </Col>
            <Col xs={24} md={12}>
              <h3 className="font-semibold text-lg mb-4">Cách sử dụng</h3>
              <ol className="space-y-2 text-gray-700 list-decimal list-inside">
                <li>Chọn ngày và tuyến đường</li>
                <li>Xem danh sách chuyến xe</li>
                <li>Chọn ghế và thanh toán</li>
                <li>Nhận vé điện tử qua email</li>
              </ol>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
}
