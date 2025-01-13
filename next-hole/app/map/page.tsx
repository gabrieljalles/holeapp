"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import AddHoleButton from "./_components/add-hole-button";
import AddHoleNotification from "./_components/add-hole-notifications";
import AddHolePopup from './_components/add-hole-popup';
import axios from "axios";

// Importação dinâmica do mapa
const RealtimeLocation = dynamic(
  () => import("./_components/real-time-location"),
  { ssr: false }
);


interface HoleDataProps {
  coordinates: {lat : number; lng:number};
  imgBeforeWork: File | null;
  zone: string;
  observation: string;
}

const MapPage = () => {
  const [isMarking, setIsMarking] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [holeData, setHoleData] = useState<HoleDataProps>({
    coordinates: {lat:0, lng: 0},
    imgBeforeWork:null,
    zone: "",
    observation:"",
  });

  const handleActivateMarking = () => {
    setIsMarking(true);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 7000);
  };

  const handleMapClick = (location: { lat: number; lng: number }) => {
    setHoleData({...holeData, coordinates:location});
    setIsMarking(false);
    setShowPopup(true);
  };

  const handlePopupSubmit = async(data:HoleDataProps) => {
    console.log("Dados do buraco:", {
      ...holeData,
      ...data,
    });

  const formData = new FormData();
  formData.append("lat", holeData.coordinates.lat.toString());
  formData.append("lng", holeData.coordinates.lng.toString());
  formData.append("zone", data.zone);
  formData.append("observation", data.observation);
  if (data.imgBeforeWork) {
    formData.append("imgBeforeWork", data.imgBeforeWork);
  }
    
    try {
      const response = await axios.post("holes", formData, {
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
      <AddHoleNotification show={showNotification} />
      <RealtimeLocation isMarking={isMarking} onMapClick={handleMapClick} />
      <AddHoleButton onActivate={handleActivateMarking} />
      <AddHolePopup isVisible={showPopup} onClose={() => setShowPopup(false)} onSubmit={handlePopupSubmit} />
    </div>
  );
};

export default MapPage;
