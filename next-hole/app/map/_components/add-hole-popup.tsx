import React, {useState} from 'react';

interface AddHolePopupProps { 
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    imgBeforeWork: File | null;
    zone: string;
    observation: string;
  }) => void;
}

const AddHolePopup = ({isVisible, onClose, onSubmit}: AddHolePopupProps) => {
  const [formData, setFormData] = useState({
    imgBeforeWork: null as File | null,
    zone: "",
    observation: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, imgBeforeWork: e.target.files[0] });
    }
  };

  const handleFormSubmit = () => {
    onSubmit(formData); // Envia os dados para a função pai
    onClose(); // Fecha o popup
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4">Adicionar informações do buraco</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Foto do buraco:</label>
          <input
            type="file"
            name="imgBeforeWork"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Zona:</label>
          <select
            name="zone"
            value={formData.zone}
            onChange={handleInputChange}
            className="border rounded px-2 py-1 w-full"
          >
            <option value="norte">Norte</option>
            <option value="sul">Sul</option>
            <option value="leste">Leste</option>
            <option value="oeste">Oeste</option>
          </select>
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
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Cancelar
          </button>
          <button
            onClick={handleFormSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddHolePopup;