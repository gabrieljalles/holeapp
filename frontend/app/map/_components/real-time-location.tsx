"use client";
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet-rotate";
import dynamic from "next/dynamic";
import {useMap, useMapEvents } from "react-leaflet";
import HoleLayer from "./hole-layer";
import ShowHolePopup from "./show-hole-popup";
import {Spot, HoleBounds} from '@/types/Spot';
import type { HolesResponse } from '@/types/Spot';
import SearchComponent from "./search-component";
import FixedMapDropdownAction from "./fixed-map-dropdown-action";
import AddHoleButton from "./add-hole-button";
import UserMenuButton from "./user-menu-button";
import CollaboratorsToggleButton from "./collaborators-toggle-button";
import CollaboratorsLayer from "./collaborators-layer";
import ZoneViewControl from "./zone-view-control";
import ZonePolygonLayer from "./zone-polygon-layer";
import { useMapContext } from './MapContext';

import ChangeView from "../_functions/change-view";
import { angularDelta, smoothAngle } from "../_functions/smooth-heading";

// Suaviza a direção do ponteiro do usuário (leitura bruta do sensor treme muito).
const HEADING_SMOOTHING_FACTOR = 0.05;

// Ignora ruído do sensor menor que isso — evita "derivar" lentamente com o celular parado.
const HEADING_DEAD_ZONE_DEG = 1.5;

// Raio (graus) usado para montar a bbox inicial ao redor do usuário,
// antes do primeiro moveend/zoomend disparar.
const INITIAL_BOUNDS_RADIUS_DEG = 0.05;

const VIEWPORT_DEBOUNCE_MS = 400;

// Intervalo de report da própria posição, pro admin poder ver colaboradores online.
const LOCATION_REPORT_INTERVAL_MS = 60_000;

const boundsFromCenter = (center: [number, number], radiusDeg: number): HoleBounds => ({
  minLat: center[0] - radiusDeg,
  maxLat: center[0] + radiusDeg,
  minLng: center[1] - radiusDeg,
  maxLng: center[1] + radiusDeg,
});

