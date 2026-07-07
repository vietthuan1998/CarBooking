import { supabase } from "../utils/supabase";

export type VehicleStatus = "active" | "inactive" | "maintenance" | "pending";

export interface Vehicle {
  id: string;
  vehicle_name: string;
  plate_number: string;
  seat_count: number;
  status: VehicleStatus;
  driver_id: string | null;
  driver: { full_name: string; phone: string | null } | null;
  created_at: string;
}

export interface VehicleFormInput {
  vehicle_name: string;
  plate_number: string;
  seat_count: number;
  status: VehicleStatus;
}

export async function getVehicles(): Promise<Vehicle[]> {
  const { data, error } = await supabase
    .from("vehicles")
    .select(
      "id, vehicle_name, plate_number, seat_count, status, driver_id, driver:profiles(full_name, phone), created_at",
    )
    .order("vehicle_name");
  if (error) throw error;
  return (data ?? []) as unknown as Vehicle[];
}

export async function createVehicle(input: VehicleFormInput): Promise<Vehicle> {
  const { data, error } = await supabase
    .from("vehicles")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateVehicle(
  id: string,
  input: Partial<VehicleFormInput>,
): Promise<Vehicle> {
  const { data, error } = await supabase
    .from("vehicles")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteVehicle(id: string): Promise<void> {
  const { error } = await supabase.from("vehicles").delete().eq("id", id);
  if (error) throw error;
}
