"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "../_context/AuthContext";

const RegisterPage = () => {
  const router = useRouter();
  const { refresh } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [matricula, setMatricula] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, matricula, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Erro ao cadastrar",
          description: Array.isArray(data.message) ? data.message.join(", ") : data.message,
        });
        return;
      }

      // Loga automaticamente após o cadastro, evitando pedir os dados de novo.
      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricula, password }),
      });

      if (loginResponse.ok) {
        await refresh();
        toast({
          variant: "successful",
          title: "Conta criada!",
          description: "Bem-vindo(a) ao HoleApp.",
        });
        router.push("/map");
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar",
        description: "Não foi possível conectar ao servidor.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full">
        <h1 className="text-xl font-semibold mb-1 text-center">Criar conta</h1>
        <p className="text-sm text-gray-500 mb-5 text-center">
          Toda conta nova começa como visualizador
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="fullName" className="text-sm font-medium mb-1 block">
              Nome completo
            </Label>
            <Input
              id="fullName"
              name="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-sm font-medium mb-1 block">
              E-mail
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

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
              minLength={4}
              maxLength={5}
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
              minLength={4}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#52c458] hover:bg-[#45a94a] text-white font-bold rounded shadow-lg"
          >
            {isSubmitting ? "Criando conta..." : "Criar conta"}
          </Button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-5">
          Já tem conta?{" "}
          <Link href="/login" className="text-[#52c458] font-semibold">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
