export function Legend() {
  return (
    <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
      <span className="flex items-center gap-1.5">
        <span className="w-4 h-4 rounded bg-white border border-gray-400 inline-block" />
        Trống
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-4 h-4 rounded bg-green-400 inline-block" />
        Đang chọn
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-4 h-4 rounded bg-gray-300 inline-block" />
        Đã đặt
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-4 h-4 rounded bg-blue-500 inline-block" />
        Tài xế
      </span>
    </div>
  );
}
