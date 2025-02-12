// MapContext.tsx
import { createContext, ReactNode, useContext, useState } from "react";

interface MapContextProps {
  followUser: boolean;
  setFollowUser: (value: boolean) => void;
  zoomPosition: number;
  setZoomPosition: (value: number) => void;
}

const MapContext = createContext<MapContextProps | undefined>(undefined);

export const MapProvider = ({ children }: { children: ReactNode }) => {
  const [followUser, setFollowUser] = useState(false);
  const [zoomPosition, setZoomPosition] = useState<number>(13);


  return (
    <MapContext.Provider value={{ followUser, setFollowUser, zoomPosition, setZoomPosition }}>
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