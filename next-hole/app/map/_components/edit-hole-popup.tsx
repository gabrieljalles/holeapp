"use client"
 
import * as React from "react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import Combobox from "@/components/combobox"
import { Spot } from "@/types/Spot";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MdPhotoCamera } from "react-icons/md"
import { RiPencilFill } from "react-icons/ri"
import { Textarea } from "@/components/ui/textarea"

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
    const [status, setStatus] = useState(data.status || "Sem status");
    const [endereco, setEndereco] = useState(data.address || "Sem endereço");
    const [numero, setNumero] = useState(data.number || "");
    const [cep, setCep] = useState(data.cep || "Sem CEP"); 
    const [bairro, setBairro] = useState(data.district || "Sem bairro");
    const [setor, setSetor] = useState(data.zone);
    const [prioridade, setPrioridade] = useState(data.priority);
    const [trafficIntensity, setTrafficIntensity] = useState(data.trafficIntensity);
    const [tamanho, setTamanho] = useState(data.size);
    const [observation, setObservation] = useState(data.observation);


    return ( 
        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-[100]">
             <div className=" flex flex-col bg-white p-4 rounded-sm shadow-lg max-w-2xl w-full gap-4 mx-4">

                <h2 className="text-md flex  items-center justify-center font-semibold mb-1">
                    Alterar informações do buraco
                </h2>
                {/* STATUS */}
                <div className="flex items-center gap-2">
                <Combobox statusList={statusList} selectedValue={status} onChange={setStatus} />
                </div>
                {/* DADOS DE ENDEREÇO */}
                <div className="border-b flex flex-col gap-2">
                    <div className="flex items-center gap-2">

                        <div className= "flex flex-nowrap items-center gap-2">
                            <label className="text-sm font-medium">CEP</label>
                            <Input className="w-28" placeholder={cep} />
                        </div>

                        <div className="flex flex-grow items-center gap-2">
                            <label className="text-sm font-medium">Número</label>
                            <Input className="  min-w-[30px]"  maxLength={5} placeholder={numero.toString()} />
                        </div>

                        
                        
                        
                        
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">

                        <div className="flex items-center flex-grow gap-2">
                            <label className="text-sm font-medium">Bairro</label>
                            <Input className="flex-grow" placeholder={bairro} />
                        </div>

                        <div className="flex items-center flex-grow gap-2">
                            <label className="text-sm font-medium">Setor</label>
                            <Input className="flex-grow" placeholder={setor} />
                        </div>
                        <div className="flex flex-grow items-center gap-2">
                            <label className="text-sm font-medium">Endereço</label>
                            <Input className="flex-grow" placeholder={endereco} />
                        </div>
                    </div>
                </div  >
                {/* DADOS DO BURACO */}
                <div className="border-b">
                    <div className="flex items-center gap-2 my-1">
                        <label className=" min-w-[70px] text-sm font-medium">{`Área (m2)`}</label>
                        <Input className="flex-grow" placeholder={tamanho} />
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
                            id="observation"
                            name="observation"
                            value={observation}
                            rows={3}
                            className="border rounded px-2 py-1 w-full"
                        />
                    </div>

                    {/* CAMERA */}
                    <div className="mb-4 flex gap-4 flex-wrap flex-row">
                        <div>
                            <Label
                                htmlFor="file"
                                className=" w-full flex gap-1 items-center text-sm font-medium mb-1"
                            >
                                <MdPhotoCamera size={16} />
                                Buraco <b>sem reparo</b>
                            </Label>
                            <Input
                                placeholder="arqyivididjajd asdiadji"
                                type="file"
                                name="imgBeforeWork"
                                accept="image/*"
                                capture="environment"
                            />
                        </div>

                        {status == "Reparado" && (
                            <div>
                                <Label
                                    htmlFor="file"
                                    className=" w-full flex gap-1 items-center text-sm font-medium mb-1"
                                >
                                    <MdPhotoCamera size={16} />
                                    Buraco <b>reparado</b>
                                </Label>
                                <Input
                                    type="file"
                                    name="imgAfterWork"
                                    accept="image/*"
                                    capture="environment"
                                />
                            </div>
                        )}
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