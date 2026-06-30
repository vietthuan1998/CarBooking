SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict tx9eGfULrqligwuBhg5kzAzK4cxtMJwQqpx1fROleFlzIikftWKvQ5NNbzy7Lhh

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', 'a1c58997-245a-449d-8108-1a4ff4b146df', 'authenticated', 'authenticated', 'vietthuan1998@gmail.com', '$2a$10$OKO6gp5rMEbFTPBxNNnUf.0qh26dG/HpuDB6q34QH5N1GXQm7ryle', '2026-06-25 01:49:58.049134+00', NULL, '', '2026-06-25 01:49:18.704678+00', '', NULL, '', '', NULL, '2026-06-29 01:52:30.900272+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "a1c58997-245a-449d-8108-1a4ff4b146df", "email": "vietthuan1998@gmail.com", "phone": "0935292231", "full_name": "Duong Viet Thuan", "email_verified": true, "phone_verified": false}', NULL, '2026-06-25 01:49:18.655536+00', '2026-06-29 07:53:54.56861+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'a015301d-e984-4232-b24c-03ca22c0df17', 'authenticated', 'authenticated', 'phamngocquoc921803@gmail.com', '$2a$10$huKtsFli88WbM5ThygHGQOKGD24R0KlbjAQRItQ81Ad3z0Rs4W9Xm', NULL, NULL, '8bd20171455549ebc72beb05c5b2cf302014a8e31e3633c8a543ce92', '2026-06-24 09:26:29.844124+00', '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "a015301d-e984-4232-b24c-03ca22c0df17", "email": "phamngocquoc921803@gmail.com", "phone": "0788686286", "full_name": "Phạm Ngọc Quốc", "email_verified": false, "phone_verified": false}', NULL, '2026-06-24 09:26:29.815416+00', '2026-06-24 09:26:32.867855+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '64d3fa62-41f5-4eb7-b619-a48d24c2c293', 'authenticated', 'authenticated', 'abcd1331@gmail.com', '$2a$10$teaWnLYaQI6uzdp/E1viDO0veS4iNwH78kmaOoKwkZrsh20p0u7KK', NULL, NULL, 'ba05d192506af368169a99443503a1681bfed84140a1372f108716a8', '2026-06-25 03:39:15.859209+00', '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "64d3fa62-41f5-4eb7-b619-a48d24c2c293", "email": "abcd1331@gmail.com", "phone": "01234579", "full_name": "abcd", "email_verified": false, "phone_verified": false}', NULL, '2026-06-25 03:39:15.851415+00', '2026-06-25 03:39:18.362262+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('a015301d-e984-4232-b24c-03ca22c0df17', 'a015301d-e984-4232-b24c-03ca22c0df17', '{"sub": "a015301d-e984-4232-b24c-03ca22c0df17", "email": "phamngocquoc921803@gmail.com", "phone": "0788686286", "full_name": "Phạm Ngọc Quốc", "email_verified": false, "phone_verified": false}', 'email', '2026-06-24 09:26:29.835272+00', '2026-06-24 09:26:29.835317+00', '2026-06-24 09:26:29.835317+00', '5013dd66-bb2e-4c3d-b7ad-e775a7bd9b9a'),
	('a1c58997-245a-449d-8108-1a4ff4b146df', 'a1c58997-245a-449d-8108-1a4ff4b146df', '{"sub": "a1c58997-245a-449d-8108-1a4ff4b146df", "email": "vietthuan1998@gmail.com", "phone": "0935292231", "full_name": "Duong Viet Thuan", "email_verified": true, "phone_verified": false}', 'email', '2026-06-25 01:49:18.692366+00', '2026-06-25 01:49:18.69242+00', '2026-06-25 01:49:18.69242+00', '42a07750-17f2-4c7f-977e-62b1d748603a'),
	('64d3fa62-41f5-4eb7-b619-a48d24c2c293', '64d3fa62-41f5-4eb7-b619-a48d24c2c293', '{"sub": "64d3fa62-41f5-4eb7-b619-a48d24c2c293", "email": "abcd1331@gmail.com", "phone": "01234579", "full_name": "abcd", "email_verified": false, "phone_verified": false}', 'email', '2026-06-25 03:39:15.854132+00', '2026-06-25 03:39:15.854194+00', '2026-06-25 03:39:15.854194+00', '6d25b2eb-d796-49f0-a4e9-6dc12d601f79');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('3e3a724d-6bd6-4edf-8638-6a3fbf5645cd', 'a1c58997-245a-449d-8108-1a4ff4b146df', '2026-06-29 01:52:30.90038+00', '2026-06-29 07:53:54.578246+00', NULL, 'aal1', NULL, '2026-06-29 07:53:54.578125', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', '116.98.248.217', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('3e3a724d-6bd6-4edf-8638-6a3fbf5645cd', '2026-06-29 01:52:30.903085+00', '2026-06-29 01:52:30.903085+00', 'password', 'ff5e6a15-a1ea-4f69-a8bc-8ca5e29e60fb');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."one_time_tokens" ("id", "user_id", "token_type", "token_hash", "relates_to", "created_at", "updated_at") VALUES
	('6a8fb70e-8d6b-4ebf-b359-4645cac38ff3', 'a015301d-e984-4232-b24c-03ca22c0df17', 'confirmation_token', '8bd20171455549ebc72beb05c5b2cf302014a8e31e3633c8a543ce92', 'phamngocquoc921803@gmail.com', '2026-06-24 09:26:32.871154', '2026-06-24 09:26:32.871154'),
	('d834d086-2015-4764-841b-39fd8b4e937e', '64d3fa62-41f5-4eb7-b619-a48d24c2c293', 'confirmation_token', 'ba05d192506af368169a99443503a1681bfed84140a1372f108716a8', 'abcd1331@gmail.com', '2026-06-25 03:39:18.367832', '2026-06-25 03:39:18.367832');


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 45, 'phbgadykhlwy', 'a1c58997-245a-449d-8108-1a4ff4b146df', true, '2026-06-29 01:52:30.901561+00', '2026-06-29 03:01:47.009049+00', NULL, '3e3a724d-6bd6-4edf-8638-6a3fbf5645cd'),
	('00000000-0000-0000-0000-000000000000', 46, 'unophelbfpu5', 'a1c58997-245a-449d-8108-1a4ff4b146df', true, '2026-06-29 03:01:47.021018+00', '2026-06-29 04:00:04.101637+00', 'phbgadykhlwy', '3e3a724d-6bd6-4edf-8638-6a3fbf5645cd'),
	('00000000-0000-0000-0000-000000000000', 47, 'tu42rcy5h6rx', 'a1c58997-245a-449d-8108-1a4ff4b146df', true, '2026-06-29 04:00:04.123504+00', '2026-06-29 06:55:33.040985+00', 'unophelbfpu5', '3e3a724d-6bd6-4edf-8638-6a3fbf5645cd'),
	('00000000-0000-0000-0000-000000000000', 48, '5a5we6r2fuzg', 'a1c58997-245a-449d-8108-1a4ff4b146df', true, '2026-06-29 06:55:33.069086+00', '2026-06-29 07:53:54.552786+00', 'tu42rcy5h6rx', '3e3a724d-6bd6-4edf-8638-6a3fbf5645cd'),
	('00000000-0000-0000-0000-000000000000', 49, 'f7kjt7gmelmu', 'a1c58997-245a-449d-8108-1a4ff4b146df', false, '2026-06-29 07:53:54.564504+00', '2026-06-29 07:53:54.564504+00', '5a5we6r2fuzg', '3e3a724d-6bd6-4edf-8638-6a3fbf5645cd');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."customers" ("id", "full_name", "phone", "note") VALUES
	('f2b27e97-c2ac-46bc-9669-0c363ccd1373', 'Nguyễn Văn A', '0905123456', 'Đón đúng giờ'),
	('4a918856-a7f8-462a-a9af-2d1592b8b066', 'Trần Thị B', '0912345678', 'Có trẻ em'),
	('ccac29fa-619e-418a-8f28-6af1d621ae2f', 'Lê Văn C', '0934567890', 'Mang nhiều hành lý'),
	('5c786683-a711-4554-8df1-249756ab5bc9', 'Phạm Văn D', '0978654321', '');


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "full_name", "phone", "role", "status", "created_at") VALUES
	('a015301d-e984-4232-b24c-03ca22c0df17', 'Phạm Ngọc Quốc', '0788686286', 'customer', 'active', '2026-06-24 09:26:29.814048+00'),
	('a1c58997-245a-449d-8108-1a4ff4b146df', 'Duong Viet Thuan', '0935292231', 'admin', 'active', '2026-06-25 01:49:18.654333+00'),
	('64d3fa62-41f5-4eb7-b619-a48d24c2c293', 'abcd', '01234579', 'customer', 'active', '2026-06-25 03:39:15.85108+00');


