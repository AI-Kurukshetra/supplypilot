"use server";

import { redirect } from "next/navigation";

import { resolveIdentityByAuthUserId } from "@/lib/auth/identity";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

function getValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

export async function signInAction(formData: FormData) {
  if (isDemoMode()) {
    redirect("/app");
  }

  const email = getValue(formData, "email");
  const password = getValue(formData, "password");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/sign-in?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/app");
}

export async function signUpAction(formData: FormData) {
  if (isDemoMode()) {
    redirect("/onboarding");
  }

  const email = getValue(formData, "email");
  const password = getValue(formData, "password");
  const fullName = getValue(formData, "fullName");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    redirect(`/sign-up?error=${encodeURIComponent(error.message)}`);
  }

  if (data.user) {
    await supabase.from("profiles").upsert({
      auth_user_id: data.user.id,
      email,
      full_name: fullName,
      title: "Operations User",
      notification_preferences: {
        emailExceptionCreated: true,
        emailEtaChanged: true,
        emailShipmentDelayed: true,
        emailMilestoneReached: false,
      },
    });
  }

  redirect("/onboarding");
}

export async function signOutAction() {
  if (!isDemoMode()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/sign-in");
}

export async function completeOnboardingAction(formData: FormData) {
  if (isDemoMode()) {
    redirect("/app");
  }

  const organizationName = getValue(formData, "organizationName");
  const organizationSlug = getValue(formData, "organizationSlug");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const identity = await resolveIdentityByAuthUserId(user.id);

  if (!identity?.profile) {
    redirect("/sign-up");
  }

  const { data: organization, error } = await supabase
    .from("organizations")
    .insert({
      name: organizationName,
      slug: organizationSlug,
      timezone: "America/Chicago",
    })
    .select("*")
    .single();

  if (error || !organization) {
    redirect(`/onboarding?error=${encodeURIComponent(error?.message ?? "Unable to create organization")}`);
  }

  await supabase.from("organization_members").insert({
    organization_id: organization.id,
    profile_id: identity.profile.id,
    role: "org_admin",
  });

  await supabase
    .from("profiles")
    .update({
      default_organization_id: organization.id,
    })
    .eq("id", identity.profile.id);

  redirect("/app");
}
