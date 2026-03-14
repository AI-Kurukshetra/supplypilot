import { createClient } from "@supabase/supabase-js";

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

const organizationId = "00000000-0000-4000-8000-000000000001";

const demoUsers = [
  {
    profileId: "10000000-0000-4000-8000-000000000001",
    email: "avery@supplypilot.demo",
    password: "SupplyPilotDemo123!",
    fullName: "Avery Morgan",
  },
  {
    profileId: "10000000-0000-4000-8000-000000000002",
    email: "jordan@supplypilot.demo",
    password: "SupplyPilotDemo123!",
    fullName: "Jordan Patel",
  },
  {
    profileId: "10000000-0000-4000-8000-000000000003",
    email: "casey@supplypilot.demo",
    password: "SupplyPilotDemo123!",
    fullName: "Casey Nguyen",
  },
  {
    profileId: "10000000-0000-4000-8000-000000000004",
    email: "riley@bluepeakretail.demo",
    password: "SupplyPilotDemo123!",
    fullName: "Riley Chen",
  },
];

async function findUserByEmail(email) {
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw error;
    }

    const found = data.users.find((user) => user.email === email);
    if (found) {
      return found;
    }

    if (data.users.length < perPage) {
      return null;
    }

    page += 1;
  }
}

async function ensureDemoUser(userConfig) {
  let user = await findUserByEmail(userConfig.email);

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: userConfig.email,
      password: userConfig.password,
      email_confirm: true,
      user_metadata: {
        full_name: userConfig.fullName,
      },
      app_metadata: {
        source: "bootstrap-demo-auth",
      },
    });

    if (error) {
      throw error;
    }

    user = data.user;
  } else {
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password: userConfig.password,
      email_confirm: true,
      user_metadata: {
        ...(user.user_metadata ?? {}),
        full_name: userConfig.fullName,
      },
    });

    if (error) {
      throw error;
    }
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      auth_user_id: user.id,
      default_organization_id: organizationId,
    })
    .eq("id", userConfig.profileId);

  if (profileError) {
    throw profileError;
  }

  return {
    email: userConfig.email,
    userId: user.id,
  };
}

const results = [];

for (const demoUser of demoUsers) {
  const result = await ensureDemoUser(demoUser);
  results.push(result);
}

console.log("Bootstrapped demo auth users:");
for (const result of results) {
  console.log(`- ${result.email} -> ${result.userId}`);
}
console.log("Shared demo password: SupplyPilotDemo123!");