--
-- Data for Name: routes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."routes" ("id", "route_name", "origin", "destination", "status") VALUES
	('6da3ba74-32b7-4b36-b23c-43b5724802df', 'Huế - Đà Nẵng', 'Huế', 'Đà Nẵng', 'active'),
	('250f2719-3c58-42e5-8df9-c5571d1f9d7a', 'Đà Nẵng - Huế', 'Đà Nẵng', 'Huế', 'active'),
	('ea24488b-8de4-40ec-add3-14d3079df88c', 'Huế → Đà Nẵng', 'Huế', 'Đà Nẵng', 'active'),
	('2040edd1-7a11-4121-bc75-93197e31357f', 'Huế → Hội An', 'Huế', 'Hội An', 'active'),
	('c1c4408b-875a-4337-9143-8bf19d15a4f7', 'Đà Nẵng → Huế', 'Đà Nẵng', 'Huế', 'active'),
	('cac6bc69-e281-4607-b4a6-f0719365a838', 'Hội An → Huế', 'Hội An', 'Huế', 'active');


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."vehicles" ("id", "plate_number", "vehicle_name", "seat_count", "status") VALUES
	('442feced-602c-4463-b5ba-195ee4677509', '75B-12345', 'Limogreen 7 chỗ', 7, 'active'),
	('d5cbaee6-2cc7-4609-9ae6-5a3fdc35613f', '75B-67890', 'Limogreen 7 chỗ', 7, 'active'),
	('e62f771a-0772-46b3-af85-9ea79ba8369b', '75B-11111', 'Limogreen 7 chỗ', 7, 'active'),
	('0496c028-7bc2-48a7-92c8-671d663274a0', '75B-22222', 'Limogreen 7 chỗ', 7, 'active'),
	('02f39014-057c-42bf-93f8-804bad2258e0', '75B-999.99', 'Suziki', 4, 'active'),
	('e6ce42d0-338e-4ab1-95a5-b4af44a3d0d6', '75A-12345', 'Ford Transit 7 chỗ', 7, 'active'),
	('1deaeb6a-898c-4d56-b648-e7c90dcbe732', '75A-67890', 'Toyota Innova 4 chỗ', 4, 'active'),
	('9186836a-d61c-40cb-bef0-173364e303f6', '43A-11111', 'Hyundai Starex 7 chỗ', 7, 'active'),
	('89adf35c-4187-4bfd-be0f-1d778907ee61', '43A-22222', 'Toyota Vios 4 chỗ', 4, 'active');


