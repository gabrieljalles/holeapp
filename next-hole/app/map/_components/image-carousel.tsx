import { useState } from "react";
import Image from "next/image";

interface ImageCarouselProps{
    imgBeforeWorkPath : string;
    imgAfterWorkPath : string;
}

const ImageCarousel = ({ imgBeforeWorkPath, imgAfterWorkPath }:ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    imgBeforeWorkPath && `http://localhost:3001/${imgBeforeWorkPath}`,
    imgAfterWorkPath && `http://localhost:3001/${imgAfterWorkPath}`,
  ].filter(Boolean); // Remove caminhos inválidos (null ou undefined)

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="relative w-full h-[320px] bg-gray-300 rounded-md overflow-hidden">
      {images.length > 0 && (
        <>
          <Image
            src={images[currentIndex]}
            alt={`Imagem ${currentIndex + 1}`}
            fill
            style={{ objectFit: "cover" }}
          />
          {/* Botão Anterior */}
          <button
            onClick={handlePrev}
            className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-md hover:text-black hover:bg-white"
          >
            {"<"}
          </button>
          {/* Botão Próximo */}
          <button
            onClick={handleNext}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-md hover:text-black hover:bg-white"
          >
            {">"}
          </button>
        </>
      )}
      {images.length === 0 && (
        <p className="flex items-center justify-center h-full text-gray-500">
          Nenhuma imagem disponível.
        </p>
      )}
    </div>
  );
};

export default ImageCarousel;