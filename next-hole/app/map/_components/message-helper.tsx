"use client";

import { useEffect, useState } from "react";

export interface messageHelperProps {
  show: boolean;
  message?: string;
  color?: "gray" | "red" | "green" | "yellow";
  onClose?:() => void;
};

const MessageHelper = ({
  show,
  message,
  color,
  onClose,
}: messageHelperProps) => {
  const colorClasses = {
    gray: "bg-gray-500",
    red: "bg-red-500",
    green: "bg-green-500",
    yellow: "bg-yellow-600",
  };

  const [visible, setVisible] = useState(false);
  const [render, setRender] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (show) {
      setRender(true); 
      setTimeout(() => 
        setVisible(true), 10);
      
      timeoutId = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          setRender(false);
          if (onClose) onClose();
        }, 500);
      }, 5000);
    } else {
      setVisible(false);
      setTimeout(() => setRender(false), 500); 
    }
  }, [show]);

  return (
    render && (
      <div
        className={`fixed top-0 left-0 w-full z-[1000] text-white font-semibold text-center py-2 shadow-md transition-transform duration-500 ${
          visible ? "translate-y-0" : "-translate-y-full"
        } ${colorClasses[color ?? "gray"]}`}
      >
        {message}
      </div>
    )
   
  );
};

export default MessageHelper;
