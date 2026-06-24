import { Layout, FloatButton } from "antd";
import { PhoneOutlined, MessageOutlined } from "@ant-design/icons";
import AppHeader from "@/components/AppHeader";

const { Content, Footer } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader />

      <Content>{children}</Content>

      <Footer
        style={{
          background: "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
          textAlign: "center",
          marginTop: "64px",
          borderTop: "1px solid #d9d9d9",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 px-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">About Us</h4>
              <p className="text-sm text-gray-600">
                CarShare is your trusted platform for affordable and safe
                ride-sharing between Huế and Đà Nẵng.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Quick Links</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  <a href="/" className="hover:text-blue-600">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/trips" className="hover:text-blue-600">
                    Find Trips
                  </a>
                </li>
                <li>
                  <a href="/my-bookings" className="hover:text-blue-600">
                    My Bookings
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Support</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>Email: support@carshare.com</li>
                <li>Phone: 1900 1234</li>
                <li>Hours: 6:00 AM - 10:00 PM</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-300 pt-4 text-sm text-gray-600">
            © 2025 CarShare. All rights reserved.
            <div className="mt-2 space-x-4">
              <a href="#" className="hover:text-blue-600">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-blue-600">
                Terms of Service
              </a>
              <a href="#" className="hover:text-blue-600">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </Footer>

      {/* Floating Contact Buttons */}
      <FloatButton.Group
        trigger="hover"
        type="primary"
        style={{ right: 24, bottom: 24 }}
        icon={<MessageOutlined />}
      >
        <FloatButton
          icon={<PhoneOutlined />}
          onClick={() => (window.location.href = "tel:1900-1234")}
          tooltip="Call Support"
        />
        <FloatButton
          icon={<MessageOutlined />}
          onClick={() => (window.location.href = "mailto:support@carshare.com")}
          tooltip="Email Support"
        />
      </FloatButton.Group>
    </Layout>
  );
}
