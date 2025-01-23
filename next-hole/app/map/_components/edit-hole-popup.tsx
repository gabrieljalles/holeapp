"use client"
 
import * as React from "react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import Combobox from "@/components/combobox"
import { Spot } from "@/types/Spot";
import { Input } from "@/components/ui/input"

const statusList = [
    {
        value: "Em aberto",
        label: "Em aberto",
    },
    {
        value: "Em manutenção",
        label: "Em manutenção",
    },
    {
        value: "Reparado",
        label: "Reparado",
    },
]

interface EditHolePopupProps {
    onClose: () => void;
    data: Spot;
}

const EditHolePopup = ({data, onClose}: EditHolePopupProps) => {
    const [status, setStatus] = useState(data.status);
    const [endereco, setEndereco] = useState(data.address);
    const [numero, setNumero] = useState(data.number);

    return ( 
        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-[100]">
             <div className=" flex flex-col bg-white p-6 rounded-xl shadow-lg max-w-2xl w-full gap-4">

                <h2 className="text-xl flex gap-4 items-center justify-center font-semibold mb-5">
                    Alterar informações do buraco
                </h2>
                {/* STATUS */}
                <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Status</label>
                <Combobox statusList={statusList} selectedValue={status} onChange={setStatus} />
                </div>
                {/* DADOS DE ENDEREÇO */}
                <div>
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Endereço</label>
                        <Input className="flex-grow" placeholder={endereco} />
                        <label className="text-sm font-medium">Número</label>
                        <Input  maxLength={5} className="w-16" placeholder={numero} />
                    </div>
                    <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Endereço</label>
                    <Input placeholder={endereco} />
                    </div>
                
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
                
                        className="flex-grow-0 basis-1/3 px-4 py-2 hover:bg-successful shadow-lg text-white font-bold rounded"
                    >
                        Salvar
                    </Button>
                </div>
             </div>
        </div>
     );
}
 
export default EditHolePopup;