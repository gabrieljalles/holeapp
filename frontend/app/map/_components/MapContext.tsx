// MapContext.tsx
import { createContext, ReactNode, useContext, useState } from "react";

interface MapContextProps {
  followUser: boolean;
  setFollowUser: (value: boolean) => void;
  zoomPosition: number;
  setZoomPosition: (value: number) => void;
  isMarking : boolean;
  setIsMarking : (value: boolean) => void;
  showCollaborators: boolean;
  setShowCollaborators: (value: boolean) => void;
  // null = sem restrição de zona (comportamento normal). Array (mesmo vazio) = mapa
  // restrito a essas zonas — usado pelo reparador (sempre) e pelo admin (opcional).
  zoneFilterIds: string[] | null;
  setZoneFilterIds: (value: string[] | null) => void;
}

const MapContext = createContext<MapContextProps | undefined>(undefined);

interface MapProviderprops {
    children:ReactNode;
    isMarking: boolean;
    setIsMarking: (value: boolean) => void;
    followUser: boolean;
    setFollowUser: (value: boolean) => void;
    zoneFilterIds: string[] | null;
    setZoneFilterIds: (value: string[] | null) => void;
}

export const MapProvider = ({
  children,
  isMarking,
  setIsMarking,
  followUser,
  setFollowUser,
  zoneFilterIds,
  setZoneFilterIds,
}: MapProviderprops) => {
  const [zoomPosition, setZoomPosition] = useState<number>(13);
  const [showCollaborators, setShowCollaborators] = useState<boolean>(false);

  return (
    <MapContext.Provider
      value={{
        followUser,
        setFollowUser,
        zoomPosition,
        setZoomPosition,
        isMarking,
        setIsMarking,
        showCollaborators,
        setShowCollaborators,
        zoneFilterIds,
        setZoneFilterIds,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMapContext must be used within a MapProvider");
  }
  return context;
};
