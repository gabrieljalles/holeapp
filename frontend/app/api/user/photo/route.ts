import { NextRequest, NextResponse } from "next/server";
import { getAuthToken, authHeader } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function PATCH(req: NextRequest) {
  try {
    const formData = await req.formData();
    const token = await getAuthToken();

    const response = await fetch(`${API_URL}/user/me/photo`, {
      method: "PATCH",
      headers: authHeader(token),
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { message: "Ocorreu um erro ao enviar a foto." },
      { status: 500 }
    );
  }
}
