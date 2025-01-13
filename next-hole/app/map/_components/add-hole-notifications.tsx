interface AddHoleNotificationProps {
    show: boolean;
}

const AddHoleNotification = ({show}: AddHoleNotificationProps)=>{
 return(
    <div className={`fixed top-0 left-0 w-full z-[1000] bg-gray-500 text-white text-center py-2 shadow-md transition-transform duration-500 ${
        show ? "translate-y-0" : "-translate-y-full"
      }`}>
        Clique em algum lugar do mapa para adicionar um buraco!
    </div>
 )
}

export default AddHoleNotification;