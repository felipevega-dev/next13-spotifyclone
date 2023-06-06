"use client";

import { useEffect} from "react";
import { useRouter } from "next/navigation";

import { useUser } from "@/hooks/useUser";


const AccountContent = () => {
  const router = useRouter();
  const { isLoading, user } = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/');
    }
  }, [isLoading, user, router]);

  return ( 
    <div className="mb-7 px-6">
     
      <div className="flex flex-col gap-y-4">
        <p>No hay información disponible</p>
      </div>
      
    </div>
  );
}
 
export default AccountContent;
