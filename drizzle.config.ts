import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./supabase/db/schema.ts", // Nơi bạn sẽ viết code định nghĩa bảng
  out: "./supabase/drizzle", // Nơi Drizzle tự động sinh ra các file SQL migration
  dialect: "postgresql",
  dbCredentials: {
    url: import.meta.env.DATABASE_URL!,
  },
});
