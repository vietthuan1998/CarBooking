


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_my_role"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  select role
  from public.profiles
  where id = auth.uid();
$$;


ALTER FUNCTION "public"."get_my_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.profiles (
    id,
    full_name,
    phone,
    role,
    status
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email, ''),
    new.raw_user_meta_data->>'phone',
    'customer',
    'active'
  );

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."booking_status_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "booking_id" "uuid" NOT NULL,
    "old_status" "text",
    "new_status" "text" NOT NULL,
    "changed_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."booking_status_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bookings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "booking_code" "text" NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "trip_id" "uuid" NOT NULL,
    "seat_count" integer NOT NULL,
    "pickup_address" "text" NOT NULL,
    "dropoff_address" "text" NOT NULL,
    "fare_amount" numeric(12,2) NOT NULL,
    "booking_source" "text" DEFAULT 'manual'::"text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "bookings_fare_amount_check" CHECK (("fare_amount" >= (0)::numeric)),
    CONSTRAINT "bookings_seat_count_check" CHECK (("seat_count" > 0))
);


ALTER TABLE "public"."bookings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "note" "text"
);


ALTER TABLE "public"."customers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text" NOT NULL,
    "phone" "text",
    "role" "text" DEFAULT 'customer'::"text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."routes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "route_name" "text" NOT NULL,
    "origin" "text" NOT NULL,
    "destination" "text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL
);


ALTER TABLE "public"."routes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."seats" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vehicle_id" "uuid" NOT NULL,
    "seat_code" "text" NOT NULL,
    "seat_order" integer NOT NULL,
    CONSTRAINT "seats_seat_order_check" CHECK (("seat_order" > 0))
);


ALTER TABLE "public"."seats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trip_driver_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trip_id" "uuid" NOT NULL,
    "old_driver_id" "uuid",
    "new_driver_id" "uuid",
    "changed_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."trip_driver_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trip_seats" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trip_id" "uuid" NOT NULL,
    "seat_id" "uuid" NOT NULL,
    "booking_id" "uuid",
    "status" "text" DEFAULT 'available'::"text" NOT NULL
);


ALTER TABLE "public"."trip_seats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trips" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trip_code" "text" NOT NULL,
    "route_id" "uuid" NOT NULL,
    "vehicle_id" "uuid" NOT NULL,
    "driver_id" "uuid",
    "planned_departure_time" timestamp with time zone NOT NULL,
    "actual_departure_time" timestamp with time zone,
    "actual_arrival_time" timestamp with time zone,
    "trip_status" "text" DEFAULT 'scheduled'::"text" NOT NULL
);


ALTER TABLE "public"."trips" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vehicle_locations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "vehicle_id" "uuid" NOT NULL,
    "latitude" numeric(10,7) NOT NULL,
    "longitude" numeric(10,7) NOT NULL,
    "speed" numeric(8,2) DEFAULT 0 NOT NULL,
    "recorded_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "vehicle_locations_speed_check" CHECK (("speed" >= (0)::numeric))
);


ALTER TABLE "public"."vehicle_locations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vehicles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "plate_number" "text" NOT NULL,
    "vehicle_name" "text" NOT NULL,
    "seat_count" integer NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    CONSTRAINT "vehicles_seat_count_check" CHECK (("seat_count" > 0))
);


ALTER TABLE "public"."vehicles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."booking_status_logs"
    ADD CONSTRAINT "booking_status_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_booking_code_key" UNIQUE ("booking_code");



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_phone_key" UNIQUE ("phone");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."routes"
    ADD CONSTRAINT "routes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."seats"
    ADD CONSTRAINT "seats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."seats"
    ADD CONSTRAINT "seats_vehicle_id_seat_code_key" UNIQUE ("vehicle_id", "seat_code");



ALTER TABLE ONLY "public"."seats"
    ADD CONSTRAINT "seats_vehicle_id_seat_order_key" UNIQUE ("vehicle_id", "seat_order");



ALTER TABLE ONLY "public"."trip_driver_logs"
    ADD CONSTRAINT "trip_driver_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trip_seats"
    ADD CONSTRAINT "trip_seats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trip_seats"
    ADD CONSTRAINT "trip_seats_trip_id_seat_id_key" UNIQUE ("trip_id", "seat_id");



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_trip_code_key" UNIQUE ("trip_code");



ALTER TABLE ONLY "public"."vehicle_locations"
    ADD CONSTRAINT "vehicle_locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vehicles"
    ADD CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vehicles"
    ADD CONSTRAINT "vehicles_plate_number_key" UNIQUE ("plate_number");



CREATE INDEX "booking_status_logs_booking_id_idx" ON "public"."booking_status_logs" USING "btree" ("booking_id");



CREATE INDEX "bookings_customer_id_idx" ON "public"."bookings" USING "btree" ("customer_id");



