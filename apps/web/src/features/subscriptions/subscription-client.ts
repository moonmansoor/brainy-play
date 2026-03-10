import { DEFAULT_PREMIUM_PLAN } from "@/lib/constants/game-economy";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  loadLocalSubscriptions,
  saveLocalSubscription
} from "@/lib/utils/storage";
import {
  SubscriptionPlanType,
  UserSubscription
} from "@/types/activity";

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

export async function getParentSubscription(parentId: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return (
      loadLocalSubscriptions().find((item) => item.accountId === parentId) ?? null
    );
  }

  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("account_id", parentId)
    .maybeSingle();

  if (error || !data) return null;
  return mapSubscription(
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
  );
}

export async function activatePremiumSubscription(input: {
  parentId: string;
  planType?: SubscriptionPlanType;
}) {
  const planType = input.planType ?? DEFAULT_PREMIUM_PLAN;
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    const timestamp = new Date().toISOString();
    const subscription: UserSubscription = {
      id: crypto.randomUUID(),
      accountId: input.parentId,
      planType,
      status: "active",
      startsAt: timestamp,
      paymentProvider: "demo",
      createdAt: timestamp,
      updatedAt: timestamp
    };

    saveLocalSubscription(subscription);
    return subscription;
  }

  const response = await fetch("/api/subscriptions/upgrade", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      planType
    })
  });

  const result = (await response.json()) as {
    ok: boolean;
    subscription?: UserSubscription;
    error?: string;
  };

  if (!response.ok || !result.ok || !result.subscription) {
    throw new Error(result.error ?? "Subscription could not be updated.");
  }

  return result.subscription;
}
