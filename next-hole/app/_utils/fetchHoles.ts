import { Spot } from "@/types/Spot";

export const fetchHoles = async (): Promise<Spot[]> => {
    try {

      const response = await fetch("/api/holes",{cache: 'no-cache'});
  
      if (!response.ok) {
        throw new Error("Erro ao buscar buracos");
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erro ao buscar buracos no banco de dados:", error);
      throw error;
    }
  };