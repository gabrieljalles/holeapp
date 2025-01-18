import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FaClipboard, FaCog, FaPlus } from "react-icons/fa";

interface AddHoleButtonProps {
  onActivate: () => void;
}

const AddHoleButton = ({ onActivate }: AddHoleButtonProps) => {
  return (
    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 max-w-[350px] min-w-[280px] p-2 h-16 z-[1000] flex gap-2 items-center justify-between">
      <Button
        className="flex-1 shadow-xl h-full flex items-center justify-center bg-gray-700  rounded-2xl hover:bg-[#52c458]"
        onClick={onActivate}
      >
        <FaPlus size={36} />
        Adicionar buraco
      </Button>
    </div>
  );
};

export default AddHoleButton;
