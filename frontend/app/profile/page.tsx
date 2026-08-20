"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiArrowLeft } from "react-icons/fi";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "../_context/AuthContext";

const ROLE_LABELS: Record<string, string> = {
  VIEWER: "Visualizador",
  ADDER: "Adicionador",
  REPAIRER: "Reparador",
  ADMIN: "Administrador",
};

const ProfilePage = () => {
  const { user, isLoading, refresh } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isLoading || !user) {
    return null;
  }

  const photoUrl = user.imgUserPath
    ? `${process.env.NEXT_PUBLIC_API_URL}/spothole/${user.imgUserPath}`
    : null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);

    setIsUploading(true);
    try {
      const response = await fetch("/api/user/photo", {
        method: "PATCH",
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Erro ao enviar a foto.");
      }

      await refresh();
      toast({ title: "Foto atualizada com sucesso!" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar a foto",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/map">
            <Button size="icon" variant="outline">
              <FiArrowLeft />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Meu perfil</h1>
        </div>

        <div className="flex flex-col items-center gap-4 rounded-lg border bg-white p-6">
          <div className="relative h-28 w-28 overflow-hidden rounded-full border bg-gray-100">
            {photoUrl ? (
              <Image src={photoUrl} alt="Foto de perfil" fill style={{ objectFit: "cover" }} />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-300">
                <User size={48} />
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? "Enviando..." : "Trocar foto"}
          </Button>

          <div className="mt-2 w-full space-y-2 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Nome</span>
              <span className="font-medium">{user.fullName}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">Matrícula</span>
              <span className="font-medium">{user.matricula}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">E-mail</span>
              <span className="font-medium">{user.email || "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Função</span>
              <span className="font-medium">{ROLE_LABELS[user.role] ?? user.role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
