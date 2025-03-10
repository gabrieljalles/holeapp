"use client"; 
import { useState } from "react";
import { Button } from "./ui/button";

interface ComboboxProps {
    statusList: {value: string; label: string} [];
    selectedValue: string;
    onChange : (value: string) => void;
}

const getClassByValue = (value: string): string => {
    switch (value) {
      case "Em aberto":
        return "destructive"; 
      case "Em manutenção":
        return "waiting"; 
      case "Reparado":
        return "successful"; 
      default:
        return "";
    }
  };

const Combobox = ({statusList, selectedValue, onChange }: ComboboxProps) => {

    const [isOpen, setIsOpen] = useState(false);

    const filteredStatusList = statusList.filter((status) => status.value !== selectedValue)

    const handleSelect = (value: string) => { 
        onChange(value);
        setIsOpen(false);
    }

    return (
        <div className="relative w-full">
      
        <Button
            type="button"
            className={`w-full text-white bg-${getClassByValue(selectedValue)} border border-gray-300 rounded-md shadow-sm text-left hover:text-white focus:outline-none focus:ring-1 focus:ring-gray-300 focus:gray-500 sm:text-sm`}
            onClick={() => setIsOpen(!isOpen)}
        >
            {selectedValue}
        </Button>

        {/* Dropdown */}
        {isOpen && (
            <div className="absolute mt-2 w-full border border-black  rounded-md z-10">
            <ul className="max-h-60 overflow-hidden bg-white rounded-md border text-sm">
                {filteredStatusList.map((item) => (
                <li
                    key={item.value}
                    className={`cursor-pointer px-4 py-2 border-b-1 hover:bg-black hover:text-white`}
                    onClick={() => handleSelect(item.value)}
                >
                    {item.label}
                </li>
                ))}
            </ul>
            </div>
        )}
    </div>
    );
}
 
export default Combobox;