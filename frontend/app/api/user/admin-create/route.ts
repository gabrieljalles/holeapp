import { NextRequest } from "next/server";
import { proxyJson } from "@/lib/backend-proxy";

export async function POST(req: NextRequest) {
  const body = await req.text();
  return proxyJson("/user/admin-create", { method: "POST", body });
}
