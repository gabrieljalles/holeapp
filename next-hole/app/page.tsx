import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FaClipboard, FaPlus, FaCog } from "react-icons/fa";
const Home = () => {
  return (
   <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex z-[1000] items-center justify-center">
           <div className="mx-2 flex flex-col bg-gray-100 p-6 rounded-xl shadow-lg max-w-lg w-full gap-4">
               <div className="flex flex-row justify-between">
   
                   <div className="flex-1 flex flex-nowrap items-center justify-around bg-white rounded-sm gap-2">
   
                       <h1 className=" bg-white rounded-sm text-sm text-center">
                       847ad3f2-56c0-48cd-a357-28f6b3763e8f
                       </h1>
                       <Badge className=" flex-shrink-0 rounded-sm">X EM ABERTO</Badge>
                   </div>
                   <Button className=" bg-white text-gray-800 font-semibold ml-2">x</Button>
               </div>
               
               <div className="w-full h-[180px] bg-white">
                   Imagem do buraco
               </div>
               <div className="bg-white rounded-sm">
                   <div className="m-4">
   
                       <div className="flex justify-between">
                           <div className="flex mr-4">
                               <p className="font-bold">Zona:</p>
                               <p>X</p>  
                           </div>
                           <div className="flex mr-4">
                               <p className="font-bold">Bairro:</p>
                               <p>sad</p>  
                           </div>
                           <div className="flex mr-4">
                               <p className="font-bold">CEP:</p>
                               <p>sad</p>  
                           </div>
                           
                       </div>
                      
                       
                   </div>
               </div>
           </div>
       </div>
  )
};

export default Home;
