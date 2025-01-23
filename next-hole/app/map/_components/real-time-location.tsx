"use client";
import { useEffect, useState } from "react";
import L from "leaflet";
import dynamic from "next/dynamic";
import { useMapEvents } from "react-leaflet";
import HoleMap from "./hole-map";
import ShowHolePopup from "./show-hole-popup";
import {Spot} from '@/types/Spot';
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const customIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const MapClickHandler = ({
  onMapClick,
  isMarking,
  setClickedLocation,
}: any) => {
  useMapEvents({
    click: (e) => {
      if (isMarking) {
        const { lat, lng } = e.latlng;
        onMapClick({ lat, lng });
        setClickedLocation([lat, lng]);
      }
    },
  });
  return null;
};

const RealtimeLocation = ({
  isMarking,
  onMapClick,
  data,
  isShowPopupOpen,
  onRefresh,
}: {
  isMarking: boolean;
  onMapClick: (location: { lat: number; lng: number }) => void;
  data: Spot[];
  isShowPopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onRefresh: () => void;
}) => {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(
    null
  );

  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  //Obter localização do usuário
  useEffect(() => {
    if (!navigator.geolocation || typeof window === "undefined") {
      console.error("Geolocation is not supported by your browser");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserPosition([latitude, longitude]);
      },
      (err) => {
        console.error("Error getting location:", err);
      },
      { enableHighAccuracy: true, maximumAge: 10000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId); // Limpa o watcher ao desmontar
    };
  }, []);

  if (!userPosition) {
    return <p>Loading your location...</p>;
  }

  return (
    <MapContainer
      center={userPosition}
      zoom={14}
      style={{ height: "100vh", width: "100%", zIndex: "0" }}
      key="realtime-map"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {selectedSpot && 
      <ShowHolePopup 
      onRefresh={onRefresh} 
      isShowPopupOpen={isShowPopupOpen} 
      setSelectedSpot={setSelectedSpot} 
      data={selectedSpot} 
      onClose={() => setSelectedSpot(null)} />}

      {userPosition && <Marker position={userPosition} icon={customIcon} />}

      {data.map((spot: Spot) => {
        if (!spot.lat || !spot.lng) return null;
        return (
          <HoleMap
            spot={spot}
            key={spot.id}
            onClickSpot={(clickeSpot) => setSelectedSpot(clickeSpot)}
          />
        );
      })}

      <MapClickHandler onMapClick={onMapClick} isMarking={isMarking} />
    </MapContainer>
  );
};

export default RealtimeLocation;
