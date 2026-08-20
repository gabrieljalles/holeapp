"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogOut, User, UserCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../_context/AuthContext";

const MANAGEMENT_PANEL_ROLES = ["ADMIN"];

const ROLE_LABELS: Record<string, string> = {
  VIEWER: "Visualizador",
  ADDER: "Adicionador",
  REPAIRER: "Reparador",
  ADMIN: "Administrador",
};

const UserMenuButton = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const canAccessManagementPanel = MANAGEMENT_PANEL_ROLES.includes(user.role);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline" className="h-9 w-9 shrink-0">
          <User />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[200px]">
        <div className="px-3 py-2">
          <p className="text-sm font-semibold truncate">{user.fullName}</p>
          <p className="text-xs text-gray-500">{ROLE_LABELS[user.role] ?? user.role}</p>
        </div>
        <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer">
          <UserCircle className="mr-2 h-4 w-4" />
          Meu perfil
        </DropdownMenuItem>
        {canAccessManagementPanel && (
          <DropdownMenuItem onClick={() => router.push("/management")} className="cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Painel Gerencial
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenuButton;
