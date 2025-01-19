"use client";
import { LatLngExpression } from "leaflet";
import dynamic from "next/dynamic";
import React from "react";

const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false }
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

interface Spot {
  id: string;
  lat: number;
  lng: number;
  status: string;
  number: number;
  observation: string;
  address: string;
  cep: string;
  createdAt: string;
  createdBy: string;
  district: string;
  fixedAt: string;
  fixedBy: string;
  imgAfterWorkPath: string;
  imgBeforeWorkPath: string;
  priority: string;
  size: string;
  trafficIntensity: string;
  zone: string;
}

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
      />
    </React.Fragment>
  );
};

export default HoleMap;
