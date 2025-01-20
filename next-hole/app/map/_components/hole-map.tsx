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
  return (
    <React.Fragment key={spot.id}>
      <Circle
        center={[spot.lat, spot.lng]}
        radius={20}
        color="red"
        fillColor="red"
        fillOpacity={0.3}
        eventHandlers={{
          click: () => onClickSpot(spot),
        }}
      ></Circle>

      <Circle
        center={[spot.lat, spot.lng]}
        radius={0.5}
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
