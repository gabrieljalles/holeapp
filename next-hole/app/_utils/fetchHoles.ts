export const fetchHoles = async (): Promise<any[]> => {
    try {
      const response = await fetch("/api/holes");
  
      if (!response.ok) {
        throw new Error("Erro ao buscar buracos");
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erro ao buscar buracos no banco de dados:", error);
      throw error; // Propaga o erro para ser tratado por quem chamar a função
    }
  };