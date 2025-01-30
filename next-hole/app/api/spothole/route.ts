import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const route = `${API_URL}/spothole`;


//POST Line
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const response = await fetch(route, {
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
export async function GET() {
  
  try {
    const response = await fetch(route);

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

// DELETE ONE
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "ID inválido ou não fornecido!" },
        { status: 400 }
      );
    }

    const response = await axios.delete(`${route}/${id}`);

    return NextResponse.json(
      { message: "Buraco deletado com sucesso!", data: response.data },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Erro ao deletar buraco:", error);

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        {
          message: error.response?.data?.message || "Erro ao deletar o buraco!",
        },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { message: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}

//UPDATE ONE
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "ID inválido ou não fornecido!" },
        { status: 400 }
      );
    }

    const formData = await req.formData();

    const response = await axios.put(`${route}/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar o registro:", error);
    return NextResponse.json(
      { message: "Erro ao atualizar o registro." },
      { status: 500 }
    );
  }
}
