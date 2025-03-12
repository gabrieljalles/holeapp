"use client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import L from "leaflet";
import dynamic from "next/dynamic";
import {useMapEvents } from "react-leaflet";
import HoleMap from "./hole-map";
import ShowHolePopup from "./show-hole-popup";
import {Spot} from '@/types/Spot';
import SearchComponent from "./search-component";
import MenuMapDropdownButton from "./menu-map-dropdown-button";
import { useMapContext } from './MapContext';

import ChangeView from "../_functions/change-view";

const addressIcon = new L.Icon({
  iconUrl: "https://utfs.io/f/tHigeRwX8lT2BmQgEFYokrWdDe1jQSFpZtMJ90cVnwqRHNTf",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const holeIcon = new L.Icon({
  iconUrl: "https://utfs.io/f/tHigeRwX8lT2BmQgEFYokrWdDe1jQSFpZtMJ90cVnwqRHNTf",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

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


type MapClickHandlerType = (coords: { lat: number; lng: number }) => void;

interface MapClickHandlerProps{
  onMapClick: MapClickHandlerType;
  isMarking: boolean;
  setClickedLocation : Dispatch<SetStateAction<[number, number] | null>>;
}

const MapClickHandler = ({
  onMapClick,
  isMarking,
  setClickedLocation,
}: MapClickHandlerProps) => {
  useMapEvents({
    click: (e) => {
      if (isMarking) {
        const { lat, lng } = e.latlng;
        onMapClick({ lat, lng });
        setClickedLocation([lat, lng]);
      }else{
        setClickedLocation(null);
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

  const { followUser , zoomPosition, setZoomPosition } = useMapContext();

  const [userPosition, setUserPosition] = useState<[number, number] | null>(
    null
  );
  const [userDirection, setUserDirection] = useState<number>(0);
  const [addressPosition, setAddressPosition] = useState<[number, number]|null >(null)
  const [address, setAddress] = useState("");
  const [clickedPosition, setClickedPosition] = useState<[number, number] | null>(
    null
  );
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);

  const selectedSpot = selectedSpotId ? data.find((s) => s.id === selectedSpotId):null;

  const searchLocation = async() => {
    if (!address) return;

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ", Uberlândia, MG, Brasil")}&viewbox=-48.3809,-18.8400,-47.9009,-19.2400&bounded=1`
    );

    const data = await response.json();

    if(data.length > 0 ){
      const {lat, lon} = data[0];
      setAddressPosition([parseFloat(lat), parseFloat(lon)])
      setZoomPosition(19);
      setAddress('');
    }else{
      alert("Endereço não encontrado!")
    }
  }
 
  useEffect(() => {

    //Direção que o usuário está olhando
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.absolute || event.alpha !== null){
        const alpha = event.alpha ?? 0;
        setUserDirection(alpha);
      }
    }

    window.addEventListener("deviceorientation", handleOrientation, true);

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
      { enableHighAccuracy: true, maximumAge: 1000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId); // Limpa o watcher ao desmontar
      window.removeEventListener("deviceorientation", handleOrientation); // Remove o orientador ao desmontar
    };
  }, []);

  if (!userPosition) {
    return <p>Loading your location...</p>;
  }

  return (
    <MapContainer
      center={userPosition}
      zoom={zoomPosition}
      style={{ height: "100vh", width: "100%", zIndex: "0" }}
      maxZoom = {21}
      key="realtime-map"
    >
      {
      (followUser || addressPosition) && (
        <ChangeView center ={followUser ? userPosition : addressPosition} zoom={zoomPosition}/>
      )
      }
      
      <div className="absolute top-4  left-1/2 transform -translate-x-1/2  min-w-[280px] p-2 h-16 z-[1000] flex gap-2 items-center">
        <MenuMapDropdownButton />
        {!followUser &&(
          <SearchComponent address={address} setAddress={setAddress} searchLocation={searchLocation} />
        )}
        
      </div>

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={21}
        maxNativeZoom={21}
      />

      {selectedSpot && 
      <ShowHolePopup 
      onRefresh={onRefresh} 
      isShowPopupOpen={isShowPopupOpen} 
      setSelectedSpotId={setSelectedSpotId} 
      data={selectedSpot} 
      onClose={() => setSelectedSpotId(null)}
      />}

      {addressPosition && <Marker position={addressPosition}  icon={addressIcon}/>}
      {userPosition && <Marker position={userPosition} icon={L.divIcon({
        html: `
        <div style="transform: rotate(${userDirection}deg); transition: transform 0.2s ease;">
          <img src="https://utfs.io/f/tHigeRwX8lT2BmQgEFYokrWdDe1jQSFpZtMJ90cVnwqRHNTf" style="width: 28px; height: 28px; transform: rotate(180deg)" />
        </div>
      `,
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    })}
       />}
      {clickedPosition && <Marker position={clickedPosition} icon={holeIcon} />}

      {data.map((spot: Spot) => {
        if (!spot.lat || !spot.lng) return null;
        return (
          <HoleMap
            spot={spot}
            key={spot.id + '-' + (spot.status ?? "")}
            onClickSpot={(s: Spot) => setSelectedSpotId(s.id)}
          />
        );
      })}

      <MapClickHandler onMapClick={onMapClick} isMarking={isMarking} setClickedLocation={setClickedPosition} />
    </MapContainer>
  );
};

export default RealtimeLocation;
