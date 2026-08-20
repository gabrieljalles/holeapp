import { NextRequest } from "next/server";
import { proxyJson } from "@/lib/backend-proxy";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  return proxyJson(`/user/${userId}`, { method: "DELETE" });
}