--
-- Data for Name: trips; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."trips" ("id", "trip_code", "route_id", "vehicle_id", "driver_id", "planned_departure_time", "actual_departure_time", "actual_arrival_time", "trip_status") VALUES
	('9db20127-d762-4753-b5a3-cb5b69cb4022', 'CX001', '6da3ba74-32b7-4b36-b23c-43b5724802df', '442feced-602c-4463-b5ba-195ee4677509', NULL, '2026-06-24 04:55:48.954283+00', NULL, NULL, 'RUNNING'),
	('e16a1adc-d98e-4eb5-8a6b-faa074809f45', 'CX002', '6da3ba74-32b7-4b36-b23c-43b5724802df', 'd5cbaee6-2cc7-4609-9ae6-5a3fdc35613f', NULL, '2026-06-24 05:25:48.954283+00', NULL, NULL, 'WAITING'),
	('2a0bfbe0-182e-47ff-b659-53b3c4c1d490', 'CX003', '250f2719-3c58-42e5-8df9-c5571d1f9d7a', 'e62f771a-0772-46b3-af85-9ea79ba8369b', NULL, '2026-06-24 05:55:48.954283+00', NULL, NULL, 'WAITING'),
	('8c38c885-424d-43a0-a474-5b1acf34a508', 'CX004', '6da3ba74-32b7-4b36-b23c-43b5724802df', '0496c028-7bc2-48a7-92c8-671d663274a0', NULL, '2026-06-24 06:25:48.954283+00', NULL, NULL, 'WAITING'),
	('0df44a42-b863-4f51-8c83-ecac9d16ff25', 'HUE-DN-20260625-01', '6da3ba74-32b7-4b36-b23c-43b5724802df', 'e6ce42d0-338e-4ab1-95a5-b4af44a3d0d6', NULL, '2026-06-25 07:00:00+00', NULL, NULL, 'scheduled'),
	('8490388f-bb42-4ccc-b5b8-e690b756ce9e', 'HUE-HA-20260625-01', '2040edd1-7a11-4121-bc75-93197e31357f', '1deaeb6a-898c-4d56-b648-e7c90dcbe732', NULL, '2026-06-25 08:00:00+00', NULL, NULL, 'scheduled'),
	('06feb588-0cb1-43d0-a730-3e7894e8967d', 'DN-HUE-20260625-01', '250f2719-3c58-42e5-8df9-c5571d1f9d7a', '9186836a-d61c-40cb-bef0-173364e303f6', NULL, '2026-06-25 13:00:00+00', NULL, NULL, 'scheduled'),
	('1a970921-66d9-4d20-baea-b8cf53113ae4', 'HA-HUE-20260625-01', 'cac6bc69-e281-4607-b4a6-f0719365a838', '89adf35c-4187-4bfd-be0f-1d778907ee61', NULL, '2026-06-25 14:00:00+00', NULL, NULL, 'scheduled'),
	('9d2b2e03-5fb2-4c73-b47b-3e88254ed0f9', 'HUE-DN-20260626-01', '6da3ba74-32b7-4b36-b23c-43b5724802df', 'e6ce42d0-338e-4ab1-95a5-b4af44a3d0d6', NULL, '2026-06-26 07:00:00+00', NULL, NULL, 'scheduled'),
	('723438d2-988d-4ebb-9550-9a2335904ade', 'HUE-HA-20260626-01', '2040edd1-7a11-4121-bc75-93197e31357f', '1deaeb6a-898c-4d56-b648-e7c90dcbe732', NULL, '2026-06-26 08:00:00+00', NULL, NULL, 'scheduled'),
	('6c30283a-24fb-480a-ad07-48fd371e46c4', 'DN-HUE-20260626-01', '250f2719-3c58-42e5-8df9-c5571d1f9d7a', '9186836a-d61c-40cb-bef0-173364e303f6', NULL, '2026-06-26 13:00:00+00', NULL, NULL, 'scheduled'),
	('48a87f1b-7657-423b-8cfc-551c8b581876', 'HA-HUE-20260626-01', 'cac6bc69-e281-4607-b4a6-f0719365a838', '89adf35c-4187-4bfd-be0f-1d778907ee61', NULL, '2026-06-26 14:00:00+00', NULL, NULL, 'scheduled');


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."bookings" ("id", "booking_code", "customer_id", "trip_id", "seat_count", "pickup_address", "dropoff_address", "fare_amount", "booking_source", "status", "created_at") VALUES
	('4b81a0a4-9214-4c95-b529-407f54ce4749', 'BK000123', 'f2b27e97-c2ac-46bc-9669-0c363ccd1373', '9db20127-d762-4753-b5a3-cb5b69cb4022', 2, '25 Nguyễn Huệ', '123 Điện Biên Phủ', 300000.00, 'manual', 'NEW', '2026-06-26 02:36:35.850621+00'),
	('c63ccb6d-c376-432a-9ad8-993eb2543b44', 'BK000124', '4a918856-a7f8-462a-a9af-2d1592b8b066', 'e16a1adc-d98e-4eb5-8a6b-faa074809f45', 1, 'Bến xe phía Nam', 'Cầu Rồng', 150000.00, 'manual', 'NEW', '2026-06-26 02:36:35.850621+00'),
	('ae272a24-7696-4e62-8b05-bd2921234c63', 'BK000125', 'ccac29fa-619e-418a-8f28-6af1d621ae2f', '2a0bfbe0-182e-47ff-b659-53b3c4c1d490', 3, 'Big C Huế', 'Ngũ Hành Sơn', 450000.00, 'manual', 'NEW', '2026-06-26 02:36:35.850621+00'),
	('74ca8291-6ce2-4e1c-b6c6-23319a4b4942', 'BK000126', '5c786683-a711-4554-8df1-249756ab5bc9', '9db20127-d762-4753-b5a3-cb5b69cb4022', 1, '10 Đống Đa', 'Sân bay Đà Nẵng', 150000.00, 'manual', 'NEW', '2026-06-26 02:36:35.850621+00');


