import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, authHeader } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const qs = searchParams.toString();
    const token = await getAuthToken();

    const response = await fetch(
      `${API_URL}/spothole/filtered${qs ? `?${qs}` : ""}`,
      {
        cache: "no-store",
        headers: authHeader(token),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { message: "Ocorreu um erro ao buscar os dados" },
      { status: 500 }
    );
  }
}
