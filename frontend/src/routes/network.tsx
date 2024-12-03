import { useEffect } from "react";
import useFetchApi, { fetchApi } from "../hooks/useFetchApi";
import { ConnectionRequestsResponse, User } from "../type";
import toImageSrc from "../utils/image";
import ListTile from "../components/list-tile";


export default function Network() {
  const { loading, value, error, recall } = useFetchApi<ConnectionRequestsResponse>(
    "/api/profile/network", 0, true, {
    method: "GET",
  });

  return (<>
<section className="mt-16 mb-2">
  <div className="flex flex-col min-h-dvh min-h-screen items-center px-2 sm:px-5 mx-auto gap-2 pt-4 sm:pt-0">
{loading ? 
<></>
:
<>

{value?.body.map((req, i) => (<ListTile key={i}
  title={req.full_name!} 
  subtitle={new Date(req.created_at).toLocaleString()}
  imageSrc={toImageSrc(req.profile_photo_path)}
  href={`/profile/${req.id}`}
  >
</ListTile>))
}
</>
}   
  </div>
</section>    
</>)
}