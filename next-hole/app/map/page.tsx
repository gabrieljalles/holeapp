"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import AddHoleButton from "./_components/add-hole-button";
import AddHolePopup from "./_components/add-hole-popup";
import axios from "axios";
import { fetchHoles } from "../_utils/fetchHoles";
import { toast } from "@/hooks/use-toast";
import { Spot } from "@/types/Spot";
import {MapProvider} from './_components/MapContext';

const RealtimeLocation = dynamic(
  () => import("./_components/real-time-location"),
  { ssr: false }
);

interface HoleDataProps {
  lat: number;
  lng: number;
  imgBeforeWork: File | null;
  observation: string;
  vereador?: boolean;
  simSystem?: boolean;
  bigHole?: boolean;
}

const MapPage = () => {
  const [isMarking, setIsMarking] = useState(false);
  const [followUser, setFollowUser] = useState(false);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [isEditPopupOpen, isShowPopupOpen] = useState(false);
  const [getSpotHoles, setGetSpotHoles] = useState<Spot[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [holeData, setHoleData] = useState<HoleDataProps>({
    lat: 0,
    lng: 0,
    imgBeforeWork: null,
    observation: "",
    vereador: false,
    simSystem: false,
    bigHole: false,
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
    
    if(!followUser){
      setIsMarking(false);
    }

    setShowAddPopup(true);
  };

  //Chama do banco os buracos;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dataDb = await fetchHoles();
        setGetSpotHoles(dataDb);
      } catch (error) {
        console.error("Erro ao realizar a busca de dados no /api", error);
      }
    };

    fetchData();
  }, [refresh]);

  const handleRefresh = () => {
    setRefresh((prev) => prev+1);
  };

  const handlePopupSubmit = async (data: HoleDataProps) => {
    const formData = new FormData();

    formData.append("lat", holeData.lat.toString());
    formData.append("lng", holeData.lng.toString());
    formData.append("observation", data.observation);
    formData.append("vereador", data.vereador  === true ? "true" : "false");
    formData.append("simSystem", data.simSystem === true ? "true" : "false");
    formData.append("bigHole", data.bigHole === true ? "true": "false");

    if (data.imgBeforeWork) {
      formData.append("imgBeforeWork", data.imgBeforeWork);
    }

    try {
      const response = await axios.post("api/spothole", formData, {
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
      <MapProvider isMarking={isMarking} setIsMarking={setIsMarking} setFollowUser={setFollowUser} followUser={followUser}>
        <RealtimeLocation
          isMarking={isMarking}
          isShowPopupOpen = {isShowPopupOpen}
          onMapClick={handleMapClick}
          data={getSpotHoles}
          onRefresh = {handleRefresh}
        />
      </MapProvider>
      
      <AddHoleButton isVisible={!showAddPopup && !isEditPopupOpen && !isMarking} onActivate={handleActivateMarking} />
      
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
