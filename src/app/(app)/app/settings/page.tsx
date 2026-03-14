import Link from "next/link";

import { PageHeader } from "@/components/app/page-header";
import { RoleBadge } from "@/components/app/status-badge";
import { demoData } from "@/lib/domain/demo-data";
import { requireAppContext } from "@/lib/auth/session";

export default async function SettingsPage() {
  const context = await requireAppContext();
  const canManageData = context.member.role === "org_admin" || context.member.role === "ops_manager";

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Organization settings"
        description="Manage member roles, webhook endpoints, notification defaults, and deployment-facing configuration."
        actions={
          canManageData ? (
            <Link
              href="/app/settings/data"
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-[var(--foreground)] px-4 text-sm font-semibold text-[var(--background)] transition hover:opacity-90"
            >
              Open data workspace
            </Link>
          ) : null
        }
      />

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--muted)]">Organization</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[var(--foreground)]">
            {context.organization.name}
          </h2>
          <div className="mt-5 space-y-3 text-sm text-[var(--muted)]">
            <p>Slug: {context.organization.slug}</p>
            <p>Timezone: {context.organization.timezone}</p>
            <p>Mode: {context.mode}</p>
          </div>
        </article>

        <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--muted)]">Members</p>
          <div className="mt-4 space-y-3">
            {demoData.members.map((member) => {
              const profile = demoData.profiles.find((item) => item.id === member.profileId)!;
              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-[22px] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">{profile.fullName}</p>
                    <p className="mt-1 text-xs text-[var(--muted)]">{profile.email}</p>
                  </div>
                  <RoleBadge role={member.role} />
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--muted)]">Notification preferences</p>
          <div className="mt-4 space-y-3">
            {Object.entries(context.profile.notificationPreferences).map(([key, enabled]) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-[22px] border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4"
              >
                <span className="text-sm text-[var(--foreground)]">{key}</span>
                <span className="text-sm font-medium text-[var(--muted)]">{enabled ? "Enabled" : "Disabled"}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-[var(--muted)]">Webhook endpoints</p>
          <div className="mt-4 space-y-3">
            {demoData.webhookEndpoints.map((endpoint) => (
              <div
                key={endpoint.id}
                className="rounded-[22px] border border-[var(--border)] bg-[var(--surface-strong)] p-4"
              >
                <p className="text-sm font-semibold text-[var(--foreground)]">{endpoint.label}</p>
                <p className="mt-2 text-sm text-[var(--muted)]">{endpoint.url}</p>
                <p className="mt-3 text-xs text-[var(--muted)]">{endpoint.subscribedEvents.join(", ")}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  );
}
