"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import axios from "axios";
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  CircleCheck,
  CircleX,
  Eye,
  FilterX,
  Pencil,
  Trash2,
} from "lucide-react";
import { FaLaptopCode, FaUserTie } from "react-icons/fa";
import { GiHole } from "react-icons/gi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Spot } from "@/types/Spot";
import EditHolePopup from "@/app/map/_components/edit-hole-popup";
import DeleteHoleAlert from "@/app/map/_components/delete-hole-alert";
import HolePreviewCard from "./hole-preview-card";

const STATUS_OPTIONS = ["Aberto", "Manutenção", "Reparado"];
const PAGE_SIZE = 25;

type SortKey =
  | "address"
  | "district"
  | "zone"
  | "status"
  | "bigHole"
  | "vereador"
  | "simSystem"
  | "createdAt"
  | "fixedAt";
type SortDirection = "asc" | "desc";

const COLUMNS: { key: SortKey; label: ReactNode; title?: string }[] = [
  { key: "zone", label: "Setor" },
  { key: "district", label: "Bairro" },
  { key: "address", label: "Endereço" },
  { key: "status", label: "Status" },
  { key: "bigHole", label: <GiHole size={16} />, title: "Buraco grande" },
  { key: "vereador", label: <FaUserTie size={16} />, title: "Vereador" },
  { key: "simSystem", label: <FaLaptopCode size={16} />, title: "Sistema" },
  { key: "createdAt", label: "Criado em" },
  { key: "fixedAt", label: "Reparado em" },
];

const BooleanMark = ({ value }: { value: boolean }) =>
  value ? (
    <CircleCheck size={18} className="text-green-600" aria-label="Sim" />
  ) : (
    <CircleX size={18} className="text-gray-300" aria-label="Não" />
  );

