"use client";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useAuth } from "../../_context/AuthContext";
import { useMapContext } from "./MapContext";

// Liga/desliga a camada de colaboradores online no mapa — só o administrador vê este botão.
const CollaboratorsToggleButton = () => {
  const { user } = useAuth();
  const { showCollaborators, setShowCollaborators } = useMapContext();

  if (user?.role !== "ADMIN") return null;

  return (
    <Button
      size="icon"
      variant="outline"
      onClick={() => setShowCollaborators(!showCollaborators)}
      className={showCollaborators ? "border-4 border-green-400" : "border-0"}
      aria-label="Mostrar colaboradores online no mapa"
      title="Colaboradores online"
    >
      <Users />
    </Button>
  );
};

export default CollaboratorsToggleButton;
