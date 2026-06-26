export function TemporaryMap() {
  return (
    <div className="relative h-full min-h-[240px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
      <iframe
        title="Bản đồ tuyến Huế - Đà Nẵng"
        className="h-full w-full border-0"
        loading="lazy"
        src="https://www.openstreetmap.org/export/embed.html?bbox=107.35%2C15.75%2C108.45%2C16.65&layer=mapnik"
      />

      <div className="pointer-events-none absolute left-4 top-4 rounded-xl bg-white/90 px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
        Huế → Đà Nẵng
      </div>
    </div>
  );
}