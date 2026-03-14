import { createAdminClient } from "@/lib/supabase/admin";

export async function resolveIdentityByAuthUserId(authUserId: string) {
  const supabase = createAdminClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", authUserId)
    .single();

  if (profileError || !profile) {
    return null;
  }

  const { data: member, error: memberError } = await supabase
    .from("organization_members")
    .select("*")
    .eq("profile_id", profile.id)
    .limit(1)
    .single();

  if (memberError || !member) {
    return null;
  }

  const { data: organization, error: organizationError } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", member.organization_id)
    .single();

  if (organizationError || !organization) {
    return null;
  }

  return {
    profile: {
      id: profile.id,
      authUserId: profile.auth_user_id,
      fullName: profile.full_name,
      email: profile.email,
      title: profile.title,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
      notificationPreferences: profile.notification_preferences,
    },
    member: {
      id: member.id,
      organizationId: member.organization_id,
      profileId: member.profile_id,
      role: member.role,
      customerId: member.customer_id,
      createdAt: member.created_at,
    },
    organization: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      timezone: organization.timezone,
      createdAt: organization.created_at,
      updatedAt: organization.updated_at,
    },
  };
}
