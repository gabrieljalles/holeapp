"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "../_context/AuthContext";

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();

  const [matricula, setMatricula] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricula, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Erro ao entrar",
          description: data.message || "Matrícula ou senha inválidos.",
        });
        return;
      }

      await refresh();
      router.push(searchParams.get("next") || "/map");
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao entrar",
        description: "Não foi possível conectar ao servidor.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
        <h1 className="text-xl font-semibold mb-1 text-center">HoleApp</h1>
        <p className="text-sm text-gray-500 mb-5 text-center">Entre com sua matrícula e senha</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="matricula" className="text-sm font-medium mb-1 block">
              Matrícula
            </Label>
            <Input
              id="matricula"
              name="matricula"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-sm font-medium mb-1 block">
              Senha
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#52c458] hover:bg-[#45a94a] text-white font-bold rounded shadow-lg"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-5">
          Ainda não tem conta?{" "}
          <Link href="/register" className="text-[#52c458] font-semibold">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
};

const LoginPage = () => (
  <Suspense fallback={null}>
    <LoginForm />
  </Suspense>
);

export default LoginPage;
