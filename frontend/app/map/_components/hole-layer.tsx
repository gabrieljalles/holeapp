"use client";
import { useEffect, useRef, useState } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Spot, HolesResponse } from "@/types/Spot";

interface HoleLayerProps {
  data: HolesResponse;
  onClickSpot: (spot: Spot) => void;
}

const statusColor = (status: string) =>
  status === "Reparado" ? "green" : status === "Manutenção" ? "orange" : "red";

// Raio base (pixels) de um buraco normal/grande com zoom "neutro" (até este nível,
// o tamanho não cresce mais — só encolhe quando o zoom fica agressivo pra cima disso).
const BASE_RADIUS = 6;
const BASE_RADIUS_BIG = 9;

// A partir daqui o raio começa a crescer com o zoom; no zoom máximo do mapa, chega a
// RADIUS_MAX_MULTIPLIER vezes o tamanho base — pontos pequenos ficam quase impossíveis
// de tocar quando o zoom está bem aproximado ("agressivo").
const RADIUS_SCALE_START_ZOOM = 14;
const RADIUS_SCALE_END_ZOOM = 19;
const RADIUS_MAX_MULTIPLIER = 3;

const radiusScaleForZoom = (zoom: number) => {
  if (zoom <= RADIUS_SCALE_START_ZOOM) return 1;
  if (zoom >= RADIUS_SCALE_END_ZOOM) return RADIUS_MAX_MULTIPLIER;
  const t = (zoom - RADIUS_SCALE_START_ZOOM) / (RADIUS_SCALE_END_ZOOM - RADIUS_SCALE_START_ZOOM);
  return 1 + t * (RADIUS_MAX_MULTIPLIER - 1);
};

// Camada imperativa única: desenha pontos individuais OU clusters agregados,
// conforme o zoom, num único L.LayerGroup em vez de montar 1-2 layers React por buraco.
const HoleLayer = ({ data, onClickSpot }: HoleLayerProps) => {
  const map = useMap();
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const onClickSpotRef = useRef(onClickSpot);
  const [zoom, setZoom] = useState(() => map.getZoom());

  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  });

  useEffect(() => {
    onClickSpotRef.current = onClickSpot;
  }, [onClickSpot]);

  useEffect(() => {
    if (!layerGroupRef.current) {
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      layerGroupRef.current?.remove();
      layerGroupRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const layerGroup = layerGroupRef.current;
    if (!layerGroup) return;

    layerGroup.clearLayers();

    if (data.type === "points") {
      const scale = radiusScaleForZoom(zoom);

      data.points.forEach((spot) => {
        if (!spot.lat || !spot.lng) return;

        const color = statusColor(spot.status);
        const borderColor = spot.vereador ? "black" : color;
        const radius = (spot.bigHole ? BASE_RADIUS_BIG : BASE_RADIUS) * scale;

        L.circleMarker([spot.lat, spot.lng], {
          radius,
          color: borderColor,
          weight: spot.vereador ? 3 : 1,
          fillColor: color,
          fillOpacity: 0.8,
        })
          .on("click", () => onClickSpotRef.current(spot))
          .addTo(layerGroup);
      });
    } else {
      data.points.forEach((cluster) => {
        const color = statusColor(cluster.status);
        const radius = Math.min(10 + Math.log2(cluster.count + 1) * 4, 40);

        L.circleMarker([cluster.lat, cluster.lng], {
          radius,
          color: "black",
          weight: 1,
          fillColor: color,
          fillOpacity: 0.6,
        })
          .bindTooltip(String(cluster.count), {
            permanent: true,
            direction: "center",
            className: "hole-cluster-label",
          })
          .on("click", () => {
            map.setView([cluster.lat, cluster.lng], map.getZoom() + 2);
          })
          .addTo(layerGroup);
      });
    }
  }, [data, map, zoom]);

  return null;
};

export default HoleLayer;
