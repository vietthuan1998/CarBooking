interface SeatProps {
  x: number;
  y: number;
  size: number;
  label: string;
  selected?: boolean;
  disabled?: boolean;
  isDriver?: boolean;
  onClick?: () => void;
}

export function Seat({
  x,
  y,
  size,
  label,
  selected,
  disabled,
  isDriver,
  onClick,
}: SeatProps) {
  const fillColor = isDriver
    ? "#3b82f6"
    : disabled
    ? "#d1d5db"
    : selected
    ? "#22c55e"
    : "#ffffff";

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={isDriver ? undefined : onClick}
      style={{
        // Ghế đã đặt (disabled) vẫn phải bắt được click để xem thông tin đặt
        // chỗ — chỉ đổi con trỏ chuột sang "not-allowed" để báo hiệu không thể
        // CHỌN ghế này cho lượt đặt mới, không phải để chặn tương tác.
        cursor: isDriver
          ? "not-allowed"
          : disabled
          ? "not-allowed"
          : onClick
          ? "pointer"
          : "default",
      }}
    >
      <rect
        width={size}
        height={size}
        rx={10}
        fill={fillColor}
        stroke="#374151"
        strokeWidth={2}
      />

      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={size * 0.35}
        fontWeight={600}
      >
        {label}
      </text>
    </g>
  );
}
