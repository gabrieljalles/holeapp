import { NextRequest } from "next/server";
import { proxyJson } from "@/lib/backend-proxy";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyJson(`/workzone/${id}/force-complete`, { method: "POST" });
}
