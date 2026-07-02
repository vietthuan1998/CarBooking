import axios, { type AxiosInstance } from "axios";
import { supabase } from "./supabase";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Instance riêng để gọi Supabase Edge Functions bằng axios.
export const edgeFunctionClient: AxiosInstance = axios.create({
  baseURL: `${SUPABASE_URL}/functions/v1`,
  headers: {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
  },
});

// Tự gắn access_token hiện tại (nếu có) vào mỗi request trước khi gửi đi.
edgeFunctionClient.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token ?? SUPABASE_ANON_KEY;
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});
