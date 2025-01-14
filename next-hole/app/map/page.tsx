"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import AddHoleButton from "./_components/add-hole-button";
import AddHoleNotification from "./_components/add-hole-notifications";
import AddHolePopup from "./_components/add-hole-popup";
import axios from "axios";

// Importação dinâmica do mapa
const RealtimeLocation = dynamic(
  () => import("./_components/real-time-location"),
  { ssr: false }
);

interface HoleDataProps {
  lat: number;
  lng: number;
  imgBeforeWork: File | null;
  zone: string;
  observation: string;
  status: string;
}

const MapPage = () => {
  const [isMarking, setIsMarking] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [holeData, setHoleData] = useState<HoleDataProps>({
    lat: 0,
    lng: 0,
    imgBeforeWork: null,
    zone: "",
    observation: "",
    status: "Em aberto",
  });

  const handleActivateMarking = () => {
    setIsMarking(true);
    setShowNotification(true);
  };

  const handleMapClick = ({ lat, lng }: { lat: number; lng: number }) => {
    setHoleData({ ...holeData, lat, lng });
    setIsMarking(false);
    setShowPopup(true);
  };

  const handlePopupSubmit = async (data: HoleDataProps) => {
    const formData = new FormData();

    formData.append("lat", holeData.lat.toString());
    formData.append("lng", holeData.lng.toString());
    formData.append("status", data.status);
    formData.append("zone", data.zone);
    formData.append("observation", data.observation);
    if (data.imgBeforeWork) {
      formData.append("imgBeforeWork", data.imgBeforeWork);
    }

    console.log("Dados no FormData:");
    for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
    }

    try {
      const response = await axios.post("api/holes", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Success:", response.data);
      setShowPopup(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="relative w-full h-full">
      <AddHoleNotification
        show={showNotification}
        message="Clique no mapa para adicionar um buraco"
        color="gray"
      />
      <RealtimeLocation isMarking={isMarking} onMapClick={handleMapClick} />
      <AddHoleButton onActivate={handleActivateMarking} />
      <AddHolePopup
        isVisible={showPopup}
        onClose={() => {
          setShowPopup(false);
          setShowNotification(false);
        }}
        onSubmit={handlePopupSubmit}
      />
    </div>
  );
};

export default MapPage;
