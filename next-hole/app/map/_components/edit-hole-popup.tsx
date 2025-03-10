"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import Combobox from "@/components/combobox";
import { Spot } from "@/types/Spot";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MdPhotoCamera } from "react-icons/md";
import { RiPencilFill } from "react-icons/ri";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

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
];

interface EditHolePopupProps {
  onClose: () => void;
  onRefresh: () => void;
  data: Spot;
  onEditHole: (formData: FormData) => Promise<void>;
  isLoading: boolean;
}

const EditHolePopup = ({ data, onClose, onRefresh, onEditHole, isLoading}: EditHolePopupProps) => {
  const [status, setStatus] = useState(data.status || "Sem status");
  const [numero, setNumero] = useState(data.number);
  const [bairro, setBairro] = useState(data.district || "Sem bairro");
  const [setor, setSetor] = useState(data.zone);
  const [tamanho, setTamanho] = useState(data.size);
  const [observation, setObservation] = useState(data.observation);
  const [imgBeforeWork, setImgBeforeWork] = useState<File | null>(null);
  const [imgAfterWork, setImgAfterWork] = useState<File | null>(null);
  const [fixedAt, setFixedAt] = useState(data.fixedAt || null);

  const fixedAtMemo = useMemo(() => {
    if (status === "Reparado" && !data.imgAfterWorkPath){
      return new Date().toISOString();
    }
    return null;
  },[status, data.imgAfterWorkPath]);

  useEffect(() => {
    setFixedAt(fixedAtMemo);
    if(!fixedAtMemo){
      setImgAfterWork(null);
    }},[fixedAtMemo]);

  const handleSave = async () => {
    if (status === "Reparado" && !data.imgAfterWorkPath) {
      if(!imgAfterWork){
        toast({
          variant: "destructive",
          title: "Falta a imagem de reparo!",
          description: "Você precisa adicionar a foto do buraco reformado!",
          duration: 7000,
        });
        return;
      }
    }

    const formData = new FormData();
    formData.append("id", data.id);
    formData.append("status", status);
    formData.append("number", numero ?? "");
    formData.append("district", bairro ?? "");
    formData.append("zone", setor ?? "");
    formData.append("size", tamanho ?? "");
    formData.append("observation", observation ?? "");

    if(fixedAt){
      formData.append("fixedAt", fixedAt);
    }
    if (imgBeforeWork) {
      formData.append("imgBeforeWork", imgBeforeWork);
    }
    if (imgAfterWork) {
      formData.append("imgAfterWork", imgAfterWork);
    }

    await onEditHole(formData);

    onRefresh();
    onClose();
  }

  const handleCancel = () => {
    onClose();
  }

  return (
    <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-[100]">
      <div className=" flex flex-col bg-white p-4 rounded-sm shadow-lg max-w-2xl w-full gap-4 mx-4">
        <h2 className="text-md flex  items-center justify-center font-semibold mb-1">
          Alterar informações do buraco
        </h2>
        {/* STATUS */}
        <div className="flex items-center gap-2">
          <Combobox
            statusList={statusList}
            selectedValue={status}
            onChange={setStatus}
          />
        </div>

        {/* DADOS DE ENDEREÇO */}
        <div className="border-b flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex flex-grow items-center gap-2">
              <label className="text-sm font-medium">Número</label>
              <Input
                className="  min-w-[30px]"
                maxLength={5}
                placeholder={numero || ""}
                value={numero || ""}
                onChange={(e) => setNumero(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <div className="flex items-center flex-grow gap-2">
              <label className="text-sm font-medium">Bairro</label>
              <Input
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                className="flex-grow"
                placeholder={bairro}
              />
            </div>

            <div className="flex items-center flex-grow gap-2">
              <label className="text-sm font-medium">Setor</label>
              <Input
                onChange={(e) => setSetor(e.target.value)}
                value={setor}
                className="flex-grow"
                placeholder={setor}
              />
            </div>
          </div>
        </div>

        {/* DADOS DO BURACO */}
        <div className="border-b">
          <div className="flex items-center gap-2 my-1">
            <label className=" min-w-[70px] text-sm font-medium">{`Área (m2)`}</label>
            <Input
              className="flex-grow"
              value={tamanho?.toString()}
              onChange={(e) => setTamanho(e.target.value)}
              placeholder={tamanho}
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
              id="observation"
              name="observation"
              value={observation || ""}
              rows={3}
              onChange={(e) => setObservation(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            />
          </div>

          {/* CAMERA */}
          <div className="mb-4 flex gap-2 flex-wrap flex-row">
            <div>
              <Label
                htmlFor="file"
                className=" w-full flex gap-1 items-center text-sm font-medium mb-1"
              >
                <MdPhotoCamera size={16} />
                Buraco <b>sem reparo</b>
              </Label>
              <Input
                id="fileBefore"
                type="file"
                name="imgBeforeWork"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setImgBeforeWork(file);
                }}
              />
            </div>

            {status == "Reparado" && (
              <div>
                <Label
                  htmlFor="fileAfter"
                  className=" w-full flex gap-1 items-center text-sm font-medium mb-1"
                >
                  <MdPhotoCamera size={16} />
                  Buraco <b>reparado</b>
                </Label>
                <Input
                  id="fileAfter"
                  type="file"
                  name="imgAfterWork"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setImgAfterWork(file);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex w-full justify-end space-x-2">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="flex-grow flex-2 px-4 py-2 border  font-semibold rounded"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            disabled={isLoading}
            onClick={handleSave}
            className="flex-grow-0 basis-1/3 px-4 py-2 hover:bg-successful shadow-lg text-white font-bold rounded"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Salvando...
              </div>
            ) : (
              "Salvar"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditHolePopup;
