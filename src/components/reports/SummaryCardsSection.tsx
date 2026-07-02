import { Car, DollarSign, TicketCheck, TrendingUp } from "lucide-react";
import type { ReportOverview } from "../../services/reportService";
import { SummaryCard } from "./SummaryCard";
import { fCurrency } from "@/utils/helpers";

interface Props {
  overview: ReportOverview | null;
}

export function SummaryCardsSection({ overview }: Props) {
  return (
    <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        title="Tổng doanh thu"
        value={fCurrency(overview?.total_revenue ?? 0)}
        sub="Từ các booking đã xác nhận"
        icon={<DollarSign size={20} />}
        color="emerald"
      />
      <SummaryCard
        title="Tổng chuyến xe"
        value={String(overview?.total_trips ?? 0)}
        sub="Không tính chuyến đã hủy"
        icon={<Car size={20} />}
        color="blue"
      />
      <SummaryCard
        title="Tổng booking"
        value={String(overview?.total_bookings ?? 0)}
        sub="Booking đã xác nhận"
        icon={<TicketCheck size={20} />}
        color="violet"
      />
      <SummaryCard
        title="Doanh thu TB/booking"
        value={fCurrency(overview?.avg_revenue_per_booking ?? 0)}
        sub="Trung bình mỗi lần đặt vé"
        icon={<TrendingUp size={20} />}
        color="amber"
      />
    </section>
  );
}
