import { redirect } from "next/navigation";

export default async function ParentPage({
  searchParams
}: {
  searchParams: Promise<{ childId?: string }>;
}) {
  const params = await searchParams;
  redirect(params.childId ? `/dashboard?childId=${params.childId}` : "/dashboard");
}
