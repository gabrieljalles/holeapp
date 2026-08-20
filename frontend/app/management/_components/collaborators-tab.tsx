"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { AuthUser, Role } from "@/types/User";

const ROLE_LABELS: Record<string, string> = {
  VIEWER: "Visualizador",
  ADDER: "Adicionador",
  REPAIRER: "Reparador",
  ADMIN: "Administrador",
};

const ASSIGNABLE_ROLES: Role[] = ["VIEWER", "REPAIRER", "ADDER"];

interface FoundUser {
  id: string;
  matricula: string;
  fullName: string;
  role: Role;
}

interface CollaboratorsTabProps {
  currentUserId: string;
}

const emptyNewUser = { matricula: "", email: "", fullName: "", password: "" };

// Círculo com a foto do usuário (ou a inicial do nome, quando não há foto) — pra
// identificar quem é só de bater o olho na tabela.
const Avatar = ({ fullName, imgUserPath }: { fullName: string; imgUserPath?: string | null }) => {
  const url = imgUserPath ? `${process.env.NEXT_PUBLIC_API_URL}/spothole/${imgUserPath}` : null;

  return (
    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full border bg-gray-100">
      {url ? (
        <Image src={url} alt={fullName} fill style={{ objectFit: "cover" }} />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-500">
          {fullName.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};

const CollaboratorsTab = ({ currentUserId }: CollaboratorsTabProps) => {
  const [newUser, setNewUser] = useState(emptyNewUser);
  const [newUserRole, setNewUserRole] = useState<Role>("VIEWER");
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const [promoteMatricula, setPromoteMatricula] = useState("");
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
  const [promoteRole, setPromoteRole] = useState<Role>("VIEWER");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);

  const [allUsers, setAllUsers] = useState<AuthUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  const loadAllUsers = () => {
    setIsLoadingUsers(true);
    fetch("/api/user")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setAllUsers(Array.isArray(data) ? data : []))
      .catch(() => setAllUsers([]))
      .finally(() => setIsLoadingUsers(false));
  };

  useEffect(() => {
    loadAllUsers();
  }, []);

  const handleCreateUser = async () => {
    if (!newUser.matricula.trim() || !newUser.email.trim() || !newUser.fullName.trim() || !newUser.password.trim()) {
      toast({ variant: "destructive", title: "Preencha todos os campos." });
      return;
    }
    setIsCreatingUser(true);
    try {
      const res = await fetch("/api/user/admin-create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newUser, role: newUserRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Erro ao criar usuário.");

      setNewUser(emptyNewUser);
      setNewUserRole("VIEWER");
      loadAllUsers();
      toast({ title: "Usuário criado com sucesso!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao criar usuário", description: error instanceof Error ? error.message : undefined });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleLookupUser = async () => {
    if (!promoteMatricula.trim()) return;
    setIsLookingUp(true);
    setFoundUser(null);
    try {
      const res = await fetch(`/api/user/by-matricula/${encodeURIComponent(promoteMatricula.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Usuário não encontrado.");
      setFoundUser(data);
      setPromoteRole(data.role);
    } catch (error) {
      toast({ variant: "destructive", title: "Usuário não encontrado", description: error instanceof Error ? error.message : undefined });
    } finally {
      setIsLookingUp(false);
    }
  };

  const handlePromote = async () => {
    if (!foundUser) return;
    setIsPromoting(true);
    try {
      const res = await fetch(`/api/user/role/${foundUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: promoteRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Erro ao alterar papel.");
      setFoundUser({ ...foundUser, role: promoteRole });
      toast({ title: "Papel atualizado!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao alterar papel", description: error instanceof Error ? error.message : undefined });
    } finally {
      setIsPromoting(false);
    }
  };

  const handleChangeUserRole = async (userId: string, newRole: Role) => {
    try {
      const res = await fetch(`/api/user/role/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Erro ao alterar papel.");
      loadAllUsers();
      toast({ title: "Papel atualizado!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao alterar papel", description: error instanceof Error ? error.message : undefined });
    }
  };

  const handleDeleteUser = async (target: AuthUser) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir ${target.fullName} (matrícula ${target.matricula})? Essa ação não pode ser desfeita.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/user/${target.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Erro ao excluir usuário.");
      loadAllUsers();
      toast({ title: "Usuário excluído." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao excluir usuário", description: error instanceof Error ? error.message : undefined });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-sm font-bold uppercase text-gray-600">Criar colaborador</h2>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Nome completo</Label>
              <Input value={newUser.fullName} onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Matrícula</Label>
              <Input value={newUser.matricula} onChange={(e) => setNewUser({ ...newUser, matricula: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">E-mail</Label>
              <Input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Senha</Label>
              <Input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Papel</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value as Role)}
              >
                {ASSIGNABLE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>
            <Button className="w-full" onClick={handleCreateUser} disabled={isCreatingUser}>
              {isCreatingUser ? "Criando..." : "Criar usuário"}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-sm font-bold uppercase text-gray-600">Alterar papel de um usuário</h2>
          <div className="flex gap-2">
            <Input
              placeholder="Matrícula..."
              value={promoteMatricula}
              onChange={(e) => setPromoteMatricula(e.target.value)}
            />
            <Button onClick={handleLookupUser} disabled={isLookingUp} variant="outline">
              Buscar
            </Button>
          </div>

          {foundUser && (
            <div className="mt-4 space-y-3 border-t pt-4">
              <p className="text-sm">
                <span className="font-medium">{foundUser.fullName}</span>{" "}
                <span className="text-gray-500">({foundUser.matricula})</span>
              </p>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={promoteRole}
                onChange={(e) => setPromoteRole(e.target.value as Role)}
              >
                {ASSIGNABLE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
              <Button className="w-full" onClick={handlePromote} disabled={isPromoting}>
                Aplicar novo papel
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4">
        <h2 className="mb-3 text-sm font-bold uppercase text-gray-600">Todos os usuários</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3" />
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Matrícula</th>
                <th className="px-4 py-3">E-mail</th>
                <th className="px-4 py-3">Papel</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {allUsers.map((user) => (
                <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Avatar fullName={user.fullName} imgUserPath={user.imgUserPath} />
                  </td>
                  <td className="px-4 py-3">{user.fullName}</td>
                  <td className="px-4 py-3">{user.matricula}</td>
                  <td className="px-4 py-3">{user.email || "-"}</td>
                  <td className="px-4 py-3">
                    {user.role === "ADMIN" ? (
                      ROLE_LABELS[user.role] ?? user.role
                    ) : (
                      <select
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                        value={user.role}
                        onChange={(e) => handleChangeUserRole(user.id, e.target.value as Role)}
                      >
                        {ASSIGNABLE_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {user.id !== currentUserId && (
                      <Button size="icon" variant="destructive" onClick={() => handleDeleteUser(user)}>
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}

              {!isLoadingUsers && allUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    Nenhum usuário cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CollaboratorsTab;
