"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "../../_context/AuthContext";
import { useMapContext } from "./MapContext";
import { WorkZone } from "@/types/WorkZone";

const ALL_ZONES_VALUE = "__all__";

// Reparador: sempre restrito às próprias zonas (nenhuma = mapa vazio); pode escolher
// ver todas as suas combinadas ou uma específica. Admin: mapa normal por padrão, com
// opção de ligar a demarcação de uma ou mais zonas. Demais papéis não veem o controle.
const ZoneViewControl = () => {
  const { user } = useAuth();
  const { setZoneFilterIds } = useMapContext();

  const [zones, setZones] = useState<WorkZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>(ALL_ZONES_VALUE);
  const [adminSelectedIds, setAdminSelectedIds] = useState<Set<string>>(new Set());
  const [hasDue, setHasDue] = useState(false);
  const hasShownDueToast = useRef(false);

  const isRepairer = user?.role === "REPAIRER";
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (!isRepairer && !isAdmin) return;

    fetch("/api/workzone")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setZones(Array.isArray(data) ? data : []))
      .catch(() => setZones([]));
  }, [isRepairer, isAdmin]);

  // Reparador: mapa sempre restrito — recalcula sempre que a lista de zonas ou a
  // escolha de zona única mudar.
  useEffect(() => {
    if (!isRepairer) return;
    const ids = selectedZoneId === ALL_ZONES_VALUE ? zones.map((z) => z.id) : [selectedZoneId];
    setZoneFilterIds(ids);
  }, [isRepairer, zones, selectedZoneId, setZoneFilterIds]);

  // Admin: só restringe quando alguma zona está marcada; sem seleção, mapa normal.
  useEffect(() => {
    if (!isAdmin) return;
    setZoneFilterIds(adminSelectedIds.size > 0 ? Array.from(adminSelectedIds) : null);
  }, [isAdmin, adminSelectedIds, setZoneFilterIds]);

  // Aviso "dentro do app": zonas do reparador com prazo já vencido e não concluídas.
  useEffect(() => {
    if (!isRepairer) return;
    fetch("/api/workzone/due")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: WorkZone[]) => {
        const due = Array.isArray(data) ? data : [];
        setHasDue(due.length > 0);
        if (due.length > 0 && !hasShownDueToast.current) {
          hasShownDueToast.current = true;
          toast({
            variant: "destructive",
            title: due.length === 1 ? "Uma zona sua está com prazo iniciado" : `${due.length} zonas suas estão com prazo iniciado`,
            description: due.map((z) => z.name).join(", "),
          });
        }
      })
      .catch(() => setHasDue(false));
  }, [isRepairer]);

  const toggleAdminZone = (zoneId: string) => {
    setAdminSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(zoneId)) next.delete(zoneId);
      else next.add(zoneId);
      return next;
    });
  };

  if (!isRepairer && !isAdmin) return null;

  const isActive = isRepairer || adminSelectedIds.size > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className={`relative ${isActive ? "border-4 border-blue-400" : "border-0"}`}
          aria-label="Zonas de trabalho no mapa"
          title="Zonas de trabalho"
        >
          <MapPin />
          {hasDue && (
            <span className="absolute -right-1 -top-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-72 w-64 overflow-y-auto">
        {isRepairer ? (
          <>
            <DropdownMenuLabel>Minhas zonas</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {zones.length === 0 ? (
              <p className="px-2 py-1.5 text-xs text-gray-400">
                Você não está atribuído a nenhuma zona — nenhum buraco aparece no mapa.
              </p>
            ) : (
              <DropdownMenuRadioGroup value={selectedZoneId} onValueChange={setSelectedZoneId}>
                <DropdownMenuRadioItem value={ALL_ZONES_VALUE}>Todas as minhas zonas</DropdownMenuRadioItem>
                {zones.map((zone) => (
                  <DropdownMenuRadioItem key={zone.id} value={zone.id}>
                    {zone.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            )}
            {hasDue && (
              <>
                <DropdownMenuSeparator />
                <p className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-red-600">
                  <AlertCircle size={14} /> Há zona(s) com prazo iniciado.
                </p>
              </>
            )}
          </>
        ) : (
          <>
            <DropdownMenuLabel>Demarcar zonas no mapa</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {adminSelectedIds.size > 0 && (
              <>
                <DropdownMenuCheckboxItem
                  checked={false}
                  onSelect={(e) => {
                    e.preventDefault();
                    setAdminSelectedIds(new Set());
                  }}
                >
                  Limpar seleção
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
              </>
            )}
            {zones.length === 0 ? (
              <p className="px-2 py-1.5 text-xs text-gray-400">Nenhuma zona cadastrada.</p>
            ) : (
              zones.map((zone) => (
                <DropdownMenuCheckboxItem
                  key={zone.id}
                  checked={adminSelectedIds.has(zone.id)}
                  onSelect={(e) => {
                    e.preventDefault();
                    toggleAdminZone(zone.id);
                  }}
                >
                  {zone.name}
                </DropdownMenuCheckboxItem>
              ))
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ZoneViewControl;
