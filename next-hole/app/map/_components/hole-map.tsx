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

function getCircleColor(status: string): { color: string; fillColor: string } {
  switch (status) {
    case "Em aberto":
      return { color: "red", fillColor: "red" };
    case "Reparado":
      return { color: "green", fillColor: "green" };
    case "Em manutenção":
      return { color: "orange", fillColor: "orange" };
    default:
      return { color: "gray", fillColor: "gray" };
  }
}

const HoleMap = ({ spot, onClickSpot }: HoleMapProps) => {
  const center: LatLngExpression = [spot.lat, spot.lng];
  const {color, fillColor} = getCircleColor(spot.status)

  return (
    <React.Fragment key={spot.id}>
      <Circle
        center={[spot.lat, spot.lng]}
        radius={20}
        color={color}
        fillColor={fillColor}
        fillOpacity={0.3}
        eventHandlers={{
          click: () => onClickSpot(spot),
        }}
      ></Circle>

      <Circle
        center={[spot.lat, spot.lng]}
        radius={0.1}
        color="black"
        fillColor="black"
        fillOpacity={1}
        eventHandlers={{
          click: () => onClickSpot(spot),
        }}
      />
    </React.Fragment>
  );
};

export default HoleMap;
