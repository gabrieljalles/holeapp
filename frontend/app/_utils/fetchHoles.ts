import { HoleBounds, HolesResponse } from "@/types/Spot";

export const fetchHoles = async (
  bounds?: HoleBounds,
  zoom?: number,
  // null/undefined = sem restrição de zona. Array (mesmo vazio) restringe o mapa
  // às zonas informadas — usado pelo controle de zona do reparador/admin.
  workZoneIds?: string[] | null
): Promise<HolesResponse> => {
    try {
      const params = new URLSearchParams();
      if (bounds) {
        params.set("minLat", String(bounds.minLat));
        params.set("maxLat", String(bounds.maxLat));
        params.set("minLng", String(bounds.minLng));
        params.set("maxLng", String(bounds.maxLng));
      }
      if (zoom !== undefined) {
        params.set("zoom", String(zoom));
      }
      if (workZoneIds != null) {
        params.set("workZoneIds", workZoneIds.join(","));
      }
      const qs = params.toString();

      const response = await fetch(`/api/spothole${qs ? `?${qs}` : ""}`, { cache: 'no-cache' });

      if (!response.ok) {
        throw new Error("Erro ao buscar buracos");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erro ao buscar buracos no banco de dados:", error);
      throw error;
    }
  };
