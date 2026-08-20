"use client";

const VIEW_WIDTH = 100;
const VIEW_HEIGHT = 56;
const PADDING = 6;

interface ZoneShapePreviewProps {
  polygon: [number, number][] | null;
  className?: string;
}

// Miniatura só do formato da área da zona — normaliza os pontos [lat,lng] pro
// viewBox e desenha um <polygon> preenchido. Sem mapa, sem tiles.
const ZoneShapePreview = ({ polygon, className = "" }: ZoneShapePreviewProps) => {
  if (!polygon || polygon.length < 3) {
    return (
      <div
        className={`flex h-14 w-full items-center justify-center rounded-md border border-dashed text-[10px] text-gray-400 ${className}`}
      >
        Sem área definida
      </div>
    );
  }

  const lats = polygon.map((p) => p[0]);
  const lngs = polygon.map((p) => p[1]);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latSpan = maxLat - minLat || 1;
  const lngSpan = maxLng - minLng || 1;

  const innerW = VIEW_WIDTH - PADDING * 2;
  const innerH = VIEW_HEIGHT - PADDING * 2;

  // Lat cresce pra cima, SVG cresce pra baixo — inverte o eixo y.
  const points = polygon
    .map(([lat, lng]) => {
      const x = PADDING + ((lng - minLng) / lngSpan) * innerW;
      const y = PADDING + (1 - (lat - minLat) / latSpan) * innerH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      className={`h-14 w-full rounded-md border bg-gray-50 ${className}`}
    >
      <polygon points={points} fill="#2563eb" fillOpacity={0.3} stroke="#2563eb" strokeWidth={1.5} />
    </svg>
  );
};

export default ZoneShapePreview;
