import axios from "axios";
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

// DELETE ONE
export async function DELETE(req: NextRequest, res : NextResponse) {

  try { 
    const {searchParams} = new URL(req.url);
    const id = searchParams.get("id");

    if (!id){
      return NextResponse.json(
        {message: "ID inválido ou não fornecido!"},
        {status: 400}
      )
    }

    const response = await axios.delete(`http://localhost:3001/spothole/${id}`);

    return NextResponse.json(
      { message: "Buraco deletado com sucesso!", data: response.data },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Erro ao deletar buraco:", error);

    if (error.response) {
      return NextResponse.json(
        { message: error.response.data.message || "Erro ao deletar o buraco!" },
        { status: error.response.status || 500 }
      );
    }

    return NextResponse.json(
      { message: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}

//UPDATE ONE


    