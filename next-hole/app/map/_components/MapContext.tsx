// MapContext.tsx
import { createContext, ReactNode, useContext, useState } from "react";

interface MapContextProps {
  followUser: boolean;
  setFollowUser: (value: boolean) => void;
  zoomPosition: number;
  setZoomPosition: (value: number) => void;
  isMarking : boolean;
  setIsMarking : (value: boolean) => void;
}

const MapContext = createContext<MapContextProps | undefined>(undefined);

interface MapProviderprops {
    children:ReactNode;
    isMarking: boolean;
    setIsMarking: (value: boolean) => void;
    followUser: boolean;
    setFollowUser: (value: boolean) => void;
}

export const MapProvider = ({ children, isMarking, setIsMarking, followUser, setFollowUser }: MapProviderprops) => {
  const [zoomPosition, setZoomPosition] = useState<number>(13);

  return (
    <MapContext.Provider value={{ followUser, setFollowUser, zoomPosition, setZoomPosition, isMarking, setIsMarking }}>
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