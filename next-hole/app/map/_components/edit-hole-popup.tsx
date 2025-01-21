import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spot } from "@/types/Spot";
import {
  Check,
  CircleAlert,
  HardHat,
  Binary,
  CalendarArrowDown,
  CalendarCheck,
  NotebookPen,
  Triangle,
} from "lucide-react";
import Image from "next/image";
import { formatMyDate } from "@/lib/date";

interface EditHolePopupProps {
  data: Spot;
  onClose: () => void;
}

function getStatusIcon(status: string) {
  switch (status) {
    case "Em aberto":
      return <CircleAlert className="ml-0 mr-1 h-4 w-4" />;
    case "Reparado":
      return <Check className="mr-1 h-4 w-4" />;
    case "Em manutenção":
      return <HardHat className="mr-1 h-4 w-4" />;
    default:
      return <Binary className="mr-1 h-4 w-4" />;
  }
}
function getBadgeVariant(status: string) {
  switch (status) {
    case "Em aberto":
      return "destructive";
    case "Reparado":
      return "successful";
    case "Em manutenção":
      return "waiting";
    default:
      return "outline";
  }
}

const EditHolePopup = ({ data, onClose }: EditHolePopupProps) => {
  const handleOpenGMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${data.lat},${data.lng}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex z-[1000] items-center justify-center">
      <div className=" flex flex-col bg-white p-6 rounded-xl shadow-lg max-w-2xl w-full gap-4">
        <div className="flex flex-row justify-between">
          <div className="flex-1 flex flex-nowrap items-center  bg-white rounded-sm gap-2">
            <h1 className=" bg-white font-semibold rounded-sm text-sm text-center">
              {data.id}
            </h1>
            <Badge
              variant={getBadgeVariant(data.status)}
              className=" flex-shrink-0 rounded-sm"
            >
              {getStatusIcon(data.status ?? "")}
              {data.status}
            </Badge>
          </div>
          <Button
            onClick={handleOpenGMaps}
            className=" bg-gray-200 text-gray-800 font-semibold ml-2 hover:bg-blue-400"
          >
            <Image
              className=""
              alt="Botão para ir para as rotas do googlemaps0"
              src="/google-maps.png"
              width={16}
              height={16}
            />
          </Button>
          <Button
            onClick={onClose}
            className=" bg-gray-200 text-gray-800 font-semibold ml-2 hover:text-white"
          >
            X
          </Button>
        </div>
        {data.imgBeforeWorkPath && (
          <div className="relative w-full h-[320px] bg-gray-300 rounded-md overflow-hidden">
            <Image
              src={`http://localhost:3001/${data.imgBeforeWorkPath}`}
              alt="Imagem do buraco antes do conserto."
              layout="fill"
              objectFit="cover" // Ajusta o conteúdo sem distorcer
            />
          </div>
        )}

        <div className="flex flex-col gap-2 rounded-sm">
          <div className="flex w-full mb-2 gap-2">
            <div className="flex mr-4">
              <p className="font-bold">Zona:</p>
              <p> {data.zone}</p>
            </div>
            <div className="flex mr-4">
              <p className="font-bold">Bairro:</p>
              <p>{data.district}</p>
            </div>
            <div className="flex mr-4">
              <p className="font-bold">CEP:</p>
              <p>{data.cep}</p>
            </div>
          </div>

          <div className="flex w-full mb-2 ">
            <div className="flex mr-4">
              <p className="font-bold">Endereço:</p>
              <p>{data.address}</p>
            </div>

            <div className="flex mr-4">
              <p className="font-bold">Número:</p>
              <p>{data.number}</p>
            </div>
          </div>
          {data.priority && (
            <div className="flex w-full">
              <div className="flex mr-4">
                <p className="font-bold">Prioridade:</p>
                <p>{data.priority} </p>
              </div>
              <div className="flex mr-4">
                <p className="font-bold">Tamanho do buraco:</p>
                <p>{data.size}</p>
              </div>
              <div className="flex mr-4">
                <p className="font-bold">Intensidade do tráfego:</p>
                <p>{data.trafficIntensity}</p>
              </div>
            </div>
          )}

          <div className="flex w-full">
            <div className="flex mr-4">
              <p className="font-bold flex gap-1">
                <CalendarArrowDown size={16} />
                Abertura:
              </p>
              <p>{formatMyDate(data.createdAt)}</p>
            </div>
            {data.fixedAt && (
              <div className="flex">
                <div className="flex mr-4">
                  <p className="font-bold flex gap-1">
                    <CalendarCheck size={16} />
                    Reparo:
                  </p>
                  <p>{formatMyDate(data.fixedAt)}</p>
                </div>
              </div>
            )}
          </div>

          <div className="w-full">
            <p className="font-bold flex gap-1">
              <NotebookPen size={16} />
              Observações:
            </p>
            <p>{data.observation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditHolePopup;