const badgeVariantForStatus = (status: string) => {
  switch (status) {
    case "Reparado":
      return "successful" as const;
    case "Manutenção":
      return "waiting" as const;
    default:
      return "destructive" as const;
  }
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const HolesTab = () => {
  const [district, setDistrict] = useState("");
  const [status, setStatus] = useState("");
  const [sector, setSector] = useState("");
  const [bigHoleOnly, setBigHoleOnly] = useState(false);
  const [vereadorOnly, setVereadorOnly] = useState(false);
  const [simSystemOnly, setSimSystemOnly] = useState(false);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);
  const [sectorOptions, setSectorOptions] = useState<string[]>([]);
  const [isSectorDropdownOpen, setIsSectorDropdownOpen] = useState(false);
  const [holes, setHoles] = useState<Spot[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalHoles, setTotalHoles] = useState(0);

  const [editingHole, setEditingHole] = useState<Spot | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deletingHole, setDeletingHole] = useState<Spot | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewHole, setPreviewHole] = useState<Spot | null>(null);

  useEffect(() => {
    fetch("/api/spothole/districts")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setDistrictOptions(Array.isArray(data) ? data : []))
      .catch(() => setDistrictOptions([]));
  }, []);

  useEffect(() => {
    fetch("/api/spothole/sectors")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setSectorOptions(Array.isArray(data) ? data : []))
      .catch(() => setSectorOptions([]));
  }, []);

  // Qualquer mudança de filtro volta para a primeira página.
  useEffect(() => {
    setPage(1);
  }, [district, status, sector, bigHoleOnly, vereadorOnly, simSystemOnly]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (district.trim()) params.set("district", district.trim());
    if (status) params.set("status", status);
    if (sector.trim()) params.set("zone", sector.trim());
    if (bigHoleOnly) params.set("bigHole", "true");
    if (vereadorOnly) params.set("vereador", "true");
    if (simSystemOnly) params.set("simSystem", "true");
    params.set("page", String(page));
    params.set("pageSize", String(PAGE_SIZE));

    setIsFetching(true);
    setErrorMessage("");

    const timeoutId = setTimeout(() => {
      fetch(`/api/spothole/filtered?${params.toString()}`)
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => null);
            throw new Error(data?.message || "Erro ao buscar os buracos.");
          }
          return res.json();
        })
        .then((data) => {
          setHoles(Array.isArray(data?.items) ? data.items : []);
          setTotalPages(data?.totalPages ?? 1);
          setTotalHoles(data?.total ?? 0);
        })
        .catch((err) =>
          setErrorMessage(err.message || "Erro ao buscar os buracos."),
        )
        .finally(() => setIsFetching(false));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    district,
    status,
    sector,
    bigHoleOnly,
    vereadorOnly,
    simSystemOnly,
    page,
    refreshTick,
  ]);

  const refresh = () => setRefreshTick((t) => t + 1);

  const hasActiveFilters =
    !!district || !!status || !!sector || bigHoleOnly || vereadorOnly || simSystemOnly;

  const handleClearFilters = () => {
    setDistrict("");
    setStatus("");
    setSector("");
    setBigHoleOnly(false);
    setVereadorOnly(false);
    setSimSystemOnly(false);
  };

  const handleEditHole = async (formData: FormData) => {
    if (!editingHole) return;
    try {
      setIsSavingEdit(true);
      await axios.put(`/api/spothole?id=${editingHole.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast({ variant: "successful", title: "Buraco atualizado com sucesso!" });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      toast({
        variant: "destructive",
        title: "Erro ao atualizar o buraco",
        description: message,
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingHole) return;
    try {
      setIsDeleting(true);
      await axios.delete("/api/spothole", { params: { id: deletingHole.id } });
      toast({ variant: "successful", title: "Buraco excluído com sucesso!" });
      if (previewHole?.id === deletingHole.id) setPreviewHole(null);
      refresh();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined;
      toast({
        variant: "destructive",
        title: "Erro ao excluir o buraco",
        description: message,
      });
    } finally {
      setIsDeleting(false);
      setDeletingHole(null);
    }
  };

  const filteredDistrictOptions = useMemo(() => {
    const query = district.trim().toLowerCase();
    if (!query) return districtOptions;
    return districtOptions.filter((d) => d.toLowerCase().includes(query));
  }, [district, districtOptions]);

  const filteredSectorOptions = useMemo(() => {
    const query = sector.trim().toLowerCase();
    if (!query) return sectorOptions;
    return sectorOptions.filter((s) => s.toLowerCase().includes(query));
  }, [sector, sectorOptions]);

  const [sort, setSort] = useState<{
    key: SortKey;
    direction: SortDirection;
  } | null>(null);

  const handleSort = (key: SortKey) => {
    setSort((prev) => {
      if (prev?.key !== key) return { key, direction: "asc" };
      return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
    });
  };

  const getSortValue = (hole: Spot, key: SortKey): string | number => {
    switch (key) {
      case "address":
        return `${hole.address || ""}${hole.number ? `, ${hole.number}` : ""}`.toLowerCase();
      case "district":
        return (hole.district || "").toLowerCase();
      case "zone":
        return (hole.zone || "").toLowerCase();
      case "status":
        return hole.status || "";
      case "bigHole":
        return hole.bigHole ? 1 : 0;
      case "vereador":
        return hole.vereador ? 1 : 0;
      case "simSystem":
        return hole.simSystem ? 1 : 0;
      case "createdAt":
        return new Date(hole.createdAt).getTime();
      case "fixedAt":
        return hole.fixedAt ? new Date(hole.fixedAt).getTime() : 0;
    }
  };

  const sortedHoles = useMemo(() => {
    if (!sort) return holes;
    const factor = sort.direction === "asc" ? 1 : -1;
    return [...holes].sort((a, b) => {
      const valueA = getSortValue(a, sort.key);
      const valueB = getSortValue(b, sort.key);
      if (valueA < valueB) return -1 * factor;
      if (valueA > valueB) return 1 * factor;
      return 0;
    });
  }, [holes, sort]);

  return (
    <div>
        <div className="mb-3 grid grid-cols-1 gap-3 rounded-lg border bg-white p-4 md:grid-cols-4">
          <div className="relative">
            <label className="mb-1 block text-xs font-semibold text-gray-600">
              Bairro
            </label>
            <Input
              placeholder="Filtrar por bairro..."
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              onFocus={() => setIsDistrictDropdownOpen(true)}
              onBlur={() => setIsDistrictDropdownOpen(false)}
              autoComplete="off"
            />
            {isDistrictDropdownOpen && filteredDistrictOptions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-md border bg-white shadow-lg">
                {filteredDistrictOptions.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setDistrict(d);
                      setIsDistrictDropdownOpen(false);
                    }}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <label className="mb-1 block text-xs font-semibold text-gray-600">
              Setor
            </label>
            <Input
              placeholder="Filtrar por setor..."
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              onFocus={() => setIsSectorDropdownOpen(true)}
              onBlur={() => setIsSectorDropdownOpen(false)}
              autoComplete="off"
            />
            {isSectorDropdownOpen && filteredSectorOptions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-md border bg-white shadow-lg">
                {filteredSectorOptions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSector(s);
                      setIsSectorDropdownOpen(false);
                    }}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">
              Status
            </label>
            <select
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Todos os status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">
              Marcações
            </label>
            <div className="flex h-10 items-center gap-4">
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-input"
                  checked={bigHoleOnly}
                  onChange={(e) => setBigHoleOnly(e.target.checked)}
                />
                Buraco+
              </label>
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-input"
                  checked={vereadorOnly}
                  onChange={(e) => setVereadorOnly(e.target.checked)}
                />
                Vereador
              </label>
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-input"
                  checked={simSystemOnly}
                  onChange={(e) => setSimSystemOnly(e.target.checked)}
                />
                Sistema
              </label>
            </div>
          </div>
        </div>

        <div className="mb-6 flex justify-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClearFilters}
            disabled={!hasActiveFilters}
            className="text-gray-500"
          >
            <FilterX size={14} className="mr-1.5" />
            Limpar filtros
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  {COLUMNS.map((column) => {
                    const isActive = sort?.key === column.key;
                    return (
                      <th key={column.key} className="px-3 py-1.5">
                        <button
                          onClick={() => handleSort(column.key)}
                          title={column.title}
                          aria-label={column.title}
                          className="flex items-center gap-1 hover:text-gray-800"
                        >
                          {column.label}
                          {isActive ? (
                            sort.direction === "asc" ? (
                              <ChevronUp size={14} />
                            ) : (
                              <ChevronDown size={14} />
                            )
                          ) : (
                            <ChevronsUpDown
                              size={14}
                              className="text-gray-300"
                            />
                          )}
                        </button>
                      </th>
                    );
                  })}
                  <th className="px-3 py-1.5">Ações</th>
                </tr>
              </thead>
              <tbody>
                {sortedHoles.map((hole) => (
                  <tr
                    key={hole.id}
                    className={`border-b last:border-0 hover:bg-gray-50 ${previewHole?.id === hole.id ? "bg-blue-50" : ""}`}
                  >
                    <td className="px-3 py-1.5">{hole.zone || "-"}</td>
                    <td className="px-3 py-1.5">{hole.district || "-"}</td>
                    <td className="px-3 py-1.5">
                      {hole.address || "-"}
                      {hole.number ? `, ${hole.number}` : ""}
                    </td>
                    <td className="px-3 py-1.5">
                      <Badge variant={badgeVariantForStatus(hole.status)}>
                        {hole.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-1.5">
                      <BooleanMark value={!!hole.bigHole} />
                    </td>
                    <td className="px-3 py-1.5">
                      <BooleanMark value={!!hole.vereador} />
                    </td>
                    <td className="px-3 py-1.5">
                      <BooleanMark value={!!hole.simSystem} />
                    </td>
                    <td className="px-3 py-1.5">{formatDate(hole.createdAt)}</td>
                    <td className="px-3 py-1.5">{formatDate(hole.fixedAt)}</td>
                    <td className="px-3 py-1.5">
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6"
                          title="Ver no mapa"
                          onClick={() => setPreviewHole(hole)}
                        >
                          <Eye size={12} />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6"
                          title="Editar"
                          onClick={() => setEditingHole(hole)}
                        >
                          <Pencil size={12} />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="h-6 w-6"
                          title="Excluir"
                          onClick={() => setDeletingHole(hole)}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!isFetching && holes.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      Nenhum buraco encontrado para os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {isFetching && (
            <div className="px-3 py-1.5 text-center text-sm text-gray-400">
              Carregando...
            </div>
          )}
          {errorMessage && (
            <div className="px-3 py-1.5 text-center text-sm text-red-500">
              {errorMessage}
            </div>
          )}

          <div className="flex items-center justify-between border-t px-3 py-2 text-sm text-gray-500">
            <span>
              {totalHoles > 0
                ? `${totalHoles} buraco${totalHoles === 1 ? "" : "s"} · página ${page} de ${totalPages}`
                : ""}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Próxima
              </Button>
            </div>
          </div>
        </div>

      {previewHole && (
        <HolePreviewCard hole={previewHole} onClose={() => setPreviewHole(null)} />
      )}

      {editingHole && (
        <EditHolePopup
          data={editingHole}
          onClose={() => setEditingHole(null)}
          onRefresh={refresh}
          onEditHole={handleEditHole}
          isLoading={isSavingEdit}
        />
      )}

      <DeleteHoleAlert
        isOpen={!!deletingHole}
        onClose={() => setDeletingHole(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default HolesTab;
