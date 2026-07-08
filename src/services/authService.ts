import { supabase } from "../utils/supabase";

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    phone?: string;
  };
}

export interface AuthResponse {
  user: User | null;
  session: import("@supabase/supabase-js").Session | null;
  error: Error | null;
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(
  email: string,
  password: string,
  fullName: string,
  phone: string,
): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
        },
      },
    });

    if (error) {
      return { user: null, session: null, error };
    }

    // // Create user profile in the profiles table
    // if (data.user) {
    //   const { error: profileError } = await supabase.from("profiles").insert({
    //     id: data.user.id,
    //     full_name: fullName,
    //     phone,
    //     role: "customer",
    //   });

    //   if (profileError) {
    //     console.error("Error creating profile:", profileError);
    //   }
    // }

    return {
      user: data.user as unknown as User,
      session: data.session,
      error: null,
    };
  } catch (error) {
    return { user: null, session: null, error: error as Error };
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string,
): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, session: null, error };
    }

    return {
      user: data.user as unknown as User,
      session: data.session,
      error: null,
    };
  } catch (error) {
    return { user: null, session: null, error: error as Error };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    return { error: error as Error };
  }
}

/**
 * Get current user session
 */
async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) return null;
    return user as User;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Get user profile data
 */
async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data as Profile;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      callback(session.user as unknown as User);
    } else {
      callback(null);
    }
  });

  return subscription;
}
export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: "admin" | "staff" | "driver";
  status: "active" | "inactive";
  created_at: string;
}

/**
 * Web quản trị chỉ dành cho admin/staff đang active (driver dùng app mobile).
 * Dùng chung ở ProtectedRoute/PublicRoute/LoginPage — 3 nơi phải cùng một
 * điều kiện, lệch nhau sẽ gây vòng lặp redirect giữa các route guard.
 */
export function canAccessAdminPortal(profile: Profile | null): boolean {
  return (
    !!profile &&
    profile.status === "active" &&
    (profile.role === "admin" || profile.role === "staff")
  );
}
export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }
  return getUserProfile(user.id);
}
// Note: this file might still have type mismatches in current project config.
