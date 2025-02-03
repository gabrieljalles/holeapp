"use client";
import { LatLngExpression } from "leaflet";
import dynamic from "next/dynamic";
import React from "react";
import { Spot } from "@/types/Spot"

const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false }
);

interface HoleMapProps {
  spot: Spot;
  onClickSpot: (spot: Spot) => void;
}

const HoleMap = ({ spot, onClickSpot }: HoleMapProps) => {
  const center: LatLngExpression = [spot.lat, spot.lng];
  const color = spot.status === "Reparado"? "green": spot.status === "Em manutenção" ? "orange" : "red";
  const borderColor = spot.vereador === true ? "black": color;

  return (
    <React.Fragment key={spot.id}>
      <Circle
        center={[spot.lat, spot.lng]}
        radius={20}
        color={borderColor}
        fillColor={color}
        fillOpacity={0.3}
        eventHandlers={{
          click: () => onClickSpot(spot),
        }}
      ></Circle>

      <Circle
        center={center}
        radius={0.1}
        color= {color}
        fillColor={color}
        fillOpacity={1}
        eventHandlers={{
          click: () => onClickSpot(spot),
        }}
      />
    </React.Fragment>
  );
};

export default HoleMap;