CREATE INDEX "bookings_trip_id_idx" ON "public"."bookings" USING "btree" ("trip_id");



CREATE INDEX "trip_driver_logs_trip_id_idx" ON "public"."trip_driver_logs" USING "btree" ("trip_id");



CREATE INDEX "trip_seats_booking_id_idx" ON "public"."trip_seats" USING "btree" ("booking_id");



CREATE INDEX "trips_driver_id_idx" ON "public"."trips" USING "btree" ("driver_id");



CREATE INDEX "trips_route_id_idx" ON "public"."trips" USING "btree" ("route_id");



CREATE INDEX "trips_vehicle_id_idx" ON "public"."trips" USING "btree" ("vehicle_id");



CREATE INDEX "vehicle_locations_vehicle_recorded_idx" ON "public"."vehicle_locations" USING "btree" ("vehicle_id", "recorded_at" DESC);



ALTER TABLE ONLY "public"."booking_status_logs"
    ADD CONSTRAINT "booking_status_logs_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."booking_status_logs"
    ADD CONSTRAINT "booking_status_logs_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."seats"
    ADD CONSTRAINT "seats_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_driver_logs"
    ADD CONSTRAINT "trip_driver_logs_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trip_driver_logs"
    ADD CONSTRAINT "trip_driver_logs_new_driver_id_fkey" FOREIGN KEY ("new_driver_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trip_driver_logs"
    ADD CONSTRAINT "trip_driver_logs_old_driver_id_fkey" FOREIGN KEY ("old_driver_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trip_driver_logs"
    ADD CONSTRAINT "trip_driver_logs_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip_seats"
    ADD CONSTRAINT "trip_seats_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trip_seats"
    ADD CONSTRAINT "trip_seats_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "public"."seats"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."trip_seats"
    ADD CONSTRAINT "trip_seats_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trips"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."trips"
    ADD CONSTRAINT "trips_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."vehicle_locations"
    ADD CONSTRAINT "vehicle_locations_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE CASCADE;



CREATE POLICY "Admin can read all profiles" ON "public"."profiles" FOR SELECT USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Admin update all profiles" ON "public"."profiles" FOR UPDATE USING (("public"."get_my_role"() = 'admin'::"text"));



CREATE POLICY "Enable read access for all users" ON "public"."booking_status_logs" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."bookings" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."customers" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."routes" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."seats" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."trip_driver_logs" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."trip_seats" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."trips" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."vehicle_locations" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."vehicles" FOR SELECT USING (true);



CREATE POLICY "Enable users to view their own data only" ON "public"."profiles" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Manager read all profiles" ON "public"."profiles" FOR SELECT USING (("public"."get_my_role"() = ANY (ARRAY['admin'::"text", 'manager'::"text"])));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."booking_status_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bookings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."routes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."seats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trip_driver_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trip_seats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trips" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vehicle_locations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vehicles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."get_my_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";


















GRANT ALL ON TABLE "public"."booking_status_logs" TO "anon";
GRANT ALL ON TABLE "public"."booking_status_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."booking_status_logs" TO "service_role";



GRANT ALL ON TABLE "public"."bookings" TO "anon";
GRANT ALL ON TABLE "public"."bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."bookings" TO "service_role";



GRANT ALL ON TABLE "public"."customers" TO "anon";
GRANT ALL ON TABLE "public"."customers" TO "authenticated";
GRANT ALL ON TABLE "public"."customers" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."routes" TO "anon";
GRANT ALL ON TABLE "public"."routes" TO "authenticated";
GRANT ALL ON TABLE "public"."routes" TO "service_role";



GRANT ALL ON TABLE "public"."seats" TO "anon";
GRANT ALL ON TABLE "public"."seats" TO "authenticated";
GRANT ALL ON TABLE "public"."seats" TO "service_role";



GRANT ALL ON TABLE "public"."trip_driver_logs" TO "anon";
GRANT ALL ON TABLE "public"."trip_driver_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."trip_driver_logs" TO "service_role";



GRANT ALL ON TABLE "public"."trip_seats" TO "anon";
GRANT ALL ON TABLE "public"."trip_seats" TO "authenticated";
GRANT ALL ON TABLE "public"."trip_seats" TO "service_role";



GRANT ALL ON TABLE "public"."trips" TO "anon";
GRANT ALL ON TABLE "public"."trips" TO "authenticated";
GRANT ALL ON TABLE "public"."trips" TO "service_role";



GRANT ALL ON TABLE "public"."vehicle_locations" TO "anon";
GRANT ALL ON TABLE "public"."vehicle_locations" TO "authenticated";
GRANT ALL ON TABLE "public"."vehicle_locations" TO "service_role";



GRANT ALL ON TABLE "public"."vehicles" TO "anon";
GRANT ALL ON TABLE "public"."vehicles" TO "authenticated";
GRANT ALL ON TABLE "public"."vehicles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































