"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { WorkZone } from "@/types/WorkZone";
import { Spot } from "@/types/Spot";
import DateInputBR from "./date-input-br";
import ZoneShapePreview from "./zone-shape-preview";

const SpotHoleMapPicker = dynamic(() => import("./spothole-map-picker"), { ssr: false });

interface Repairer {
  id: string;
  matricula: string;
  fullName: string;
}

const formatDate = (value: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

type ZoneState = "andamento" | "naoIniciada" | "finalizada";

// "andamento": já passou da data planejada e ainda não foi concluída.
// "naoIniciada": ainda não chegou a data planejada (ou nunca foi agendada).
// "finalizada": tem completedAt.
const getZoneState = (zone: WorkZone): ZoneState => {
  if (zone.completedAt) return "finalizada";
  if (zone.scheduledStartAt && new Date(zone.scheduledStartAt) <= new Date()) return "andamento";
  return "naoIniciada";
};

const zoneStatusBadge = (zone: WorkZone) => {
  const state = getZoneState(zone);
  if (state === "finalizada") {
    return {
      label: zone.forcedCompletion ? "Concluída (forçada)" : "Concluída",
      variant: "successful" as const,
      className: "",
    };
  }
  if (state === "naoIniciada") return { label: "Em espera", variant: "secondary" as const, className: "" };
  return { label: "Ativa", variant: "outline" as const, className: "border-red-500 text-red-600" };
};

// Zonas em andamento primeiro, depois as que ainda vão começar (mais próximas do
// início primeiro), e por último as finalizadas (mais recém-concluídas primeiro).
const ZONE_STATE_PRIORITY: Record<ZoneState, number> = { andamento: 0, naoIniciada: 1, finalizada: 2 };

const sortZones = (zones: WorkZone[]): WorkZone[] =>
  [...zones].sort((a, b) => {
    const stateA = getZoneState(a);
    const stateB = getZoneState(b);
    if (stateA !== stateB) return ZONE_STATE_PRIORITY[stateA] - ZONE_STATE_PRIORITY[stateB];

    if (stateA === "finalizada") {
      return new Date(b.completedAt as string).getTime() - new Date(a.completedAt as string).getTime();
    }

    const aTime = a.scheduledStartAt ? new Date(a.scheduledStartAt).getTime() : Infinity;
    const bTime = b.scheduledStartAt ? new Date(b.scheduledStartAt).getTime() : Infinity;
    return aTime - bTime;
  });

const ZONE_STATE_BORDER: Record<ZoneState, string> = {
  finalizada: "border-green-500",
  andamento: "border-red-500",
  naoIniciada: "border-gray-200",
};

// Dias entre o início planejado (ou a criação, se nunca foi agendada) e a conclusão.
const daysToComplete = (zone: WorkZone): number | null => {
  if (!zone.completedAt) return null;
  const start = zone.scheduledStartAt ?? zone.createdAt;
  const days = Math.round((new Date(zone.completedAt).getTime() - new Date(start).getTime()) / 86_400_000);
  return Math.max(0, days);
};

const WorkZonesTab = () => {
  const [zones, setZones] = useState<WorkZone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState("");

  const [newZoneName, setNewZoneName] = useState("");
  const [isCreatingZone, setIsCreatingZone] = useState(false);

  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [holes, setHoles] = useState<Spot[]>([]);
  const [selectedHoleIds, setSelectedHoleIds] = useState<Set<string>>(new Set());
  const [drawnPolygon, setDrawnPolygon] = useState<[number, number][] | undefined>(undefined);
  const [isLoadingHoles, setIsLoadingHoles] = useState(false);
  const [isSavingHoles, setIsSavingHoles] = useState(false);

  const [repairers, setRepairers] = useState<Repairer[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [isSavingUsers, setIsSavingUsers] = useState(false);

  const selectedZone = useMemo(() => zones.find((z) => z.id === selectedZoneId) ?? null, [zones, selectedZoneId]);
  const sortedZones = useMemo(() => sortZones(zones), [zones]);

  const loadZones = () => {
    fetch("/api/workzone")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setZones(Array.isArray(data) ? data : []))
      .catch(() => setZones([]));
  };

  useEffect(() => {
    loadZones();
    fetch("/api/user/addable")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setRepairers(Array.isArray(data) ? data : []))
      .catch(() => setRepairers([]));
  }, []);

  // Sincroniza a seleção de reparadores com a zona escolhida.
  useEffect(() => {
    setSelectedUserIds(new Set(selectedZone?.assignedUsers.map((a) => a.user.id) ?? []));
    setDrawnPolygon(undefined);
  }, [selectedZoneId, selectedZone]);

  const handleCreateZone = async () => {
    if (!newZoneName.trim()) return;
    setIsCreatingZone(true);
    try {
      const res = await fetch("/api/workzone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newZoneName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Erro ao criar zona.");
      setNewZoneName("");
      loadZones();
      toast({ title: "Zona criada com sucesso!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao criar zona", description: error instanceof Error ? error.message : undefined });
    } finally {
      setIsCreatingZone(false);
    }
  };

  const toggleSelectedUser = (userId: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleSaveUsers = async () => {
    if (!selectedZoneId) return;
    setIsSavingUsers(true);
    try {
      const res = await fetch(`/api/workzone/${selectedZoneId}/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: Array.from(selectedUserIds) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Erro ao atribuir reparadores.");
      loadZones();
      toast({ title: "Reparadores atribuídos à zona!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao atribuir reparadores", description: error instanceof Error ? error.message : undefined });
    } finally {
      setIsSavingUsers(false);
    }
  };

  const handleSchedule = async (date: string) => {
    if (!selectedZoneId) return;
    try {
      // "date" é uma data pura (yyyy-mm-dd, sem hora). new Date(date) interpreta isso
      // como meia-noite UTC, e ao exibir de volta no fuso local (ex.: Brasil, UTC-3) o
      // dia "rola" pra trás um dia. Construindo ao meio-dia local, a conversão de volta
      // pro fuso do navegador nunca cruza pra outro dia.
      let scheduledStartAt: string | null = null;
      if (date) {
        const [year, month, day] = date.split("-").map(Number);
        scheduledStartAt = new Date(year, month - 1, day, 12, 0, 0).toISOString();
      }

      const res = await fetch(`/api/workzone/${selectedZoneId}/schedule`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledStartAt }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Erro ao agendar zona.");
      }
      loadZones();
      toast({ title: "Data de início agendada!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao agendar zona", description: error instanceof Error ? error.message : undefined });
    }
  };

  const handleOpenMapPicker = async () => {
    if (!selectedZoneId) return;
    setIsMapPickerOpen(true);
    setIsLoadingHoles(true);
    try {
      const res = await fetch("/api/spothole/filtered");
      const data = await res.json();
      const list: Spot[] = Array.isArray(data) ? data : [];
      setHoles(list);
      setSelectedHoleIds(new Set(list.filter((h) => h.workZoneId === selectedZoneId).map((h) => h.id)));
    } catch {
      setHoles([]);
    } finally {
      setIsLoadingHoles(false);
    }
  };

  const handleToggleHole = (id: string) => {
    setSelectedHoleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Soma os buracos abertos dentro da área desenhada à seleção atual, sem desmarcar o
  // que já estava selecionado manualmente. Buracos não-abertos na área são ignorados
  // silenciosamente (é normal uma área grande conter buracos de vários status).
  // Guarda o polígono pra persistir junto ao salvar.
  const handlePolygonSelect = (ids: string[], polygon: [number, number][]) => {
    setSelectedHoleIds((prev) => new Set([...prev, ...ids]));
    setDrawnPolygon(polygon);
    if (ids.length > 0) {
      toast({ title: `${ids.length} buraco(s) dentro da área selecionado(s).` });
    }
  };

  const handleSaveHoles = async () => {
    // Permite salvar só a área desenhada (polígono), mesmo que nenhum buraco tenha
    // caído dentro dela — sem isso, desenhar sobre uma região sem buracos nunca
    // persistia o polígono (botão ficava desabilitado).
    if (!selectedZoneId || (selectedHoleIds.size === 0 && drawnPolygon === undefined)) return;
    setIsSavingHoles(true);
    try {
      const body: Record<string, unknown> = { spotHoleIds: Array.from(selectedHoleIds) };
      if (drawnPolygon !== undefined) body.polygon = drawnPolygon;

      const res = await fetch(`/api/workzone/${selectedZoneId}/spotholes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Erro ao atribuir buracos à zona.");
      setIsMapPickerOpen(false);
      loadZones();
      toast({ title: `${data.count} buraco(s) atribuído(s) à zona!` });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao atribuir buracos", description: error instanceof Error ? error.message : undefined });
    } finally {
      setIsSavingHoles(false);
    }
  };

  const handleForceComplete = async () => {
    if (!selectedZoneId) return;
    try {
      const res = await fetch(`/api/workzone/${selectedZoneId}/force-complete`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Erro ao forçar conclusão.");
      loadZones();
      toast({ title: "Zona concluída à força — todos os buracos foram marcados como reparados." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao forçar conclusão", description: error instanceof Error ? error.message : undefined });
    }
  };

  const handleReopen = async () => {
    if (!selectedZoneId) return;
    try {
      const res = await fetch(`/api/workzone/${selectedZoneId}/reopen`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Erro ao reabrir zona.");
      loadZones();
      toast({ title: "Zona reaberta." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao reabrir zona", description: error instanceof Error ? error.message : undefined });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-3 text-sm font-bold uppercase text-gray-600">Zonas de trabalho</h2>

          <div className="mb-4 flex gap-2">
            <Input
              placeholder="Nome da nova zona..."
              value={newZoneName}
              onChange={(e) => setNewZoneName(e.target.value)}
            />
            <Button onClick={handleCreateZone} disabled={isCreatingZone}>
              Criar
            </Button>
          </div>

          <div className="space-y-2">
            {sortedZones.map((zone) => {
              const badge = zoneStatusBadge(zone);
              const state = getZoneState(zone);
              const days = daysToComplete(zone);
              return (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZoneId(zone.id)}
                  className={`block w-full rounded-md border-2 px-3 py-2 text-left text-sm hover:bg-gray-100 ${ZONE_STATE_BORDER[state]} ${
                    selectedZoneId === zone.id ? "bg-gray-100 ring-2 ring-primary ring-offset-1" : ""
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="font-semibold">{zone.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{zone._count.spotHoles}</span>
                      <Badge variant={badge.variant} className={badge.className}>{badge.label}</Badge>
                    </div>
                  </div>
                  <div className="relative">
                    <ZoneShapePreview polygon={zone.polygon} />
                    {state === "finalizada" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <CheckCircle2 className="text-green-600 drop-shadow" size={28} />
                      </div>
                    )}
                  </div>
                  {state === "finalizada" && days !== null && (
                    <p className="mt-1 text-[11px] text-gray-400">
                      Concluída em {formatDate(zone.completedAt)} ({days} dia{days === 1 ? "" : "s"})
                    </p>
                  )}
                </button>
              );
            })}
            {zones.length === 0 && <p className="text-sm text-gray-400">Nenhuma zona encontrada.</p>}
          </div>
        </div>
      </div>

      {selectedZone && (
        <div className="space-y-6">
          <div className="rounded-lg border bg-white p-4">
            <h2 className="mb-3 text-sm font-bold uppercase text-gray-600">{selectedZone.name}</h2>

            <div className="mb-4 space-y-2 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Início agendado</span>
                <span className="font-medium">{formatDate(selectedZone.scheduledStartAt)}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Concluída em</span>
                <span className="font-medium">{formatDate(selectedZone.completedAt)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">Início planejado</label>
                <DateInputBR
                  value={selectedZone.scheduledStartAt ? selectedZone.scheduledStartAt.slice(0, 10) : null}
                  onChange={(isoDate) => handleSchedule(isoDate ?? "")}
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="block text-xs font-semibold text-gray-600">
                    Reparadores atribuídos (opcional)
                  </label>
                  <Button size="sm" variant="outline" onClick={handleSaveUsers} disabled={isSavingUsers}>
                    Salvar
                  </Button>
                </div>
                {repairers.length === 0 ? (
                  <p className="text-xs text-gray-400">Nenhum usuário reparador cadastrado.</p>
                ) : (
                  <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-2">
                    {repairers.map((repairer) => (
                      <label key={repairer.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-input"
                          checked={selectedUserIds.has(repairer.id)}
                          onChange={() => toggleSelectedUser(repairer.id)}
                        />
                        <span>{repairer.fullName}</span>
                        <span className="text-xs text-gray-400">({repairer.matricula})</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <Button variant="outline" className="w-full" onClick={handleOpenMapPicker}>
                Selecionar buracos no mapa
              </Button>

              {!selectedZone.completedAt ? (
                <Button
                  variant="default"
                  className="w-full bg-green-600 text-white hover:bg-green-700"
                  onClick={handleForceComplete}
                >
                  Forçar conclusão da zona
                </Button>
              ) : (
                <Button variant="outline" className="w-full" onClick={handleReopen}>
                  Reabrir zona
                </Button>
              )}
            </div>
          </div>

          {isMapPickerOpen && (
            <div className="rounded-lg border bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase text-gray-600">
                  Selecionar buracos ({selectedHoleIds.size} selecionado{selectedHoleIds.size === 1 ? "" : "s"})
                </h2>
                <Button
                  size="sm"
                  onClick={handleSaveHoles}
                  disabled={isSavingHoles || (selectedHoleIds.size === 0 && drawnPolygon === undefined)}
                >
                  Salvar
                </Button>
              </div>
              <p className="mb-3 text-xs text-gray-500">
                Clique nos pontos do mapa para marcar/desmarcar os buracos que pertencem a esta zona, ou desenhe uma área.
              </p>
              {isLoadingHoles ? (
                <p className="py-8 text-center text-sm text-gray-400">Carregando buracos...</p>
              ) : (
                <SpotHoleMapPicker
                  holes={holes}
                  selectedIds={selectedHoleIds}
                  onToggle={handleToggleHole}
                  onPolygonSelect={handlePolygonSelect}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkZonesTab;
