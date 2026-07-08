import { useState } from "react";
import type * as React from "react";
import { Link } from "react-router-dom";
import { signOut, signUp } from "../../services/authService";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 6) {
      setErrorMessage("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");

      const { error } = await signUp(email, password, fullName, phone);
      if (error) {
        setErrorMessage(
          error.message.includes("already registered")
            ? "Email này đã được đăng ký."
            : "Đăng ký thất bại. Vui lòng thử lại.",
        );
        return;
      }

      // signUp có thể tự tạo session cho tài khoản mới (tùy cấu hình xác
      // thực email); tài khoản chưa được duyệt nên đăng xuất luôn cho sạch.
      await signOut();
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      setErrorMessage("Đăng ký thất bại. Vui lòng thử lại.");
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
            Đăng ký tài khoản
          </p>

          <h2 className="text-4xl font-black leading-tight">
            Tham gia đội ngũ vận hành Limo Green.
          </h2>

          <p className="mt-5 text-base leading-7 text-gray-300">
            Tạo tài khoản để bắt đầu. Tài khoản mới cần được quản trị viên
            kích hoạt trước khi sử dụng.
          </p>
        </div>

        <p className="text-sm text-gray-400">
          © 2026 Limo Green Booking Manager
        </p>
      </div>

      <div className="flex w-full items-center justify-center px-5 lg:w-[520px]">
        <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl shadow-gray-200/70 ring-1 ring-gray-100">
          {isSuccess ? (
            <div>
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
                ✅
              </div>

              <h1 className="text-3xl font-black text-gray-900">
                Đăng ký thành công
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-500">
                Tài khoản của bạn đã được tạo và đang{" "}
                <span className="font-bold text-gray-700">
                  chờ quản trị viên kích hoạt
                </span>
                . Bạn sẽ đăng nhập được sau khi tài khoản được duyệt.
              </p>

              <Link
                to="/login"
                className="mt-8 flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700"
              >
                Về trang đăng nhập
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
                  📝
                </div>

                <h1 className="text-3xl font-black text-gray-900">Đăng ký</h1>

                <p className="mt-2 text-sm text-gray-500">
                  Tài khoản mới cần quản trị viên kích hoạt trước khi dùng.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="signup-full-name"
                    className="mb-2 block text-sm font-bold text-gray-700"
                  >
                    Họ và tên
                  </label>

                  <input
                    id="signup-full-name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Nguyễn Văn A"
                    required
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="signup-phone"
                    className="mb-2 block text-sm font-bold text-gray-700"
                  >
                    Số điện thoại
                  </label>

                  <input
                    id="signup-phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="0901234567"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="signup-email"
                    className="mb-2 block text-sm font-bold text-gray-700"
                  >
                    Email
                  </label>

                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="ban@email.com"
                    required
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="signup-password"
                    className="mb-2 block text-sm font-bold text-gray-700"
                  >
                    Mật khẩu
                  </label>

                  <input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    required
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLoading ? "Đang đăng ký..." : "Đăng ký"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                Đã có tài khoản?{" "}
                <Link
                  to="/login"
                  className="font-bold text-emerald-600 transition hover:text-emerald-700"
                >
                  Đăng nhập
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
