import { NextRequest, NextResponse } from "next/server";

//POST Line
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const response = await fetch("http://localhost:3001/spothole", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to send data to backend");
    }

    const responseData = await response.json();
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

//GET ALL
export async function GET(request: NextRequest) {
  try {
    const response = await fetch("http://localhost:3001/spothole");

    if (!response.ok) {
      throw new Error(
        `Erro ao buscar dados do backend: ${response.statusText}`
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Ocorreu um erro ao buscar os dados" },
      { status: 500 }
    );
  }
}
