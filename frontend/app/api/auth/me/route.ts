import { NextResponse } from "next/server";
import { getAuthToken, authHeader } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET() {
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  try {
    const response = await fetch(`${API_URL}/user/profile`, {
      headers: authHeader(token),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    return NextResponse.json({ message: "Erro ao buscar perfil." }, { status: 500 });
  }
}
