import { NextResponse } from "next/server";
import { z } from "zod";

import { DEFAULT_PREMIUM_PLAN } from "@/lib/constants/game-economy";
import { getServerAuthContext } from "@/features/auth/server-auth";
import { UserSubscription } from "@/types/activity";

const payloadSchema = z.object({
  planType: z
    .enum(["free", "premium-monthly", "premium-yearly"])
    .default(DEFAULT_PREMIUM_PLAN)
});

function mapSubscription(row: {
  id: string;
  account_id: string;
  plan_type: string;
  status: string;
  starts_at: string | null;
  ends_at: string | null;
  payment_provider: string | null;
  provider_customer_id: string | null;
  provider_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}): UserSubscription {
  return {
    id: row.id,
    accountId: row.account_id,
    planType: row.plan_type as UserSubscription["planType"],
    status: row.status as UserSubscription["status"],
    startsAt: row.starts_at ?? undefined,
    endsAt: row.ends_at ?? undefined,
    paymentProvider: row.payment_provider ?? undefined,
    providerCustomerId: row.provider_customer_id ?? undefined,
    providerSubscriptionId: row.provider_subscription_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function POST(request: Request) {
  const { supabase, user, profile } = await getServerAuthContext();

  if (!supabase) {
    return NextResponse.json(
      {
        ok: false,
        error: "Supabase is not configured for server-side subscription updates."
      },
      { status: 503 }
    );
  }

  if (!user || !profile) {
    return NextResponse.json(
      { ok: false, error: "Authentication required." },
      { status: 401 }
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const parsed = payloadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Subscription payload is invalid." },
      { status: 400 }
    );
  }

  const timestamp = new Date().toISOString();
  const { data, error } = await supabase
    .from("user_subscriptions")
    .upsert(
      {
        account_id: profile.id,
        plan_type: parsed.data.planType,
        status: "active",
        starts_at: timestamp,
        payment_provider: "manual"
      },
      {
        onConflict: "account_id"
      }
    )
    .select("*")
    .single();

  if (error || !data) {
    return NextResponse.json(
      {
        ok: false,
        error: "Subscription could not be updated."
      },
      { status: error?.code === "42501" ? 403 : 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    subscription: mapSubscription(
      data as {
        id: string;
        account_id: string;
        plan_type: string;
        status: string;
        starts_at: string | null;
        ends_at: string | null;
        payment_provider: string | null;
        provider_customer_id: string | null;
        provider_subscription_id: string | null;
        created_at: string;
        updated_at: string;
      }
    )
  });
}