const addressIcon = new L.Icon({
  iconUrl: "https://utfs.io/f/tHigeRwX8lT2nnOn3qRe1U9VtjLG35f8ZKOIE4iPdCQBJoNu",
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const holeIcon = new L.Icon({
  iconUrl: "https://utfs.io/f/tHigeRwX8lT2nnOn3qRe1U9VtjLG35f8ZKOIE4iPdCQBJoNu",
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


// Impede que cliques/toques em controles sobrepostos ao mapa (botões, busca) sejam
// interpretados pelo Leaflet como clique no mapa (o que abriria o fluxo de marcar buraco).
const MapOverlayControl = ({ className, children }: { className: string; children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      L.DomEvent.disableClickPropagation(ref.current);
      L.DomEvent.disableScrollPropagation(ref.current);
    }
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

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

interface ViewportWatcherProps {
  onViewportChange: (bounds: HoleBounds, zoom: number) => void;
}

// Escuta pan/zoom e reporta a bbox+zoom atuais, com debounce, para escopar a busca de buracos.
const ViewportWatcher = ({ onViewportChange }: ViewportWatcherProps) => {
  const map = useMap();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emit = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const b = map.getBounds();
      onViewportChange(
        {
          minLat: b.getSouth(),
          maxLat: b.getNorth(),
          minLng: b.getWest(),
          maxLng: b.getEast(),
        },
        map.getZoom()
      );
    }, VIEWPORT_DEBOUNCE_MS);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useMapEvents({
    moveend: () => emit(),
    zoomend: () => emit(),
  });

  return null;
};

const RealtimeLocation = ({
  isMarking,
  onMapClick,
  data,
  isShowPopupOpen,
  onRefresh,
  onViewportChange,
  isAddHoleVisible,
  onActivateAddHole,
}: {
  isMarking: boolean;
  onMapClick: (location: { lat: number; lng: number }) => void;
  data: HolesResponse;
  isShowPopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onRefresh: () => void;
  onViewportChange: (bounds: HoleBounds, zoom: number) => void;
  isAddHoleVisible: boolean;
  onActivateAddHole: () => void;
}) => {

  const { followUser , zoomPosition, setZoomPosition, showCollaborators, zoneFilterIds } = useMapContext();

  const [userPosition, setUserPosition] = useState<[number, number] | null>(
    null
  );
  const userPositionRef = useRef<[number, number] | null>(null);
  const [userDirection, setUserDirection] = useState<number>(0);
  const [addressPosition, setAddressPosition] = useState<[number, number]|null >(null)
  const [address, setAddress] = useState("");
  const [clickedPosition, setClickedPosition] = useState<[number, number] | null>(
    null
  );
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const hasEmittedInitialViewport = useRef(false);

  const reportLocation = useCallback(() => {
    const position = userPositionRef.current;
    if (!position) return;

    fetch("/api/user/location", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat: position[0], lng: position[1] }),
    }).catch(() => {});
  }, []);

  const selectedSpot =
    selectedSpotId && data.type === "points"
      ? data.points.find((s) => s.id === selectedSpotId)
      : null;

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
        setUserDirection((prev) =>
          Math.abs(angularDelta(prev, alpha)) < HEADING_DEAD_ZONE_DEG
            ? prev
            : smoothAngle(prev, alpha, HEADING_SMOOTHING_FACTOR)
        );
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
        userPositionRef.current = [latitude, longitude];
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

  // Reporta a própria posição a cada 1 min, pro admin poder ver colaboradores online
  // no mapa. Lê a posição via ref (não via state) pra não recriar o interval a cada
  // atualização de GPS — o interval é criado uma única vez e mantido fixo em 60s.
  useEffect(() => {
    const intervalId = setInterval(reportLocation, LOCATION_REPORT_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [reportLocation]);

  const hasReportedInitialLocation = useRef(false);

  useEffect(() => {
    if (userPosition && !hasReportedInitialLocation.current) {
      hasReportedInitialLocation.current = true;
      reportLocation();
    }
  }, [userPosition, reportLocation]);

  useEffect(() => {
    if (userPosition && !hasEmittedInitialViewport.current) {
      hasEmittedInitialViewport.current = true;
      onViewportChange(boundsFromCenter(userPosition, INITIAL_BOUNDS_RADIUS_DEG), zoomPosition);
    }
  }, [userPosition, zoomPosition, onViewportChange]);

  if (!userPosition) {
    return <p>Loading your location...</p>;
  }

  return (
    <MapContainer
      center={userPosition}
      zoom={zoomPosition}
      style={{ height: "100vh", width: "100%", zIndex: "0" }}
      maxZoom = {21}
      preferCanvas
      rotate
      rotateControl={false}
      zoomControl={false}
      touchRotate
      key="realtime-map"
    >
      {
      (followUser || addressPosition) && (
        <ChangeView center ={followUser ? userPosition : addressPosition} zoom={zoomPosition}/>
      )
      }

      <MapOverlayControl className="absolute top-4 left-3 right-3 z-[1000] flex items-center gap-2">
        <UserMenuButton />
        {!followUser && (
          <div className="flex-1 min-w-0 max-w-[min(80vw,320px)]">
            <SearchComponent address={address} setAddress={setAddress} searchLocation={searchLocation} />
          </div>
        )}
      </MapOverlayControl>

      <MapOverlayControl className="absolute right-3 bottom-32 z-[1000] flex flex-col gap-2">
        <AddHoleButton isVisible={isAddHoleVisible} onActivate={onActivateAddHole} />
        <FixedMapDropdownAction />
        <CollaboratorsToggleButton />
        <ZoneViewControl />
      </MapOverlayControl>

      {showCollaborators && <CollaboratorsLayer />}
      {zoneFilterIds && <ZonePolygonLayer />}

      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={21}
        // O servidor padrão do OpenStreetMap só tem tiles reais até o zoom 19 — acima
        // disso não existe imagem (404), e o mapa fica cinza. maxNativeZoom={19} faz o
        // Leaflet reusar/ampliar o último tile real em vez de pedir um que não existe.
        maxNativeZoom={19}
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
        // O leaflet-rotate mantém marcadores no "norotatePane" (só reposiciona por
        // matemática, não gira via CSS) — só o tilePane/overlayPane giram de verdade.
        // Ou seja, este ícone já fica com orientação fixa na tela por padrão; não precisa
        // (e não deve) descontar a rotação do mapa aqui, senão ele gira sozinho ao
        // arrastar o mapa com o dedo, mesmo sem o celular ter mudado de direção.
        html: `
        <div style="transform: rotate(${userDirection}deg); transition: transform 0.2s ease; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.4));">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="#2563eb" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 19 21 12 17 5 21 12 2" />
          </svg>
        </div>
      `,
      className: '',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    })}
       />}
      {clickedPosition && <Marker position={clickedPosition} icon={holeIcon} />}

      <HoleLayer data={data} onClickSpot={(s: Spot) => setSelectedSpotId(s.id)} />

      <ViewportWatcher onViewportChange={onViewportChange} />

      <MapClickHandler onMapClick={onMapClick} isMarking={isMarking} setClickedLocation={setClickedPosition} />
    </MapContainer>
  );
};

export default RealtimeLocation;
