import { NextRequest } from "next/server";
import { proxyJson } from "@/lib/backend-proxy";

export async function PATCH(req: NextRequest) {
  const body = await req.text();
  return proxyJson("/user/me/location", { method: "PATCH", body });
}
