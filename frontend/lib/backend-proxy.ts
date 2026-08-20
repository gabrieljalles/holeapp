import { NextResponse } from "next/server";
import { getAuthToken, authHeader } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Encaminha uma requisição JSON simples para o backend, repassando o cookie de
// autenticação como Bearer token. Usado pelas rotas de proxy que só repassam
// corpo/resposta sem lógica extra (equipes, colaboradores, zonas de trabalho).
export async function proxyJson(path: string, init?: RequestInit) {
  const token = await getAuthToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...authHeader(token),
      ...(init?.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(data ?? { message: "Erro na requisição." }, { status: response.status });
  }

  return NextResponse.json(data);
}
