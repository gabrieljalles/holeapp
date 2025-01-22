"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import AddHoleButton from "./_components/add-hole-button";
import AddHolePopup from "./_components/add-hole-popup";
import axios from "axios";
import { fetchHoles } from "../_utils/fetchHoles";
import { toast } from "@/hooks/use-toast";

const RealtimeLocation = dynamic(
  () => import("./_components/real-time-location"),
  { ssr: false }
);

interface HoleDataProps {
  lat: number;
  lng: number;
  imgBeforeWork: File | null;
  observation: string;
}

const MapPage = () => {
  const [isMarking, setIsMarking] = useState(false);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [getSpotHoles, setGetSpotHoles] = useState<any[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [holeData, setHoleData] = useState<HoleDataProps>({
    lat: 0,
    lng: 0,
    imgBeforeWork: null,
    observation: "",
  });
  const handleActivateMarking = () => {
    toast({
      variant: "default",
      title: "Selecione no mapa",
      description: "Escolha onde ficará o buraco no mapa!",
    });
    setIsMarking(true);
  };

  const handleMapClick = ({ lat, lng }: { lat: number; lng: number }) => {
    setHoleData({ ...holeData, lat, lng });
    setIsMarking(false);
    setShowAddPopup(true);
  };

  //Chama do banco os buracos;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataDb = await fetchHoles();
        setGetSpotHoles(dataDb);
      } catch (error) {
        console.error("Erro ao realizar a busca de dados no /api");
      }
    };

    fetchData();
  }, [refresh]);

  const handleRefresh = () => {
    setRefresh((prev) => !prev);
  };

  const handlePopupSubmit = async (data: HoleDataProps) => {
    const formData = new FormData();

    formData.append("lat", holeData.lat.toString());
    formData.append("lng", holeData.lng.toString());
    formData.append("observation", data.observation);

    if (!data.imgBeforeWork) {
      return;
    } else {
      formData.append("imgBeforeWork", data.imgBeforeWork);
    }

    try {
      const response = await axios.post("api/holes", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Success:", response.data);
      setShowAddPopup(false);
      handleRefresh();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="relative w-full h-full">
      <RealtimeLocation
        isMarking={isMarking}
        setIsEditPopupOpen = {setIsEditPopupOpen}
        onMapClick={handleMapClick}
        data={getSpotHoles}
        onRefresh = {handleRefresh}
      />
      
      <AddHoleButton isVisible={!showAddPopup && !isEditPopupOpen} onActivate={handleActivateMarking} />
      
      
      <AddHolePopup
        isVisible={showAddPopup}
        onClose={() => {
          setShowAddPopup(false);
        }}
        onSubmit={handlePopupSubmit}
      />
    </div>
  );
};

export default MapPage;
