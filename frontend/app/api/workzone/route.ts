import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, authHeader } from "@/lib/auth";
import { proxyJson } from "@/lib/backend-proxy";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  const body = await request.text();
  return proxyJson("/workzone", { method: "POST", body });
}

export async function GET() {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${API_URL}/workzone`, {
      cache: "no-store",
      headers: authHeader(token),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { message: "Ocorreu um erro ao buscar as zonas" },
      { status: 500 }
    );
  }
}
