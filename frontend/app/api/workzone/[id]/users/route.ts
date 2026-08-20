import { NextRequest } from "next/server";
import { proxyJson } from "@/lib/backend-proxy";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.text();
  return proxyJson(`/workzone/${id}/users`, { method: "PATCH", body });
}
