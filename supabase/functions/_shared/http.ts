// Helpers HTTP dùng chung cho mọi edge function: CORS, response JSON,
// HttpError (ném từ logic nghiệp vụ → servePost map thành response),
// và servePost gom phần boilerplate OPTIONS/405/try-catch.

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function orThrow500(
  error: { message: string } | null,
): asserts error is null {
  if (error) throw new HttpError(500, error.message);
}

/**
 * Deno.serve với phần khung chung: preflight OPTIONS, chỉ nhận POST,
 * bắt HttpError → response đúng status, lỗi khác → 500.
 * Handler chỉ cần lo nghiệp vụ và return json(...).
 */
export function servePost(handler: (req: Request) => Promise<Response>) {
  Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }
    if (req.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }
    try {
      return await handler(req);
    } catch (err) {
      if (err instanceof HttpError) {
        return json({ error: err.message }, err.status);
      }
      return json(
        { error: err instanceof Error ? err.message : "Unknown error" },
        500,
      );
    }
  });
}
