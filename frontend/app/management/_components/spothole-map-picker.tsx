"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useMapEvents } from "react-leaflet";
import { Spot } from "@/types/Spot";
import { Button } from "@/components/ui/button";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then((m) => m.CircleMarker), { ssr: false });
const Tooltip = dynamic(() => import("react-leaflet").then((m) => m.Tooltip), { ssr: false });
const Polygon = dynamic(() => import("react-leaflet").then((m) => m.Polygon), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((m) => m.Polyline), { ssr: false });

// Centro padrão (Uberlândia) usado quando ainda não há buracos para calcular o centro.
const DEFAULT_CENTER: [number, number] = [-18.9126, -48.2755];

const MIN_POLYGON_POINTS = 3;

// Só buracos "Aberto" podem ser recém-selecionados pra uma zona — os já atribuídos
// (mesmo que tenham mudado de status depois) continuam podendo ser desmarcados.
const OPEN_STATUS = "Aberto";

// Ray casting padrão — trata lat/lng como um plano simples, o que é preciso o
// suficiente pra área do tamanho de uma cidade.
const isPointInPolygon = (point: [number, number], polygon: [number, number][]) => {
  const [y, x] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [yi, xi] = polygon[i];
    const [yj, xj] = polygon[j];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

// Captura cliques no mapa pra ir montando o polígono, enquanto o modo de desenho
// está ativo — sem interferir no clique normal dos marcadores.
const PolygonDrawHandler = ({
  isDrawing,
  onAddPoint,
}: {
  isDrawing: boolean;
  onAddPoint: (point: [number, number]) => void;
}) => {
  useMapEvents({
    click: (e) => {
      if (isDrawing) onAddPoint([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

interface SpotHoleMapPickerProps {
  holes: Spot[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  heightClassName?: string;
  // Quando informado, mostra o botão "Desenhar área" para selecionar vários
  // buracos de uma vez marcando os vértices de um polígono no mapa. Recebe também
  // os pontos do polígono desenhado, pra quem quiser persistir a área da zona.
  onPolygonSelect?: (ids: string[], polygon: [number, number][]) => void;
}

const SpotHoleMapPicker = ({
  holes,
  selectedIds,
  onToggle,
  heightClassName = "h-[420px]",
  onPolygonSelect,
}: SpotHoleMapPickerProps) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([]);

  const center = useMemo<[number, number]>(() => {
    if (holes.length === 0) return DEFAULT_CENTER;
    return [
      holes.reduce((sum, h) => sum + h.lat, 0) / holes.length,
      holes.reduce((sum, h) => sum + h.lng, 0) / holes.length,
    ];
  }, [holes]);

  const handleStartDrawing = () => {
    setPolygonPoints([]);
    setIsDrawing(true);
  };

  const handleCancelDrawing = () => {
    setIsDrawing(false);
    setPolygonPoints([]);
  };

  const handleFinishDrawing = () => {
    if (polygonPoints.length >= MIN_POLYGON_POINTS && onPolygonSelect) {
      const matchedIds = holes
        .filter((hole) => isPointInPolygon([hole.lat, hole.lng], polygonPoints))
        .filter((hole) => hole.status === OPEN_STATUS || selectedIds.has(hole.id))
        .map((hole) => hole.id);
      onPolygonSelect(matchedIds, polygonPoints);
    }
    setIsDrawing(false);
    setPolygonPoints([]);
  };

  return (
    <div className="space-y-2">
      {onPolygonSelect && (
        <div className="flex items-center gap-2">
          {!isDrawing ? (
            <Button type="button" size="sm" variant="outline" onClick={handleStartDrawing}>
              Desenhar área
            </Button>
          ) : (
            <>
              <span className="text-xs text-gray-500">
                Clique no mapa para marcar os pontos ({polygonPoints.length} marcado{polygonPoints.length === 1 ? "" : "s"})
              </span>
              <Button
                type="button"
                size="sm"
                onClick={handleFinishDrawing}
                disabled={polygonPoints.length < MIN_POLYGON_POINTS}
              >
                Concluir
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={handleCancelDrawing}>
                Cancelar
              </Button>
            </>
          )}
        </div>
      )}

      <div className={`${heightClassName} w-full overflow-hidden rounded-md border`}>
        <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }} preferCanvas>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={19}
          />
          {holes.map((hole) => {
            const isSelected = selectedIds.has(hole.id);
            // Buraco já atribuído que não está mais "Aberto" continua podendo ser
            // desmarcado, só não pode ser (re)selecionado.
            const isSelectable = isSelected || hole.status === OPEN_STATUS;
            return (
              <CircleMarker
                key={hole.id}
                center={[hole.lat, hole.lng]}
                radius={8}
                pathOptions={{
                  color: isSelected ? "#2563eb" : isSelectable ? "#6b7280" : "#d1d5db",
                  fillColor: isSelected ? "#2563eb" : isSelectable ? "#9ca3af" : "#e5e7eb",
                  fillOpacity: isSelectable ? 0.8 : 0.4,
                  weight: isSelected ? 3 : 1,
                }}
                eventHandlers={{
                  click: () => {
                    if (isDrawing || !isSelectable) return;
                    onToggle(hole.id);
                  },
                }}
              >
                <Tooltip>
                  {(hole.address || "Endereço não identificado") + " · " + hole.status}
                </Tooltip>
              </CircleMarker>
            );
          })}

          {polygonPoints.length >= 3 ? (
            <Polygon positions={polygonPoints} pathOptions={{ color: "#2563eb", fillOpacity: 0.15 }} />
          ) : (
            polygonPoints.length >= 2 && (
              <Polyline positions={polygonPoints} pathOptions={{ color: "#2563eb" }} />
            )
          )}

          {onPolygonSelect && <PolygonDrawHandler isDrawing={isDrawing} onAddPoint={(point) => setPolygonPoints((prev) => [...prev, point])} />}
        </MapContainer>
      </div>
    </div>
  );
};

export default SpotHoleMapPicker;
