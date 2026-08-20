import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

// Só checa a presença do cookie (UX: evita renderizar o mapa antes de redirecionar).
// A validação de verdade do JWT acontece a cada request no backend — isso aqui não é
// a fronteira de segurança, só evita o flash de conteúdo autenticado.
export function middleware(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/map/:path*", "/management/:path*", "/profile/:path*"],
};