--
-- Data for Name: booking_status_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: seats; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."seats" ("id", "vehicle_id", "seat_code", "seat_order") VALUES
	('cca17eb8-0400-4c1b-85db-e66b1c5c1dd8', '442feced-602c-4463-b5ba-195ee4677509', 'A1', 1),
	('e935e909-b996-46a1-baf2-c56740002ec9', '442feced-602c-4463-b5ba-195ee4677509', 'A2', 2),
	('6105d94d-6b20-41d4-8d7e-b54508f43605', '442feced-602c-4463-b5ba-195ee4677509', 'B1', 3),
	('39e29a2a-cae3-4d22-97f2-1cf205b9e648', '442feced-602c-4463-b5ba-195ee4677509', 'B2', 4),
	('8244fe0c-2e3d-4e6e-87e5-b858f618a87f', '442feced-602c-4463-b5ba-195ee4677509', 'C1', 5),
	('cfa25223-56a2-4cf1-a64b-6f2044900cd7', '442feced-602c-4463-b5ba-195ee4677509', 'C2', 6),
	('938022e5-02ef-4eee-aa9e-dc308ef3327b', '442feced-602c-4463-b5ba-195ee4677509', 'D1', 7),
	('28bed827-0d34-42c4-87cc-e6b7a2231ee6', 'd5cbaee6-2cc7-4609-9ae6-5a3fdc35613f', 'A1', 1),
	('58e1a4ba-73db-47a6-8bd6-98341c249c02', 'd5cbaee6-2cc7-4609-9ae6-5a3fdc35613f', 'A2', 2),
	('9c6edc90-fab6-4185-876a-e923870b6a96', 'd5cbaee6-2cc7-4609-9ae6-5a3fdc35613f', 'B1', 3),
	('a161600e-2daf-4a51-8b43-d5964bcd5593', 'd5cbaee6-2cc7-4609-9ae6-5a3fdc35613f', 'B2', 4),
	('cf811401-a041-4fb1-8095-ce06b986d261', 'd5cbaee6-2cc7-4609-9ae6-5a3fdc35613f', 'C1', 5),
	('54959674-2da1-4585-ae33-4ab6f5eee0fc', 'd5cbaee6-2cc7-4609-9ae6-5a3fdc35613f', 'C2', 6),
	('d6847168-7983-4f37-aebe-dbd59fea3cbc', 'd5cbaee6-2cc7-4609-9ae6-5a3fdc35613f', 'D1', 7),
	('c2392e0a-dce5-4cb3-9b01-21cea8049512', 'e6ce42d0-338e-4ab1-95a5-b4af44a3d0d6', 'T', 1),
	('e1167557-43ff-40e8-8293-6ed2a5a0bd46', 'e6ce42d0-338e-4ab1-95a5-b4af44a3d0d6', 'A1', 2),
	('3b448a74-0dac-4eee-9e4d-187a12cd67c6', 'e6ce42d0-338e-4ab1-95a5-b4af44a3d0d6', 'A2', 3),
	('5dbc533b-1fc5-4a30-971b-4ec0c11e9e76', 'e6ce42d0-338e-4ab1-95a5-b4af44a3d0d6', 'A3', 4),
	('21eb3a19-d991-4669-a067-3d78b66158ef', 'e6ce42d0-338e-4ab1-95a5-b4af44a3d0d6', 'B1', 5),
	('36d48eb5-9664-417d-88f9-e20a2706d4fd', 'e6ce42d0-338e-4ab1-95a5-b4af44a3d0d6', 'B2', 6),
	('d8828126-f1da-4bcd-8609-38c19341c260', 'e6ce42d0-338e-4ab1-95a5-b4af44a3d0d6', 'B3', 7),
	('70f8ecdf-7142-468c-bdc8-7a617fa89dde', '9186836a-d61c-40cb-bef0-173364e303f6', 'T', 1),
	('39fdecb6-541e-4817-b0fa-9203c999be60', '9186836a-d61c-40cb-bef0-173364e303f6', 'A1', 2),
	('2994542e-cb78-46f3-b645-6639d4a114bf', '9186836a-d61c-40cb-bef0-173364e303f6', 'A2', 3),
	('39921491-de62-4eb9-b71b-d50cbc0dbf08', '9186836a-d61c-40cb-bef0-173364e303f6', 'A3', 4),
	('2c1b1965-461f-4ca2-aea7-8aed58699bc2', '9186836a-d61c-40cb-bef0-173364e303f6', 'B1', 5),
	('8328d9e6-0ab0-4704-9e62-3b8b8a659385', '9186836a-d61c-40cb-bef0-173364e303f6', 'B2', 6),
	('66bcac0e-af23-4b7d-b150-13e0b5be3e23', '9186836a-d61c-40cb-bef0-173364e303f6', 'B3', 7),
	('e2e19e2b-ebd8-4838-96ac-690a1adaa1ec', '1deaeb6a-898c-4d56-b648-e7c90dcbe732', 'T', 1),
	('1fd9b346-95e9-4d35-86d1-c9c1d7346db3', '1deaeb6a-898c-4d56-b648-e7c90dcbe732', 'A1', 2),
	('28de8333-ef18-4af0-a065-e574fd29e224', '1deaeb6a-898c-4d56-b648-e7c90dcbe732', 'A2', 3),
	('9e7ab598-8674-4161-af7d-7542c4285428', '1deaeb6a-898c-4d56-b648-e7c90dcbe732', 'A3', 4),
	('af4f1ed3-c3f3-4ff8-b4ff-7c315e9579f8', '89adf35c-4187-4bfd-be0f-1d778907ee61', 'T', 1),
	('05a51b47-9d33-440a-8f71-406caf524800', '89adf35c-4187-4bfd-be0f-1d778907ee61', 'A1', 2),
	('c4672b81-088c-4626-aa37-df93666c5218', '89adf35c-4187-4bfd-be0f-1d778907ee61', 'A2', 3),
	('6a064ff9-87a3-488c-a476-5257f513a205', '89adf35c-4187-4bfd-be0f-1d778907ee61', 'A3', 4);


