import React from "react";

interface DeleteHoleAlertProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

const DeleteHoleAlert = ({isOpen, onClose, onConfirm, isLoading}:DeleteHoleAlertProps) => {
  if(!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-md text-center">
        <h2 className="text-lg font-semibold mb-4">
          Tem certeza que deseja excluir este buraco?
        </h2>
        <div className="flex justify-center">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded mr-2"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 mr-2"></div>
                Excluindo...
              </div>
            ) : (
              "Sim, excluir"
            )}
          </button>
          <button
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}


export default DeleteHoleAlert;