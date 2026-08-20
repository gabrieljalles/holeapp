"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { WorkZone } from "@/types/WorkZone";
import { useMapContext } from "./MapContext";

const Polygon = dynamic(() => import("react-leaflet").then((m) => m.Polygon), { ssr: false });

// Só renderizado (pelo pai) quando zoneFilterIds não é null. Busca a própria lista de
// zonas (já escopada por papel no backend) e desenha a área das que estão ativas.
const ZonePolygonLayer = () => {
  const { zoneFilterIds } = useMapContext();
  const [zones, setZones] = useState<WorkZone[]>([]);

  useEffect(() => {
    fetch("/api/workzone")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setZones(Array.isArray(data) ? data : []))
      .catch(() => setZones([]));
  }, []);

  if (!zoneFilterIds) return null;

  const activeZones = zones.filter(
    (zone) => zoneFilterIds.includes(zone.id) && zone.polygon && zone.polygon.length >= 3,
  );

  return (
    <>
      {activeZones.map((zone) => (
        <Polygon
          key={zone.id}
          positions={zone.polygon as [number, number][]}
          pathOptions={{ color: "#2563eb", fillOpacity: 0.12, weight: 2 }}
        />
      ))}
    </>
  );
};

export default ZonePolygonLayer;
