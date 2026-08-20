"use client";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import dynamic from "next/dynamic";
import { useMap, useMapEvents } from "react-leaflet";
import { CollaboratorLocation } from "@/types/User";

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import("react-leaflet").then((mod) => mod.Tooltip),
  { ssr: false }
);

// Igual à janela do backend (5min online / 20min some do mapa) — só usada aqui pra
// nomear as cores, o corte de verdade acontece no servidor a cada resposta.
const POLL_INTERVAL_MS = 60_000;

// Tamanho do círculo varia com o zoom do mapa (acompanha a sensação de "afastar/aproximar"),
// mas nunca fica menor que AVATAR_SIZE_MIN nem maior que AVATAR_SIZE_MAX.
const AVATAR_SIZE_MAX = 44;
const AVATAR_SIZE_MIN = 24;
// A partir deste nível de zoom (e acima), o círculo já fica no tamanho máximo.
const REFERENCE_ZOOM = 17;
// Quantos pixels o círculo encolhe a cada nível de zoom abaixo da referência.
const SIZE_PER_ZOOM_STEP = 4;

const computeAvatarSize = (zoom: number) => {
  const size = AVATAR_SIZE_MAX - (REFERENCE_ZOOM - zoom) * SIZE_PER_ZOOM_STEP;
  return Math.min(AVATAR_SIZE_MAX, Math.max(AVATAR_SIZE_MIN, size));
};

// Silhueta genérica (mesmo glyph do ícone "User" do lucide-react) para quem não tem foto.
const FALLBACK_SVG = `
  <svg viewBox="0 0 24 24" width="60%" height="60%" fill="none" stroke="#9ca3af" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
`;

const buildIcon = (collaborator: CollaboratorLocation, size: number) => {
  const borderColor = collaborator.status === "online" ? "#22c55e" : "#ef4444";
  const imgUrl = collaborator.imgUserPath
    ? `${process.env.NEXT_PUBLIC_API_URL}/spothole/${collaborator.imgUserPath}`
    : null;

  const inner = imgUrl
    ? `<img src="${imgUrl}" style="width:100%;height:100%;min-width:100%;min-height:100%;object-fit:cover;" />`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#e5e7eb;">${FALLBACK_SVG}</div>`;

  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;min-width:${size}px;min-height:${size}px;flex-shrink:0;border-radius:50%;border:3px solid ${borderColor};overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.4);">${inner}</div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Renderizado só quando showCollaborators está ligado — montar/desmontar já
// liga/desliga o polling, sem precisar de um efeito separado pra isso.
const CollaboratorsLayer = () => {
  const map = useMap();
  const [collaborators, setCollaborators] = useState<CollaboratorLocation[]>([]);
  const [zoom, setZoom] = useState(() => map.getZoom());
  const isMountedRef = useRef(true);

  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  });

  useEffect(() => {
    isMountedRef.current = true;

    const fetchLocations = () => {
      fetch("/api/user/locations")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (isMountedRef.current) setCollaborators(Array.isArray(data) ? data : []);
        })
        .catch(() => {
          if (isMountedRef.current) setCollaborators([]);
        });
    };

    fetchLocations();
    const intervalId = setInterval(fetchLocations, POLL_INTERVAL_MS);

    return () => {
      isMountedRef.current = false;
      clearInterval(intervalId);
    };
  }, []);

  const avatarSize = computeAvatarSize(zoom);

  return (
    <>
      {collaborators.map((collaborator) => (
        <Marker
          key={collaborator.id}
          position={[collaborator.lat, collaborator.lng]}
          icon={buildIcon(collaborator, avatarSize)}
        >
          <Tooltip>{collaborator.fullName}</Tooltip>
        </Marker>
      ))}
    </>
  );
};

export default CollaboratorsLayer;
