import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import React, { useState } from "react";
import { MdPhotoCamera } from "react-icons/md";
import { RiPencilFill } from "react-icons/ri";

interface PopupFormData {
  lat: number;
  lng: number;
  imgBeforeWork: File | null;
  observation: string;
}

interface AddHolePopupProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (data: PopupFormData) => void;
}

const AddHolePopup = ({ isVisible, onClose, onSubmit }: AddHolePopupProps) => {
  const [formData, setFormData] = useState({
    lat: 0.0,
    lng: 0.0,
    imgBeforeWork: null as File | null,
    observation: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, imgBeforeWork: e.target.files[0] });
    }
  };

  const handleFormSubmit = () => {
    //Conferência do formulário
    if (!formData.imgBeforeWork) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar os dados!",
        description: "Você precisa adicionar uma foto antes de enviar.",
      });
      return;
    }

    //Envio para formulário
    onSubmit(formData);
    toast({
      variant: "successful",
      title: "Sucesso!",
      description: "O buraco foi adicionado com sucesso!",
      duration: 10000,
    });

    //Reset do formulário
    setFormData({ imgBeforeWork: null, observation: "", lat: 0, lng: 0 });
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex z-[1000] items-center justify-center">
      <div className="mx-2 bg-white p-6 rounded-xl shadow-lg max-w-lg w-full">
        <h2 className="text-xl flex gap-4 items-center justify-center font-semibold mb-5">
          Adicionar informações do buraco
        </h2>
        <div className="mb-4">
          <Label
            htmlFor="file"
            className=" w-full flex gap-1 items-center text-sm font-medium mb-1"
          >
            <MdPhotoCamera size={16} />
            Foto do buraco
          </Label>
          <Input
            type="file"
            name="imgBeforeWork"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
          />
        </div>

        <div className="mb-4">
          <Label
            htmlFor="observation"
            className=" w-full flex gap-1 items-center text-sm font-medium mb-1"
          >
            <RiPencilFill size={16} />
            Observação:
          </Label>
          <Textarea
            placeholder="Digite seu texto aqui."
            id="observation"
            name="observation"
            value={formData.observation}
            onChange={handleInputChange}
            rows={3}
            className="border rounded px-2 py-1 w-full"
          />
        </div>
        <div className="flex w-full justify-end space-x-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-grow flex-2 px-4 py-2 border  font-semibold rounded"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleFormSubmit}
            className="flex-grow-0 basis-1/3 px-4 py-2 bg-[#52c458] shadow-lg text-white font-bold rounded"
          >
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddHolePopup;
