import { useState } from "react";
import type * as React from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentProfile, signIn } from "./../../services/authService";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();

  try {
    setIsLoading(true);
    setErrorMessage("");

    const { error } = await signIn(email, password);

    if (error) {
      setErrorMessage("Email hoặc mật khẩu không đúng.");
      return;
    }

    const profile = await getCurrentProfile();

    if (!profile) {
      setErrorMessage("Không tìm thấy hồ sơ người dùng trong hệ thống.");
      return;
    }

    if (profile.status !== "active") {
      setErrorMessage("Tài khoản của bạn đang bị khóa hoặc chưa được kích hoạt.");
      return;
    }

    if (profile.role !== "admin" && profile.role !== "dispatcher") {
      setErrorMessage("Bạn không có quyền truy cập trang quản trị.");
      return;
    }

    navigate("/dashboard", { replace: true });
  } catch (error) {
    console.error(error);
    setErrorMessage("Đăng nhập thất bại. Vui lòng thử lại.");
  } finally {
    setIsLoading(false);
  }
}
  return (
    <div className="flex min-h-screen bg-[#F4F7F6]">
      <div className="hidden flex-1 bg-gradient-to-br from-[#06161A] via-[#0A242A] to-[#0F3D34] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-xl font-black shadow-lg shadow-emerald-500/30">
            L
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-wide">
              <span className="text-emerald-400">LIMO</span>GREEN
            </h1>
            <p className="text-sm text-gray-300">Booking Manager</p>
          </div>
        </div>

        <div className="max-w-xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-emerald-300">
            Admin Dashboard
          </p>

          <h2 className="text-4xl font-black leading-tight">
            Quản lý chuyến xe, booking, tài xế và khách hàng.
          </h2>

          <p className="mt-5 text-base leading-7 text-gray-300">
            Đăng nhập để theo dõi tình trạng chuyến đi, điều phối xe và xử lý booking trong hệ thống.
          </p>
        </div>

        <p className="text-sm text-gray-400">
          © 2026 Limo Green Booking Manager
        </p>
      </div>

      <div className="flex w-full items-center justify-center px-5 lg:w-[520px]">
        <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl shadow-gray-200/70 ring-1 ring-gray-100">
          <div className="mb-8">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
              🔐
            </div>

            <h1 className="text-3xl font-black text-gray-900">
              Đăng nhập
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Dành cho Admin và Điều phối viên.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@gmail.com"
                required
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-700">
                Mật khẩu
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Nhập mật khẩu"
                required
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}