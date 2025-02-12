import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaSearch } from "react-icons/fa";

interface SearchComponentsProps{
    address: string;
    setAddress: (value: string) => void;
    searchLocation: (address: string) => void;
}

const SearchComponent = ({address, setAddress, searchLocation}:SearchComponentsProps) => {

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && address.trim() !== "") {
          searchLocation(address);
        }
      };

    return ( 
        <div className="flex gap-2">
            <Input
            placeholder="Pesquise o endereço..."
            className=" outline-none border-3"
            type="text"
            value= {address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown = {handleKeyDown}
            />
            
            <Button
              size="icon"
              onClick={()=> searchLocation(address)}>
              <FaSearch />
            </Button>
        </div>
     );
}
 
export default SearchComponent;