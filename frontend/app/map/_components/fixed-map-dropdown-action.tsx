import { Button } from "@/components/ui/button";
import { Crosshair } from "lucide-react";
import { useMapContext } from "./MapContext";

const DEFAULT_ZOOM = 13;
const FOLLOW_USER_ZOOM = 19.5;

const FixedMapDropdownAction = () => {
    const {followUser, setFollowUser, zoomPosition, setZoomPosition, setIsMarking} = useMapContext();


    const handleClick = () => {
        const newState = !followUser;
        setFollowUser(newState);
        setZoomPosition(zoomPosition === DEFAULT_ZOOM ? FOLLOW_USER_ZOOM : DEFAULT_ZOOM)

        if(newState){
            setIsMarking(true);
        }else{
            setIsMarking(false);
        }
    }

    return ( 
        <Button size="icon" onClick={handleClick} variant="outline" className={followUser ? "border-4 border-green-400":"border-0"}>
            <Crosshair />
        </Button>
     );
}
 
export default FixedMapDropdownAction;