--
-- Data for Name: trip_driver_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: trip_seats; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."trip_seats" ("id", "trip_id", "seat_id", "booking_id", "status") VALUES
	('101ebfbb-add3-4801-a1e3-4be2651957a8', '9db20127-d762-4753-b5a3-cb5b69cb4022', 'cca17eb8-0400-4c1b-85db-e66b1c5c1dd8', '4b81a0a4-9214-4c95-b529-407f54ce4749', 'ASSIGNED'),
	('a6548084-8840-4371-a523-52a88781bb17', '9db20127-d762-4753-b5a3-cb5b69cb4022', 'e935e909-b996-46a1-baf2-c56740002ec9', '4b81a0a4-9214-4c95-b529-407f54ce4749', 'ASSIGNED'),
	('c47455df-be29-4ee7-896b-a24d99c32bbb', '0df44a42-b863-4f51-8c83-ecac9d16ff25', 'c2392e0a-dce5-4cb3-9b01-21cea8049512', NULL, 'available'),
	('85e879c4-abf6-43ec-a41b-9c94be3517fb', '0df44a42-b863-4f51-8c83-ecac9d16ff25', 'e1167557-43ff-40e8-8293-6ed2a5a0bd46', NULL, 'available'),
	('a83e0fa8-aee4-409b-8a2d-2132c630ec7e', '0df44a42-b863-4f51-8c83-ecac9d16ff25', '3b448a74-0dac-4eee-9e4d-187a12cd67c6', NULL, 'available'),
	('a8189b8a-de6c-4c61-b4dc-9c84cfb0ff0f', '0df44a42-b863-4f51-8c83-ecac9d16ff25', '5dbc533b-1fc5-4a30-971b-4ec0c11e9e76', NULL, 'available'),
	('9a50d56a-02a8-4fef-bfca-eb815c57dc95', '0df44a42-b863-4f51-8c83-ecac9d16ff25', '21eb3a19-d991-4669-a067-3d78b66158ef', NULL, 'available'),
	('7855513f-4234-4691-9abf-b16d70dcc8e3', '0df44a42-b863-4f51-8c83-ecac9d16ff25', '36d48eb5-9664-417d-88f9-e20a2706d4fd', NULL, 'available'),
	('7362b4e6-c01e-4b06-b77e-79840fcc2af6', '0df44a42-b863-4f51-8c83-ecac9d16ff25', 'd8828126-f1da-4bcd-8609-38c19341c260', NULL, 'available'),
	('25187484-1bb8-4733-afd4-eb08a3a0e2ba', '8490388f-bb42-4ccc-b5b8-e690b756ce9e', 'e2e19e2b-ebd8-4838-96ac-690a1adaa1ec', NULL, 'available'),
	('a3531bf6-edde-4a9f-9f5a-4d2a154da8aa', '8490388f-bb42-4ccc-b5b8-e690b756ce9e', '1fd9b346-95e9-4d35-86d1-c9c1d7346db3', NULL, 'available'),
	('21f9843e-249f-45ba-a112-f77e00262d63', '8490388f-bb42-4ccc-b5b8-e690b756ce9e', '28de8333-ef18-4af0-a065-e574fd29e224', NULL, 'available'),
	('dc0421a4-e729-40b7-905b-2f7f1df19226', '8490388f-bb42-4ccc-b5b8-e690b756ce9e', '9e7ab598-8674-4161-af7d-7542c4285428', NULL, 'available'),
	('4535c5d5-00e7-4f35-b9bb-5860dc7c00bc', '06feb588-0cb1-43d0-a730-3e7894e8967d', '70f8ecdf-7142-468c-bdc8-7a617fa89dde', NULL, 'available'),
	('79e241d6-f175-471f-9bff-5f4398799cfc', '06feb588-0cb1-43d0-a730-3e7894e8967d', '39fdecb6-541e-4817-b0fa-9203c999be60', NULL, 'available'),
	('abf2fa45-5238-4039-8e91-93019d93a97a', '06feb588-0cb1-43d0-a730-3e7894e8967d', '2994542e-cb78-46f3-b645-6639d4a114bf', NULL, 'available'),
	('933e4826-8c3d-4ab3-b7b1-d921d1551d2f', '06feb588-0cb1-43d0-a730-3e7894e8967d', '39921491-de62-4eb9-b71b-d50cbc0dbf08', NULL, 'available'),
	('e724ee0b-5527-420e-b167-0dc20676a640', '06feb588-0cb1-43d0-a730-3e7894e8967d', '2c1b1965-461f-4ca2-aea7-8aed58699bc2', NULL, 'available'),
	('c3913198-00f9-4126-afd5-d3cde0b285d2', '06feb588-0cb1-43d0-a730-3e7894e8967d', '8328d9e6-0ab0-4704-9e62-3b8b8a659385', NULL, 'available'),
	('c02ef3d4-9245-47f9-85db-dedcfe11623c', '06feb588-0cb1-43d0-a730-3e7894e8967d', '66bcac0e-af23-4b7d-b150-13e0b5be3e23', NULL, 'available'),
	('4779fe65-713b-4ae3-8407-5d6330301d15', '1a970921-66d9-4d20-baea-b8cf53113ae4', 'af4f1ed3-c3f3-4ff8-b4ff-7c315e9579f8', NULL, 'available'),
	('d34b728f-ed28-4e92-9e62-fe10acfe697f', '1a970921-66d9-4d20-baea-b8cf53113ae4', '05a51b47-9d33-440a-8f71-406caf524800', NULL, 'available'),
	('276e29e9-8b33-48f4-93fc-d77b95ccfa03', '1a970921-66d9-4d20-baea-b8cf53113ae4', 'c4672b81-088c-4626-aa37-df93666c5218', NULL, 'available'),
	('5b38e6ec-9212-4450-854f-4d54ed4f5e66', '1a970921-66d9-4d20-baea-b8cf53113ae4', '6a064ff9-87a3-488c-a476-5257f513a205', NULL, 'available'),
	('f4a6520b-b4ac-4955-9b55-7ce7a47848ee', '9d2b2e03-5fb2-4c73-b47b-3e88254ed0f9', 'c2392e0a-dce5-4cb3-9b01-21cea8049512', NULL, 'available'),
	('5523a286-9cc6-41ac-9165-1b1391afb95c', '9d2b2e03-5fb2-4c73-b47b-3e88254ed0f9', 'e1167557-43ff-40e8-8293-6ed2a5a0bd46', NULL, 'available'),
	('6ba19d25-4131-4118-a9f5-4f9fcec53ef6', '9d2b2e03-5fb2-4c73-b47b-3e88254ed0f9', '3b448a74-0dac-4eee-9e4d-187a12cd67c6', NULL, 'available'),
	('e8f8bb60-69a9-4e15-a904-e239b8994fe6', '9d2b2e03-5fb2-4c73-b47b-3e88254ed0f9', '5dbc533b-1fc5-4a30-971b-4ec0c11e9e76', NULL, 'available'),
	('a5ef02b8-2e7c-457b-81a6-5e1be96afbfa', '9d2b2e03-5fb2-4c73-b47b-3e88254ed0f9', '21eb3a19-d991-4669-a067-3d78b66158ef', NULL, 'available'),
	('2ed37c3b-f251-43a3-8a7a-7e82c7b85210', '9d2b2e03-5fb2-4c73-b47b-3e88254ed0f9', '36d48eb5-9664-417d-88f9-e20a2706d4fd', NULL, 'available'),
	('f64dad32-0aab-4d8a-ab4d-479b0301b26d', '9d2b2e03-5fb2-4c73-b47b-3e88254ed0f9', 'd8828126-f1da-4bcd-8609-38c19341c260', NULL, 'available'),
	('ac5a13ca-f044-430e-b2de-1b3a1470a4ca', '723438d2-988d-4ebb-9550-9a2335904ade', 'e2e19e2b-ebd8-4838-96ac-690a1adaa1ec', NULL, 'available'),
	('3ec2c9fd-c521-40cf-8a15-a1c647ae4dd9', '723438d2-988d-4ebb-9550-9a2335904ade', '1fd9b346-95e9-4d35-86d1-c9c1d7346db3', NULL, 'available'),
	('8833a6f0-999c-4698-9c08-b5a0505cb655', '723438d2-988d-4ebb-9550-9a2335904ade', '28de8333-ef18-4af0-a065-e574fd29e224', NULL, 'available'),
	('7f869bc3-9d17-4814-b4e1-5efae2174741', '723438d2-988d-4ebb-9550-9a2335904ade', '9e7ab598-8674-4161-af7d-7542c4285428', NULL, 'available'),
	('8eb04d1c-5db4-4ca8-940c-eb1d5bd921fc', '6c30283a-24fb-480a-ad07-48fd371e46c4', '70f8ecdf-7142-468c-bdc8-7a617fa89dde', NULL, 'available'),
	('6c6a848e-5465-4e10-979e-bdc91c369633', '6c30283a-24fb-480a-ad07-48fd371e46c4', '39fdecb6-541e-4817-b0fa-9203c999be60', NULL, 'available'),
	('3193764a-1f21-49f8-afeb-09de175efc78', '6c30283a-24fb-480a-ad07-48fd371e46c4', '2994542e-cb78-46f3-b645-6639d4a114bf', NULL, 'available'),
	('a12a872d-329c-4df1-95e4-d8d99ea4cebe', '6c30283a-24fb-480a-ad07-48fd371e46c4', '39921491-de62-4eb9-b71b-d50cbc0dbf08', NULL, 'available'),
	('a7212084-a98f-4a25-ab20-da077ffe7fc8', '6c30283a-24fb-480a-ad07-48fd371e46c4', '2c1b1965-461f-4ca2-aea7-8aed58699bc2', NULL, 'available'),
	('7eb1a590-301f-4076-b258-d43ff824df9f', '6c30283a-24fb-480a-ad07-48fd371e46c4', '8328d9e6-0ab0-4704-9e62-3b8b8a659385', NULL, 'available'),
	('3e6edb4c-a81a-41e3-9579-822dfad3b83f', '6c30283a-24fb-480a-ad07-48fd371e46c4', '66bcac0e-af23-4b7d-b150-13e0b5be3e23', NULL, 'available'),
	('20e83f5e-c0b0-44ba-aa92-d1f957c846f0', '48a87f1b-7657-423b-8cfc-551c8b581876', 'af4f1ed3-c3f3-4ff8-b4ff-7c315e9579f8', NULL, 'available'),
	('1f7da55e-bcc5-49d1-bc1a-c552a51bbf76', '48a87f1b-7657-423b-8cfc-551c8b581876', '05a51b47-9d33-440a-8f71-406caf524800', NULL, 'available'),
	('78d2c075-24c2-4ea0-815b-f6fdd418328c', '48a87f1b-7657-423b-8cfc-551c8b581876', 'c4672b81-088c-4626-aa37-df93666c5218', NULL, 'available'),
	('1cbf1806-498f-4280-a56a-e3e1cf94a967', '48a87f1b-7657-423b-8cfc-551c8b581876', '6a064ff9-87a3-488c-a476-5257f513a205', NULL, 'available');


--
-- Data for Name: vehicle_locations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 49, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict tx9eGfULrqligwuBhg5kzAzK4cxtMJwQqpx1fROleFlzIikftWKvQ5NNbzy7Lhh

RESET ALL;
