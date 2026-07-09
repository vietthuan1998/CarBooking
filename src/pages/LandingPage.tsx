import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeDollarSign,
  CalendarClock,
  CarFront,
  CheckCircle2,
  MapPinHouse,
  Phone,
} from "lucide-react";
import type { Route } from "@/features/booking/types";
import { getActiveRoutes } from "@/services/bookingService";
import { registerBooking } from "@/services/landingService";
import { fCurrency } from "@/utils/helpers";

const HOTLINE = "0905 000 000";

/** yyyy-mm-dd theo giờ local (toInputValue của helpers dùng UTC, lệch ngày trước 7h sáng VN). */
function todayInputValue(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

const FEATURES = [
  {
    icon: MapPinHouse,
    title: "Đón & trả tận nơi",
    desc: "Xe đón bạn tại nhà ở Huế, Đà Nẵng hoặc Hội An — không cần ra bến.",
  },
  {
    icon: CarFront,
    title: "Xe 4 – 7 chỗ đời mới",
    desc: "Đội xe được kiểm định định kỳ, tài xế nhiều năm kinh nghiệm tuyến đèo Hải Vân.",
  },
  {
    icon: CalendarClock,
    title: "Khung giờ linh hoạt",
    desc: "Các chuyến chạy liên tục từ 5:00 đến 20:00 hằng ngày, hai chiều đi và về.",
  },
  {
    icon: BadgeDollarSign,
    title: "Giá cố định theo tuyến",
    desc: "Giá niêm yết theo ghế, không phụ phí phát sinh, thanh toán khi lên xe.",
  },
];

interface RegisterForm {
  route_id: string;
  date: string;
  time: string;
  seat_count: number;
  customer_name: string;
  customer_phone: string;
  pickup_address: string;
  dropoff_address: string;
  note: string;
}

const INITIAL_FORM: RegisterForm = {
  route_id: "",
  date: todayInputValue(),
  time: "",
  seat_count: 1,
  customer_name: "",
  customer_phone: "",
  pickup_address: "",
  dropoff_address: "",
  note: "",
};

export default function LandingPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [form, setForm] = useState<RegisterForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingCode, setBookingCode] = useState<string | null>(null);

  useEffect(() => {
    getActiveRoutes().then(setRoutes).catch(() => setRoutes([]));
  }, []);

  const update = (patch: Partial<RegisterForm>) =>
    setForm((f) => ({ ...f, ...patch }));

  const selectedRoute = routes.find((r) => r.id === form.route_id) ?? null;
  const total = selectedRoute
    ? selectedRoute.base_price * form.seat_count
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.route_id) return setError("Vui lòng chọn tuyến đi");
    if (!form.date || !form.time) {
      return setError("Vui lòng chọn ngày và giờ đi");
    }
    // Ghép ngày + giờ theo local time — khách chọn giờ tự do, staff dựa vào
    // đây để xếp xe phù hợp
    const departure = new Date(`${form.date}T${form.time}`);
    if (Number.isNaN(departure.getTime())) {
      return setError("Ngày giờ đi không hợp lệ");
    }
    if (departure.getTime() <= Date.now()) {
      return setError("Giờ đi phải ở tương lai");
    }
    if (!form.customer_name.trim()) {
      return setError("Vui lòng nhập họ và tên");
    }
    if (!/^\d{9,11}$/.test(form.customer_phone.replace(/[\s.-]/g, ""))) {
      return setError("Số điện thoại không hợp lệ");
    }

    setSubmitting(true);
    try {
      const code = await registerBooking({
        route_id: form.route_id,
        requested_departure_time: departure.toISOString(),
        seat_count: form.seat_count,
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim(),
        pickup_address: form.pickup_address.trim() || undefined,
        dropoff_address: form.dropoff_address.trim() || undefined,
        note: form.note.trim() || undefined,
      });
      setBookingCode(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng ký thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10";
  const labelClass = "mb-1.5 block text-sm font-semibold text-gray-700";

  return (
    <div className="min-h-dvh bg-[#F4F7F6] text-slate-900">
      {/* Header */}
      <header className="bg-[#06191D]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500 text-lg font-black text-white shadow-lg shadow-emerald-500/30">
              L
            </div>
            <div>
              <p className="text-xl font-black tracking-wide">
                <span className="text-emerald-400">LIMO</span>
                <span className="text-white">GREEN</span>
              </p>
              <p className="text-xs font-semibold tracking-[0.18em] text-emerald-300">
                HUẾ - ĐÀ NẴNG - HỘI AN
              </p>
            </div>
          </div>
          <Link
            to="/login"
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Đăng nhập
          </Link>
        </div>

        {/* Hero */}
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 text-center sm:px-6 sm:pt-16">
          <h1 className="mx-auto max-w-3xl text-3xl font-black leading-tight text-white sm:text-5xl">
            Xe ghép <span className="text-emerald-400">Huế ↔ Đà Nẵng · Hội An</span>{" "}
            đón tận nơi, đi trong ngày
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-emerald-100/80 sm:text-base">
            Đặt chỗ trước, xe đón đúng giờ tại địa chỉ của bạn. Chạy liên tục
            hằng ngày từ 5:00 đến 20:00, giá cố định theo tuyến.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#dang-ky"
              className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
            >
              Đăng ký chuyến ngay
            </a>
            <a
              href={`tel:${HOTLINE.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/20"
            >
              <Phone size={16} /> {HOTLINE}
            </a>
          </div>
        </div>
      </header>

      {/* Điểm mạnh dịch vụ */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <f.icon size={22} />
              </div>
              <h3 className="mb-1 text-base font-bold text-slate-900">
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form đăng ký */}
      <section id="dang-ky" className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-black text-slate-900">Đăng ký chuyến</h2>
          <p className="mt-1 mb-6 text-sm text-slate-500">
            Chọn chuyến và để lại thông tin — nhân viên sẽ gọi xác nhận chỗ
            trong thời gian sớm nhất. Đăng ký chưa giữ ghế cố định.
          </p>

          {bookingCode ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
              <CheckCircle2 className="mx-auto mb-3 text-emerald-600" size={40} />
              <p className="font-bold text-emerald-800">
                Đăng ký thành công! Mã đặt chỗ của bạn:
              </p>
              <p className="mt-2 font-mono text-lg font-black text-emerald-700">
                {bookingCode}
              </p>
              <p className="mt-3 text-sm text-emerald-700">
                Chúng tôi sẽ liên hệ qua số điện thoại của bạn để xác nhận ghế.
              </p>
              <button
                type="button"
                onClick={() => {
                  setBookingCode(null);
                  setForm(INITIAL_FORM);
                }}
                className="mt-5 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Đăng ký chuyến khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="landing-route" className={labelClass}>
                    Tuyến đi <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="landing-route"
                    value={form.route_id}
                    onChange={(e) =>
                      update({ route_id: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="">-- Chọn tuyến --</option>
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.route_name} ({fCurrency(r.base_price)}/ghế)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="landing-date" className={labelClass}>
                    Ngày đi <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="landing-date"
                    type="date"
                    min={todayInputValue()}
                    value={form.date}
                    onChange={(e) =>
                      update({ date: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="landing-time" className={labelClass}>
                    Giờ đi <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="landing-time"
                    type="time"
                    value={form.time}
                    onChange={(e) => update({ time: e.target.value })}
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Chọn giờ bạn muốn đi — chúng tôi sẽ xếp xe phù hợp và gọi
                    xác nhận.
                  </p>
                </div>
                <div>
                  <label htmlFor="landing-seats" className={labelClass}>
                    Số ghế <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="landing-seats"
                    value={form.seat_count}
                    onChange={(e) =>
                      update({ seat_count: Number(e.target.value) })
                    }
                    className={inputClass}
                  >
                    {Array.from({ length: 7 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} ghế
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="landing-name" className={labelClass}>
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="landing-name"
                    placeholder="VD: Nguyễn Văn A"
                    value={form.customer_name}
                    onChange={(e) => update({ customer_name: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="landing-phone" className={labelClass}>
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="landing-phone"
                    placeholder="VD: 0901234567"
                    value={form.customer_phone}
                    onChange={(e) => update({ customer_phone: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="landing-pickup" className={labelClass}>
                    Địa chỉ đón
                  </label>
                  <input
                    id="landing-pickup"
                    placeholder="Xe sẽ đến đón tại đây"
                    value={form.pickup_address}
                    onChange={(e) => update({ pickup_address: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="landing-dropoff" className={labelClass}>
                    Địa chỉ trả
                  </label>
                  <input
                    id="landing-dropoff"
                    placeholder="Điểm bạn muốn xuống xe"
                    value={form.dropoff_address}
                    onChange={(e) =>
                      update({ dropoff_address: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="landing-note" className={labelClass}>
                  Ghi chú
                </label>
                <textarea
                  id="landing-note"
                  rows={2}
                  placeholder="Yêu cầu thêm (mang nhiều hành lý, đi cùng trẻ nhỏ...)"
                  value={form.note}
                  onChange={(e) => update({ note: e.target.value })}
                  className={inputClass}
                />
              </div>

              {total !== null && (
                <p className="text-sm text-slate-600">
                  Tạm tính:{" "}
                  <span className="font-bold text-emerald-600">
                    {fCurrency(total)}
                  </span>{" "}
                  ({form.seat_count} ghế) — thanh toán khi lên xe.
                </p>
              )}

              {error && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {submitting ? "Đang gửi..." : "Gửi đăng ký"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#06191D] py-8 text-center text-sm text-emerald-100/70">
        <p>
          Cần hủy hoặc đổi chuyến? Vui lòng gọi hotline{" "}
          <a
            href={`tel:${HOTLINE.replace(/\s/g, "")}`}
            className="font-bold text-emerald-300"
          >
            {HOTLINE}
          </a>{" "}
          — chúng tôi hỗ trợ 5:00–21:00 hằng ngày.
        </p>
        <p className="mt-2 text-emerald-100/40">
          © {new Date().getFullYear()} LIMOGREEN · Xe ghép Huế – Đà Nẵng – Hội An
        </p>
      </footer>
    </div>
  );
}
