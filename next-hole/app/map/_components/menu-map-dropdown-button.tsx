import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { MenuIcon } from "lucide-react";
import FixedMapDropdownAction from "./fixed-map-dropdown-action";


const MenuMapDropdownButton = () => {
    return ( 
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button className="w-2">
                        <MenuIcon/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-2 min-w-12" > 
                    <DropdownMenuItem className="p-0" >
                        <FixedMapDropdownAction />
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        
     );
}
 
export default MenuMapDropdownButton;