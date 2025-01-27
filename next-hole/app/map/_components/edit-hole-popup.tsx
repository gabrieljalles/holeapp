"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
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
  data: Spot;
}

const EditHolePopup = ({ data, onClose }: EditHolePopupProps) => {
  const [status, setStatus] = useState(data.status || "Sem status");
  const [endereco, setEndereco] = useState(data.address || "Sem endereço");
  const [numero, setNumero] = useState(data.number || "");
  const [cep, setCep] = useState(data.cep || "Sem CEP");
  const [bairro, setBairro] = useState(data.district || "Sem bairro");
  const [setor, setSetor] = useState(data.zone);
  const [prioridade, setPrioridade] = useState(data.priority);
  const [trafficIntensity, setTrafficIntensity] = useState(
    data.trafficIntensity
  );
  const [tamanho, setTamanho] = useState(data.size);
  const [observation, setObservation] = useState(data.observation);
  const [imgBeforeWork, setImgBeforeWork] = useState<File | null>(null);
  const [imgAfterWork, setImgAfterWork] = useState<File | null>(null);
  const [fixedAt, setFixedAt] = useState<string | null>(data.fixedAt || null);

  useEffect(() => {
    if (status == "Reparado") {
      setFixedAt(new Date().toISOString());
    } else {
      setFixedAt(null);
    }
  }, [status]);

  const handleSave = async () => {
    if (status === "Reparado" && !imgAfterWork) {
      toast({
        variant: "destructive",
        title: "Falta a imagem de reparo!",
        description: "Você precisa adicionar a foto do buraco reformado!",
        duration: 7000,
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("status", status);
      formData.append("address", endereco);
      formData.append("number", numero.toString());
      formData.append("cep", cep);
      formData.append("district", bairro);
      formData.append("zone", setor);
      formData.append("priority", String(prioridade));
      formData.append("trafficIntensity", String(trafficIntensity));
      formData.append("size", String(tamanho));
      formData.append("observation", observation || "");
      if (fixedAt) {
        formData.append("fixedAt", fixedAt);
      }
      if (imgBeforeWork) {
        formData.append("imgBeforeWork", imgBeforeWork);
      }
      if (imgAfterWork) {
        formData.append("imgAfterWork", imgAfterWork);
      }

      const res = await fetch(`/api/holes?id=${data.id}`, {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        throw new Error("Falha ao atualizar");
      }

      toast({
        variant: "successful",
        title: "Registro alterado com sucesso!",
        duration: 7000,
      });
      onClose(); // fecha modal
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar o buraco.",
        duration: 7000,
      });
    }
  };

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
            <div className="flex flex-nowrap items-center gap-2">
              <label className="text-sm font-medium">CEP</label>
              <Input
                className="w-28"
                placeholder={cep}
                value={cep}
                onChange={(e) => setCep(e.target.value)}
              />
            </div>

            <div className="flex flex-grow items-center gap-2">
              <label className="text-sm font-medium">Número</label>
              <Input
                className="  min-w-[30px]"
                maxLength={5}
                placeholder={numero.toString()}
                value={numero.toString()}
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
            <div className="flex flex-grow items-center gap-2">
              <label className="text-sm font-medium">Endereço</label>
              <Input
                value={endereco}
                className="flex-grow"
                placeholder={endereco}
                onChange={(e) => setEndereco(e.target.value)}
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
                capture="environment"
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
                  capture="environment"
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
            onClick={onClose}
            className="flex-grow flex-2 px-4 py-2 border  font-semibold rounded"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="flex-grow-0 basis-1/3 px-4 py-2 hover:bg-successful shadow-lg text-white font-bold rounded"
          >
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditHolePopup;
