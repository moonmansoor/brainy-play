import { NextResponse } from "next/server";

import { getServerAuthContext } from "@/features/auth/server-auth";

export async function POST() {
  const { user } = await getServerAuthContext();

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        persisted: false,
        error: "Authentication required."
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    ok: true,
    persisted: false,
    provider: "manual-placeholder",
    status: "pending",
    message:
      "Subscription upgrades are using the MVP placeholder flow. Connect Stripe or another payment provider here later."
  });
}
