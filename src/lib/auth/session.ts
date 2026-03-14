import { cache } from "react";
import { redirect } from "next/navigation";

import { resolveIdentityByAuthUserId } from "@/lib/auth/identity";
import { demoData } from "@/lib/domain/demo-data";
import { getNotificationCenter } from "@/lib/domain/queries";
import type { NotificationCenter, Organization, OrganizationMember, Profile } from "@/lib/domain/types";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

type AppContext = {
  mode: "demo" | "supabase";
  organization: Organization;
  profile: Profile;
  member: OrganizationMember;
  notifications: NotificationCenter;
};

export const getAppContext = cache(async (): Promise<AppContext | null> => {
  if (isDemoMode()) {
    const profile = demoData.profiles[0];
    const member = demoData.members[0];
    const notifications = await getNotificationCenter(profile.id);

    return {
      mode: "demo" as const,
      organization: demoData.organization,
      profile,
      member,
      notifications,
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const identity = await resolveIdentityByAuthUserId(user.id);
    if (!identity) {
      return null;
    }

    const notifications = await getNotificationCenter(identity.profile.id);

    return {
      mode: "supabase" as const,
      organization: identity.organization,
      profile: identity.profile,
      member: identity.member,
      notifications,
    };
  } catch {
    if (isDemoMode()) {
      const profile = demoData.profiles[0];
      const member = demoData.members[0];
      const notifications = await getNotificationCenter(profile.id);

      return {
        mode: "demo" as const,
        organization: demoData.organization,
        profile,
        member,
        notifications,
      };
    }

    return null;
  }
});

export async function requireAppContext(): Promise<AppContext> {
  const context = await getAppContext();

  if (!context) {
    redirect("/sign-in");
  }

  return context;
}
