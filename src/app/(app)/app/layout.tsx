import { AppShell } from "@/components/app/app-shell";
import { requireAppContext } from "@/lib/auth/session";

export default async function InternalAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const context = await requireAppContext();

  return <AppShell context={context}>{children}</AppShell>;
}
