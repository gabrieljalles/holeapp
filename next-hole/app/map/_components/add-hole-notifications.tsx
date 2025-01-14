interface AddHoleNotificationProps {
  show: boolean;
  message: string;
  color: "gray" | "red" | "green" | "yellow";
}

const AddHoleNotification = ({
  show,
  message,
  color,
}: AddHoleNotificationProps) => {
  const colorClasses = {
    gray: "bg-gray-500",
    red: "bg-red-500",
    green: "bg-green-500",
    yellow: "bg-yellow-600",
  };

  return (
    <div
      className={`fixed top-0 left-0 w-full z-[1000] bg-gray-500 text-white font-bold text-center py-2 shadow-md transition-transform duration-500 ${
        show ? "translate-y-0" : "-translate-y-full"
      } ${colorClasses[color]}`}
    >
      {message}
    </div>
  );
};

export default AddHoleNotification;
