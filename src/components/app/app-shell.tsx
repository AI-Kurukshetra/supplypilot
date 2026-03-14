import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";
import type { AwaitedAppContext } from "@/types/app";

export function AppShell({
  context,
  children,
}: {
  context: AwaitedAppContext;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen lg:flex">
      <Sidebar organizationName={context.organization.name} />
      <div className="min-w-0 flex-1">
        <Topbar
          fullName={context.profile.fullName}
          roleLabel={context.member.role.replaceAll("_", " ")}
          unreadNotifications={context.notifications.unreadCount}
        />
        <main className="mx-auto flex max-w-[1600px] flex-col gap-6 px-5 py-6">{children}</main>
      </div>
    </div>
  );
}
