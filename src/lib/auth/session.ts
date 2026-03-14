import { cache } from "react";
import { redirect } from "next/navigation";

import { resolveIdentityByAuthUserId } from "@/lib/auth/identity";
import { demoData } from "@/lib/domain/demo-data";
import { getNotificationCenter } from "@/lib/domain/queries";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export const getAppContext = cache(async () => {
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

    return {
      mode: "supabase" as const,
      organization: identity.organization,
      profile: identity.profile,
      member: identity.member,
      notifications: {
        unreadCount: 0,
        items: [],
      },
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

export async function requireAppContext() {
  const context = await getAppContext();

  if (!context) {
    redirect("/sign-in");
  }

  return context;
}
