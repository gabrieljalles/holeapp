import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddHoleButtonProps {
  onActivate: () => void;
  isVisible: boolean;
}

const AddHoleButton = ({ onActivate, isVisible }: AddHoleButtonProps) => {

  if (!isVisible) return null;

  return (
    <Button
      size="icon"
      variant="outline"
      onClick={onActivate}
      aria-label="Adicionar buraco"
      title="Adicionar buraco"
    >
      <Plus size={20} />
    </Button>
  );
};

export default AddHoleButton;
