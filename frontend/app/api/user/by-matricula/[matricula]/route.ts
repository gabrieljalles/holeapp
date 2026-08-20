import { NextRequest } from "next/server";
import { proxyJson } from "@/lib/backend-proxy";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ matricula: string }> }
) {
  const { matricula } = await params;
  return proxyJson(`/user/by-matricula/${encodeURIComponent(matricula)}`);
}
