import type { getAppContext } from "@/lib/auth/session";

export type AwaitedAppContext = NonNullable<Awaited<ReturnType<typeof getAppContext>>>;
