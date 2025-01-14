import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const response = await fetch("http://localhost:3000/spotholes", {
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
