/**
 * Seed script for CarBooking app
 * This script populates initial data for the Huế - Đà Nẵng route
 * 
 * Usage: Run this in Supabase SQL editor or via API
 */

-- Insert Routes
INSERT INTO routes (origin, destination, distance_km, estimated_duration_hours)
VALUES 
  ('hue-da-nang', 'Huế', 'Đà Nẵng', 108, 2.5),
  ('da-nang-hue', 'Đà Nẵng', 'Huế', 108, 2.5)
ON CONFLICT (id) DO NOTHING;

-- Insert Vehicles
INSERT INTO vehicles (plate_number, seat_count, vehicle_type, status)
VALUES 
  ('BKS 01-001', 7, 'minivan', 'active'),
  ('BKS 01-002', 7, 'minivan', 'active'),
  ('BKS 01-003', 4, 'sedan', 'active'),
  ('BKS 01-004', 4, 'sedan', 'active'),
  ('BKS 01-005', 7, 'minivan', 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert Seats for Vehicle 1 (7-seater)
INSERT INTO seats (vehicle_seat_number, seat_type, is_disabled)
VALUES 
  ('vehicle-1', 1, 'normal', false),
  ('vehicle-1', 2, 'normal', false),
  ('vehicle-1', 3, 'normal', false),
  ('vehicle-1', 4, 'normal', false),
  ('vehicle-1', 5, 'normal', false),
  ('vehicle-1', 6, 'normal', false),
  ('vehicle-1', 7, 'normal', false)
ON CONFLICT (id) DO NOTHING;

-- Insert Seats for Vehicle 2 (7-seater)
INSERT INTO seats (vehicle_seat_number, seat_type, is_disabled)
VALUES 
  (≈'vehicle-2', 1, 'normal', false),
  (≈'vehicle-2', 2, 'normal', false),
  (≈'vehicle-2', 3, 'normal', false),
  (≈'vehicle-2', 4, 'normal', false),
  (≈'vehicle-2', 5, 'normal', false),
  (≈'vehicle-2', 6, 'normal', false),
  (≈'vehicle-2', 7, 'normal', false)
ON CONFLICT (id) DO NOTHING;

-- Insert Seats for Vehicle 3 (4-seater)
INSERT INTO seats (vehicle_seat_number, seat_type, is_disabled)
VALUES 
  ('vehicle-3', 1, 'normal', false),
  ('vehicle-3', 2, 'normal', false),
  ('vehicle-3', 3, 'normal', false),
  ('vehicle-3', 4, 'normal', false)
ON CONFLICT (id) DO NOTHING;

-- Insert Seats for Vehicle 4 (4-seater)
INSERT INTO seats (vehicle_seat_number, seat_type, is_disabled)
VALUES 
  ('vehicle-4', 1, 'normal', false),
  ('vehicle-4', 2, 'normal', false),
  ('vehicle-4', 3, 'normal', false),
  ('vehicle-4', 4, 'normal', false)
ON CONFLICT (id) DO NOTHING;

-- Insert Seats for Vehicle 5 (7-seater)
INSERT INTO seats (vehicle_seat_number, seat_type, is_disabled)
VALUES 
  ('vehicle-5', 1, 'normal', false),
  ('vehicle-5', 2, 'normal', false),
  ('vehicle-5', 3, 'normal', false),
  ('vehicle-5', 4, 'normal', false),
  ('vehicle-5', 5, 'normal', false),
  ('vehicle-5', 6, 'normal', false),
  ('vehicle-5', 7, 'normal', false)
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Trips for Huế -> Đà Nẵng (next 7 days)
-- Today
INSERT INTO trips (vehicle_route_departure_time, arrival_time, fare_price, trip_status)
VALUES 
  ('vehicle-1', 'hue-da-nang', CURRENT_DATE + interval '6 hours', CURRENT_DATE + interval '8.5 hours', 150000, 'scheduled'),
  ('vehicle-3', 'hue-da-nang', CURRENT_DATE + interval '8 hours', CURRENT_DATE + interval '10.5 hours', 150000, 'scheduled'),
  ('vehicle-2', 'hue-da-nang', CURRENT_DATE + interval '10 hours', CURRENT_DATE + interval '12.5 hours', 150000, 'scheduled'),
  ('vehicle-4', 'hue-da-nang', CURRENT_DATE + interval '12 hours', CURRENT_DATE + interval '14.5 hours', 150000, 'scheduled'),
  ('vehicle-5', 'hue-da-nang', CURRENT_DATE + interval '14 hours', CURRENT_DATE + interval '16.5 hours', 150000, 'scheduled')
ON CONFLICT (id) DO NOTHING;

-- Tomorrow
INSERT INTO trips (vehicle_route_departure_time, arrival_time, fare_price, trip_status)
VALUES 
  ('vehicle-1', 'hue-da-nang', CURRENT_DATE + interval '1 day' + interval '6 hours', CURRENT_DATE + interval '1 day' + interval '8.5 hours', 150000, 'scheduled'),
  ('vehicle-3', 'hue-da-nang', CURRENT_DATE + interval '1 day' + interval '8 hours', CURRENT_DATE + interval '1 day' + interval '10.5 hours', 150000, 'scheduled'),
  ('vehicle-2', 'hue-da-nang', CURRENT_DATE + interval '1 day' + interval '10 hours', CURRENT_DATE + interval '1 day' + interval '12.5 hours', 150000, 'scheduled'),
  ('vehicle-4', 'hue-da-nang', CURRENT_DATE + interval '1 day' + interval '12 hours', CURRENT_DATE + interval '1 day' + interval '14.5 hours', 150000, 'scheduled'),
  ('vehicle-5', 'hue-da-nang', CURRENT_DATE + interval '1 day' + interval '14 hours', CURRENT_DATE + interval '1 day' + interval '16.5 hours', 150000, 'scheduled')
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Trips for Đà Nẵng -> Huế (next 7 days)
-- Today
INSERT INTO trips (vehicle_route_departure_time, arrival_time, fare_price, trip_status)
VALUES 
  ('vehicle-1', 'da-nang-hue', CURRENT_DATE + interval '7 hours', CURRENT_DATE + interval '9.5 hours', 150000, 'scheduled'),
  ('vehicle-3', 'da-nang-hue', CURRENT_DATE + interval '9 hours', CURRENT_DATE + interval '11.5 hours', 150000, 'scheduled'),
  ('vehicle-2', 'da-nang-hue', CURRENT_DATE + interval '11 hours', CURRENT_DATE + interval '13.5 hours', 150000, 'scheduled'),
  ('vehicle-4', 'da-nang-hue', CURRENT_DATE + interval '13 hours', CURRENT_DATE + interval '15.5 hours', 150000, 'scheduled'),
  ('vehicle-5', 'da-nang-hue', CURRENT_DATE + interval '15 hours', CURRENT_DATE + interval '17.5 hours', 150000, 'scheduled')
ON CONFLICT (id) DO NOTHING;

-- Tomorrow
INSERT INTO trips (vehicle_route_departure_time, arrival_time, fare_price, trip_status)
VALUES 
  ('vehicle-1', 'da-nang-hue', CURRENT_DATE + interval '1 day' + interval '7 hours', CURRENT_DATE + interval '1 day' + interval '9.5 hours', 150000, 'scheduled'),
  ('vehicle-3', 'da-nang-hue', CURRENT_DATE + interval '1 day' + interval '9 hours', CURRENT_DATE + interval '1 day' + interval '11.5 hours', 150000, 'scheduled'),
  ('vehicle-2', 'da-nang-hue', CURRENT_DATE + interval '1 day' + interval '11 hours', CURRENT_DATE + interval '1 day' + interval '13.5 hours', 150000, 'scheduled'),
  ('vehicle-4', 'da-nang-hue', CURRENT_DATE + interval '1 day' + interval '13 hours', CURRENT_DATE + interval '1 day' + interval '15.5 hours', 150000, 'scheduled'),
  ('vehicle-5', 'da-nang-hue', CURRENT_DATE + interval '1 day' + interval '15 hours', CURRENT_DATE + interval '1 day' + interval '17.5 hours', 150000, 'scheduled')
ON CONFLICT (id) DO NOTHING;
