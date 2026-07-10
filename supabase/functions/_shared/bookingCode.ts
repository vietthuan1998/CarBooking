// Sinh mã booking hiển thị cho khách/staff (không phải khóa chính).
// Dùng chung cho create-booking (staff đặt) và register-booking (khách online).
export function generateBookingCode(): string {
  return `BK-${Date.now()}-${
    Math.random().toString(36).slice(2, 6).toUpperCase()
  }`;
}
