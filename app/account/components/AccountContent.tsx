"use client";

import { UserDetails } from "@/types";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import UploadedSongs from "@/components/UploadedSongs";

const AccountContent = () => {
  const router = useRouter();
  const { isLoading, user, userDetails} = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return <div className="mb-7 px-6">Loading...</div>;
  }

  return ( 
    <div className="mb-7 px-6">
      <div className="flex flex-col gap-y-4">
        <h2 className="text-2xl font-semibold text-white">Datos Personales</h2>
        <p className="text-neutral-400">Correo: {user.email}</p>
        {/* Add more account information here if needed */}
      </div>
      <div className="mt-5">
        <UploadedSongs />
      </div>
    </div>
  );
}
 
export default AccountContent;