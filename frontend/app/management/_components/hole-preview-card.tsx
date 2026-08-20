"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Image from "next/image";
import { ImageOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spot } from "@/types/Spot";

const SpotHoleMapPicker = dynamic(() => import("./spothole-map-picker"), { ssr: false });

const imageUrl = (path: string | null | undefined) =>
  path ? `${process.env.NEXT_PUBLIC_API_URL}/spothole/${path}` : null;

// Só o primeiro nome (até o primeiro espaço), para caber no "(nome)" ao lado da matrícula.
const firstName = (fullName: string) => fullName.split(" ")[0];

const userLabel = (user: { matricula: string; fullName: string } | null | undefined) =>
  user ? `${user.matricula} (${firstName(user.fullName)})` : null;

interface HoleImageSquareProps {
  label: string;
  path: string | null | undefined;
  onExpand: (url: string) => void;
}

const HoleImageSquare = ({ label, path, onExpand }: HoleImageSquareProps) => {
  const url = imageUrl(path);

  return (
    <div>
      <p className="mb-1 text-[11px] font-semibold uppercase text-gray-500">{label}</p>
      {url ? (
        <button
          type="button"
          onClick={() => onExpand(url)}
          className="relative block aspect-square w-full overflow-hidden rounded-md border"
        >
          <Image src={url} alt={label} fill style={{ objectFit: "cover" }} />
        </button>
      ) : (
        <div className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-md border border-dashed bg-gray-50 text-gray-300">
          <ImageOff size={20} />
          <span className="text-[10px] text-gray-400">Imagem não encontrada</span>
        </div>
      )}
    </div>
  );
};

interface HolePreviewCardProps {
  hole: Spot;
  onClose: () => void;
}

const HolePreviewCard = ({ hole, onClose }: HolePreviewCardProps) => {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const handleOpenGMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${hole.lat},${hole.lng}`;
    window.open(url, "_blank");
  };

  const createdByLabel = userLabel(hole.createdByUser);
  const fixedByLabel = userLabel(hole.fixedByUser);

  return (
    <>
      <div className="fixed inset-x-4 top-20 z-30 rounded-lg border bg-white p-4 shadow-xl sm:inset-x-auto sm:right-6 sm:w-[400px]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase text-gray-600">Localização no mapa</h2>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8"
              title="Abrir no Google Maps"
              onClick={handleOpenGMaps}
            >
              <Image alt="Google Maps" src="/google-maps.png" width={16} height={16} />
            </Button>
            <Button size="icon" variant="outline" className="h-8 w-8" onClick={onClose}>
              <X size={14} />
            </Button>
          </div>
        </div>

        <SpotHoleMapPicker
          holes={[hole]}
          selectedIds={new Set([hole.id])}
          onToggle={() => {}}
          heightClassName="h-[210px]"
        />

        <div className="mt-3 space-y-0.5 text-xs text-gray-500">
          <p>
            {hole.address || "Endereço não identificado"}
            {hole.number ? `, ${hole.number}` : ""}
          </p>
          {hole.zone && <p>Setor: {hole.zone}</p>}
          {hole.cep && <p>CEP: {hole.cep}</p>}
          {createdByLabel && <p>Aberto por: {createdByLabel}</p>}
          {fixedByLabel && <p>Reparado por: {fixedByLabel}</p>}
          {hole.observation && <p>Observação: {hole.observation}</p>}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <HoleImageSquare label="Antes" path={hole.imgBeforeWorkPath} onExpand={setLightboxUrl} />
          <HoleImageSquare label="Depois" path={hole.imgAfterWorkPath} onExpand={setLightboxUrl} />
        </div>
      </div>

      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setLightboxUrl(null)}
          >
            <X size={20} />
          </button>
          <div
            className="relative h-[90vh] w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightboxUrl}
              alt="Imagem do buraco em tamanho maior"
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default HolePreviewCard;
