/**
 * Constants for the Huế - Đà Nẵng car sharing app
 */

export const ROUTES = {
  HUE_TO_DA_NANG: {
    id: "hue-da-nang",
    origin: "Huế",
    destination: "Đà Nẵng",
    distance: 108, // km
    estimatedDuration: 2.5, // hours
  },
  DA_NANG_TO_HUE: {
    id: "da-nang-hue",
    origin: "Đà Nẵng",
    destination: "Huế",
    distance: 108, // km
    estimatedDuration: 2.5, // hours
  },
};

export const VEHICLE_TYPES = {
  SEDAN_4SEAT: {
    id: "sedan-4",
    name: "4-Seater Car",
    seatCount: 4,
    seats: [1, 2, 3, 4],
    type: "sedan",
  },
  MINIVAN_7SEAT: {
    id: "minivan-7",
    name: "7-Seater Minivan",
    seatCount: 7,
    seats: [1, 2, 3, 4, 5, 6, 7],
    type: "minivan",
  },
};

export const PRICING = {
  BASE_FARE: 150000, // VND for Huế - Đà Nẵng
  DISCOUNT_PERCENTAGE: 0, // 5% for multiple bookings
  CURRENCY: "VND",
  CURRENCY_SYMBOL: "₫",
};

export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

export const TRIP_STATUS = {
  SCHEDULED: "scheduled",
  IN_TRANSIT: "in_transit",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const DEPARTURE_TIMES = [
  "06:00",
  "08:00",
  "10:00",
  "12:00",
  "14:00",
  "16:00",
  "18:00",
];

export const USER_ROLES = {
  CUSTOMER: "customer",
  DRIVER: "driver",
  ADMIN: "admin",
  STAFF: "staff",
};

/**
 * Format Vietnamese currency
 */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get route display name
 */
export function getRouteDisplay(origin: string, destination: string): string {
  return `${origin} - ${destination}`;
}

/**
 * Calculate fare based on seat count
 */
export function calculateFare(seatCount: number): number {
  return PRICING.BASE_FARE * seatCount;
}

/**
 * Format time string HH:MM
 */
export function formatTime(timeStr: string): string {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(":");
  return `${hours}:${minutes}`;
}

/**
 * Format date to DD/MM/YYYY
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * Format datetime
 */
export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
