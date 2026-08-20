import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { useMapContext } from "../_components/MapContext";

interface ChangeViewProps{
    center: [number, number] | null;
    zoom: number;
}

const ChangeView = ({ center, zoom }: ChangeViewProps) => {
    const map = useMap();
    const {followUser} = useMapContext();
    const lastUpdatedCenter = useRef<[number, number] | null>(null);

    useEffect(() => {
        if (center) {
          if(followUser){
            map.setView(center, zoom);
            lastUpdatedCenter.current = null;
          }else{
            if (
              !lastUpdatedCenter.current ||
              lastUpdatedCenter.current[0] !== center[0] ||
              lastUpdatedCenter.current[1] !== center[1]
            ) {
              map.setView(center, zoom);
              lastUpdatedCenter.current = center;
            }
          } 
        }
      }, [center, zoom, map, followUser]);
    
    return null;
};
    
export default ChangeView;
