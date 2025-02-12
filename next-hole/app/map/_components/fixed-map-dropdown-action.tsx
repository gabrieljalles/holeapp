import { Button } from "@/components/ui/button";
import { Crosshair } from "lucide-react";
import { useMapContext } from "./MapContext";

const FixedMapDropdownAction = () => {
    const {followUser, setFollowUser} = useMapContext();
    const {zoomPosition, setZoomPosition} = useMapContext();

    const handleClick = () => {
        setFollowUser(!followUser);
        setZoomPosition(zoomPosition === 13 ? 19 : 13)
    }

    return ( 
        <Button size="icon" onClick={handleClick} variant="outline" className={followUser ? "border-4 border-green-400":"border-0"}>
            <Crosshair />
        </Button>
     );
}
 
export default FixedMapDropdownAction;