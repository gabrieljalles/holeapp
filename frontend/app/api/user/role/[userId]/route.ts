import { NextRequest } from "next/server";
import { proxyJson } from "@/lib/backend-proxy";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const body = await req.text();
  return proxyJson(`/user/${userId}/role`, { method: "PATCH", body });
}
