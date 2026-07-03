import type { SupabaseClient } from "jsr:@supabase/supabase-js@2";
import { HttpError, orThrow500 } from "./http.ts";

interface RouteRow {
  id: string;
  origin: string;
  destination: string;
  base_price: number;
  status: string;
}

type RouteDirection = "from-hue" | "to-hue" | null;

function getRouteDirection(
  route: Pick<RouteRow, "origin" | "destination">,
): RouteDirection {
  const origin = (route.origin ?? "").toLowerCase();
  const destination = (route.destination ?? "").toLowerCase();
  if (origin.includes("huế")) return "from-hue";
  if (destination.includes("huế")) return "to-hue";
  return null;
}

export async function resolveBookingRoute(
  supabase: SupabaseClient,
  routeId: string,
  trip: { route: { origin: string; destination: string } | null },
): Promise<RouteRow> {
  const { data: route, error } = await supabase
    .from("routes")
    .select("id, origin, destination, base_price, status")
    .eq("id", routeId)
    .maybeSingle();

  orThrow500(error);
  if (!route) throw new HttpError(404, "route_id không tồn tại");
  if (route.status !== "active") {
    throw new HttpError(409, "Tuyến đã ngừng hoạt động");
  }

  if (trip.route && getRouteDirection(route) !== getRouteDirection(trip.route)) {
    throw new HttpError(
      400,
      "Tuyến chọn không cùng chiều với chuyến xe",
    );
  }

  return route as RouteRow;
}
