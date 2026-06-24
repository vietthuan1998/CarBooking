import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, Card, Spin, message } from "antd";
import { signIn } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";

export default function Login() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await signIn(values.email, values.password);

      if (response.error) {
        message.error(response.error.message || "Sign in failed");
      } else if (response.user) {
        setUser(response.user);
        message.success("Sign in successful!");
        navigate("/");
      }
    } catch (err) {
      message.error("An error occurred during sign in");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">CarShare</h1>
          <p className="text-gray-600 mt-2">Huế ↔ Đà Nẵng</p>
        </div>

        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Sign In
        </h2>

        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Invalid email format" },
              ]}
            >
              <Input
                placeholder="your@email.com"
                size="large"
                disabled={loading}
              />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
              ]}
            >
              <Input.Password
                placeholder="••••••••"
                size="large"
                disabled={loading}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                disabled={loading}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>
        </Spin>

        <div className="text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
