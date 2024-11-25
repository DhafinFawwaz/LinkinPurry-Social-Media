import { useEffect } from "react";
import useFetchApi from "../hooks/useFetchApi";
import { ConnectionRequestsResponse } from "../type";
import toImageSrc from "../utils/image";


export default function Network() {
  const { loading, value, error, recall } = useFetchApi<ConnectionRequestsResponse>(
    "/api/profile/requests", 0, true, {
    method: "GET",
  });

  useEffect(() => {
    console.log(value)
  }, [loading, value, error])


  return (<>
<section className="mt-16">
  <div className="flex flex-col min-h-dvh min-h-screen items-center px-2 sm:px-5 mx-auto gap-2">
{loading ? 
<></>
:
<>
{
value?.body.map(req => <>
  <div className="w-full max-w-md bg-white border border-gray-300 rounded-3xl relative">
    <div className="px-2 py-[0.25rem] flex items-center">
      <div className="w-full flex gap-2 items-center">
        <img className="h-8 w-8 rounded-full overflow-hidden object-cover" src={toImageSrc(req.from.profile_photo_path)} alt="" />
        <div>
          <div className="font-bold text-sm">{req.from.full_name}</div>
          <div className="font-normal text-xs text-gray-500">{new Date(req.from.updated_at).toLocaleString()}</div>
        </div>
      </div>

      <button className="bg-white text-black_primary font-semiboldrounded-full border border-black_primary hover:bg-white_hover h-[2rem] w-24 items-center justify-center flex rounded-full text-sm">Deny</button>
      <div className="w-4"></div>
      <button className="items-center bg-blue_primary text-white font-semibold h-[2rem] w-24 flex justify-center rounded-full hover:bg-blue_hover text-sm">Accept</button>
    </div>
  </div>
</>)
}

</>
}
    
  </div>
</section>    
</>)
}