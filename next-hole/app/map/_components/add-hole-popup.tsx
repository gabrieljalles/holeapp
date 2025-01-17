import React, { useState } from "react";

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
    observation: ''
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
      e.target.value = '';
    }
  };

  const handleFormSubmit =() => {
    onSubmit(formData);
    onClose();
  };

  if (!isVisible) return null;

  console.log("imagem:", )

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex z-[1000] items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-lg w-full">
        <h2 className="text-xl font-semibold mb-4">
          Adicionar informações do buraco
        </h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Foto do buraco:
          </label>
          <input
            type="file"
            name="imgBeforeWork"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Observação:</label>
          <textarea
            name="observation"
            value={formData.observation}
            onChange={handleInputChange}
            rows={3}
            className="border rounded px-2 py-1 w-full"
          />
        </div>
        <div className="flex w-full justify-end space-x-2">
          <button
            onClick={onClose}
            className="flex-grow flex-2 px-4 py-2 bg-gray-500 text-white font-semibold rounded"
          >
            Cancelar
          </button>
          <button
            onClick={handleFormSubmit}
            className="flex-grow-0 basis-1/3 px-4 py-2 bg-[#52c458] text-white font-semibold rounded"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddHolePopup;
