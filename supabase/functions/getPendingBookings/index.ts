import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };

  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Dùng JWT của user để RLS policy áp dụng (admin/manager mới đọc được bookings)
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
    id,
    booking_code,
    pickup_address,
    dropoff_address,
    fare_amount,
    status,
    created_at,
    customer:customers (
      id,
      full_name,
      phone,
      note
    ),
    trip:trips!inner (
      id,
      trip_code,
      planned_departure_time,
      trip_status,
      route:routes (
        id,
        route_name,
        origin,
        destination
      )
    )
  `,
      )
      .in("status", ["pending"])
      .gte("trip.planned_departure_time", todayISO)
      .limit(10);

    if (error) throw error;

    return new Response(JSON.stringify(data ?? []), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
