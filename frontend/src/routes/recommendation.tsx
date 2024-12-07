import { useEffect } from "react";
import useFetchApi, { fetchApi } from "../hooks/useFetchApi";
import { ConnectionInviteResponse, ConnectionRequestsResponse, RecommendationResponse, User } from "../type";
import toImageSrc from "../utils/image";
import ListTile from "../components/list-tile";


export default function Recommendation() {
  const { loading, value, error, recall } = useFetchApi<RecommendationResponse>(
    "/api/recommendation", 0, true, {
    method: "GET",
  });


  return (<>
<section className="mt-16 mb-2">
  <div className="flex flex-col min-h-dvh min-h-screen items-center px-2 sm:px-5 mx-auto gap-2 pt-4 sm:pt-0 max-w-lg">
{loading ? 
<></>
:
<>
{value?.body.users2nd.length === 0 ? <>
  <div className="w-full">
    <div className="text-left w-full max-w-md font-bold">Recommendation (2nd degree)</div>
    <div className="text-left w-full max-w-md text-sm font-normal">You don't have any connection from connected user that is not connected to you</div>
  </div>
</> : <>
  <div className="w-full">
    <div className="text-left w-full max-w-md font-bold">Recommendation (2nd degree)</div>
    <div className="text-left w-full max-w-md text-sm font-normal">List of connection from connected user that is not connected to you</div>
  </div>
  {value?.body.users2nd.map((user, i) => (<ListTile key={i}
    title={user.full_name!} 
    subtitle={"Connected with " + user.c1_full_name}
    imageSrc={toImageSrc(user.profile_photo_path)}
    href={`/profile/${user.id}`}
    >
  </ListTile>))
  }
</>
}

<div className="h-2"></div>
{value?.body.users3rd.length === 0 ? <>
  <div className="w-full">
    <div className="text-left w-full max-w-md font-bold">Recommendation (3rd degree)</div>
    <div className="text-left w-full max-w-md text-sm font-normal">You don't have any connection from connection of connected user that is not connected to you</div>
  </div>
</> : <>
  <div className="w-full">
    <div className="text-left w-full max-w-md font-bold">Recommendation (3rd degree)</div>
    <div className="text-left w-full max-w-md text-sm font-normal">List of connection from connection of connected user that is not connected to you</div>
  </div>
  {value?.body.users3rd.map((user, i) => (<ListTile key={i}
    title={user.full_name!} 
    subtitle={"Connected with " + user.c1_full_name + ", which connected with " + user.c2_full_name}
    imageSrc={toImageSrc(user.profile_photo_path)}
    href={`/profile/${user.id}`}
    >
  </ListTile>))
  }
</>
}

</>
}   
  </div>
</section>    
</>)
}