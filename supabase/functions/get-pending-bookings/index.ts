import { createClient } from "jsr:@supabase/supabase-js@2";

// Danh sách khách trong ngày cho dashboard: mọi booking pending + confirmed
// có requested_departure_time trong khoảng client gửi lên (boundary ngày theo
// local time của trình duyệt). pending xếp trước confirmed, rồi theo giờ đi.
// Lọc trên bookings.requested_departure_time (không join trips) vì booking
// online chưa được xếp xe → trip_id NULL.

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
    // Dùng JWT của user để RLS policy áp dụng (admin/staff mới đọc được bookings)
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const body = await req.json().catch(() => ({}));
    // Fallback: từ 00:00 hôm nay (UTC server) nếu client không gửi boundary
    const fallbackStart = new Date();
    fallbackStart.setHours(0, 0, 0, 0);
    const start = typeof body?.start === "string"
      ? body.start
      : fallbackStart.toISOString();
    const end = typeof body?.end === "string" ? body.end : null;

    let query = supabase
      .from("bookings")
      .select(
        `
    id,
    booking_code,
    pickup_address,
    dropoff_address,
    fare_amount,
    seat_count,
    note,
    status,
    booking_source,
    requested_departure_time,
    created_at,
    customer:customers (
      id,
      full_name,
      phone,
      note
    ),
    route:routes (
      id,
      route_name,
      origin,
      destination
    ),
    trip:trips (
      id,
      trip_code,
      trip_status
    )
  `,
      )
      .in("status", ["pending", "confirmed"])
      .gte("requested_departure_time", start)
      // 'pending' > 'confirmed' theo alphabet → desc cho pending lên trước
      .order("status", { ascending: false })
      .order("requested_departure_time", { ascending: true })
      .limit(100);
    if (end) query = query.lte("requested_departure_time", end);

    const { data, error } = await query;

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
