import { cookies } from "next/headers";

export const AUTH_COOKIE_NAME = "holeapp_token";

// Uso apenas em Route Handlers / Server Components — lê o JWT do cookie httpOnly,
// nunca exposto ao JS do navegador.
export async function getAuthToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(AUTH_COOKIE_NAME)?.value ?? null;
}

export function authHeader(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
