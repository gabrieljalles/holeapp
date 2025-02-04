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
        <div className="absolute top-10  left-1/2 transform -translate-x-1/2 max-w-[500px] min-w-[280px] p-2 h-16 z-[1000] flex gap-2 items-center">
            <Input
            placeholder="Pesquise o endereço..."
            className=" outline-none border-2 border-gray-500"
            type="text"
            value= {address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyDown = {handleKeyDown}
            />
            
            <Button
            className="bg-gray-500"
            onClick={()=> searchLocation(address)}>
            <FaSearch />
            </Button>
        </div>
     );
}
 
export default SearchComponent;