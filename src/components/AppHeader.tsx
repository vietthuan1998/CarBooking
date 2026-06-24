import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Button, Dropdown, Space, Avatar, Drawer } from "antd";
import { MenuOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useAuthStore } from "@/stores/authStore";
import { signOut } from "@/services/authService";

const { Header } = Layout;

export default function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuthStore();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    navigate("/");
  };

  const userMenu = [
    {
      key: "1",
      label: "My Profile",
      onClick: () => navigate("/profile"),
    },
    {
      key: "2",
      label: "My Bookings",
      onClick: () => navigate("/my-bookings"),
    },
    {
      key: "3",
      label: "Settings",
      onClick: () => navigate("/settings"),
    },
    {
      type: "divider",
    },
    {
      key: "4",
      label: "Logout",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  const navItems = user
    ? [
        {
          key: "/",
          label: "Home",
          onClick: () => navigate("/"),
        },
        {
          key: "/trips",
          label: "Search Trips",
          onClick: () => navigate("/trips"),
        },
        {
          key: "/my-bookings",
          label: "My Bookings",
          onClick: () => navigate("/my-bookings"),
        },
      ]
    : [
        {
          key: "/",
          label: "Home",
          onClick: () => navigate("/"),
        },
      ];

  return (
    <Header
      style={{
        background: "linear-gradient(135deg, #1890ff 0%, #5b4cf5 100%)",
        padding: "0 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          color: "white",
          cursor: "pointer",
        }}
        onClick={() => navigate("/")}
      >
        🚗 CarShare
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-8">
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[location.pathname]}
          items={navItems}
          style={{
            background: "transparent",
            borderBottom: "none",
          }}
        />

        {/* User Actions */}
        <Space>
          {user ? (
            <Dropdown menu={{ items: userMenu }} placement="bottomRight">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  padding: "4px 12px",
                  borderRadius: "4px",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "white",
                }}
              >
                <Avatar
                  size={32}
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: "#87d068",
                  }}
                />
                <span className="text-white text-sm font-semibold">
                  {user.user_metadata?.full_name || user.email?.split("@")[0]}
                </span>
              </div>
            </Dropdown>
          ) : (
            <>
              <Button type="primary" ghost onClick={() => navigate("/login")}>
                Sign In
              </Button>
              <Button
                style={{
                  background: "white",
                  color: "#1890ff",
                  border: "none",
                }}
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </Button>
            </>
          )}
        </Space>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <Button
          type="primary"
          ghost
          icon={<MenuOutlined />}
          onClick={() => setMobileDrawerOpen(true)}
        />

        {/* Mobile Drawer */}
        <Drawer
          title="Menu"
          placement="right"
          onClose={() => setMobileDrawerOpen(false)}
          open={mobileDrawerOpen}
        >
          <Menu
            mode="vertical"
            selectedKeys={[location.pathname]}
            items={navItems}
            onClick={() => setMobileDrawerOpen(false)}
          />

          {user ? (
            <div className="mt-8 pt-8 border-t">
              <div className="flex items-center gap-2 mb-4">
                <Avatar
                  size={40}
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: "#87d068",
                  }}
                />
                <div>
                  <div className="font-semibold">
                    {user.user_metadata?.full_name || user.email?.split("@")[0]}
                  </div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                </div>
              </div>

              <Menu
                mode="vertical"
                items={[
                  {
                    key: "profile",
                    label: "My Profile",
                    onClick: () => {
                      navigate("/profile");
                      setMobileDrawerOpen(false);
                    },
                  },
                  {
                    key: "bookings",
                    label: "My Bookings",
                    onClick: () => {
                      navigate("/my-bookings");
                      setMobileDrawerOpen(false);
                    },
                  },
                  {
                    key: "settings",
                    label: "Settings",
                    onClick: () => {
                      navigate("/settings");
                      setMobileDrawerOpen(false);
                    },
                  },
                  {
                    type: "divider",
                  },
                  {
                    key: "logout",
                    label: "Logout",
                    icon: <LogoutOutlined />,
                    onClick: handleLogout,
                  },
                ]}
              />
            </div>
          ) : (
            <div className="mt-8 space-y-2">
              <Button
                type="primary"
                block
                onClick={() => {
                  navigate("/login");
                  setMobileDrawerOpen(false);
                }}
              >
                Sign In
              </Button>
              <Button
                block
                onClick={() => {
                  navigate("/signup");
                  setMobileDrawerOpen(false);
                }}
              >
                Sign Up
              </Button>
            </div>
          )}
        </Drawer>
      </div>
    </Header>
  );
}
