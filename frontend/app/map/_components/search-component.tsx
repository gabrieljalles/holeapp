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
        <div className="flex gap-1.5 w-full">
            <Input
            placeholder="Pesquise o endereço..."
            className="outline-none border-3 h-9 min-w-0 flex-1 text-sm"
            type="text"
            value= {address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown = {handleKeyDown}
            />

            <Button
              size="icon"
              variant="outline"
              className="h-9 w-9 shrink-0"
              onClick={()=> searchLocation(address)}>
              <FaSearch />
            </Button>
        </div>
     );
}
 
export default SearchComponent;