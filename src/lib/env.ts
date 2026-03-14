type AppEnv = {
  appUrl: string;
  supabaseUrl?: string;
  supabasePublishableKey?: string;
  supabaseServiceRoleKey?: string;
  resendApiKey?: string;
  resendFromEmail?: string;
};

const appEnv: AppEnv = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  resendApiKey: process.env.RESEND_API_KEY,
  resendFromEmail: process.env.RESEND_FROM_EMAIL,
};

export function getAppEnv() {
  return appEnv;
}

export function hasSupabaseCredentials() {
  return Boolean(appEnv.supabaseUrl && appEnv.supabasePublishableKey);
}

export function hasSupabaseServiceRole() {
  return hasSupabaseCredentials() && Boolean(appEnv.supabaseServiceRoleKey);
}

export function hasResendCredentials() {
  return Boolean(appEnv.resendApiKey && appEnv.resendFromEmail);
}

export function requireSupabaseEnv() {
  if (!appEnv.supabaseUrl || !appEnv.supabasePublishableKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY before running SupplyPilot.",
    );
  }

  return {
    supabaseUrl: appEnv.supabaseUrl,
    supabasePublishableKey: appEnv.supabasePublishableKey,
  };
}

export function requireResendEnv() {
  if (!appEnv.resendApiKey || !appEnv.resendFromEmail) {
    throw new Error(
      "Missing Resend environment variables. Set RESEND_API_KEY and RESEND_FROM_EMAIL.",
    );
  }

  return {
    resendApiKey: appEnv.resendApiKey,
    resendFromEmail: appEnv.resendFromEmail,
  };
}
