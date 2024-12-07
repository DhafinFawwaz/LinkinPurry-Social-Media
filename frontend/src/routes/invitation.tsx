import { useEffect } from "react";
import useFetchApi, { fetchApi } from "../hooks/useFetchApi";
import { ConnectionInviteResponse, ConnectionRequestsResponse, User } from "../type";
import toImageSrc from "../utils/image";
import ListTile from "../components/list-tile";


export default function Invitation() {
  const { loading, value, error, recall } = useFetchApi<ConnectionInviteResponse>(
    "/api/profile/requests", 0, true, {
    method: "GET",
  });

  async function accept(user: User) {
    const res = await fetchApi(`/api/profile/${user.id}/accept`, {
      method: "POST",
    })
    if(!res.ok) {
      alert("Accepting failed");
      return;
    }

    recall();
  }

  async function deny(user: User) {
    const res = await fetchApi(`/api/profile/${user.id}/deny`, {
      method: "DELETE",
    });
    if(!res.ok) {
      alert("Denying failed");
      return;
    }
  
    recall();
  }



  return (<>
<section className="mt-16 mb-2">
  <div className="flex flex-col min-h-dvh min-h-screen items-center px-2 sm:px-5 mx-auto gap-2 pt-4 sm:pt-0 max-w-lg">
{loading ? 
<></>
:
<>
{value?.body.requests.length === 0 ? <></> : <>
  <div className="text-left w-full max-w-md font-bold">Invitations</div>
  {value?.body.requests.map((req, i) => (<ListTile key={i}
    title={req.from.full_name!} 
    subtitle={"Invited on " + new Date(req.created_at).toLocaleString()}
    imageSrc={toImageSrc(req.from.profile_photo_path)}
    endChildren={<>
      <button onClick={() => deny(req.from)} className="bg-white text-black_primary font-semiboldrounded-full border border-black_primary hover:bg-white_hover h-[2rem] w-24 items-center justify-center flex rounded-full text-sm">Deny</button>
      <div className="w-4"></div>
      <button onClick={() => accept(req.from)} className="items-center bg-blue_primary text-white font-semibold h-[2rem] w-24 flex justify-center rounded-full hover:bg-blue_hover text-sm">Accept</button>
    </>}
    href={`/profile/${req.from.id}`}
    >
  </ListTile>))
  }
</>
}

{value?.body.pending.length === 0 ? <></> : <>
  <div className="text-left w-full max-w-md font-bold">Pending</div>
  {value?.body.pending.map((req, i) => (<ListTile key={i}
    title={req.to.full_name!} 
    subtitle={"Asked on " + new Date(req.created_at).toLocaleString()}
    imageSrc={toImageSrc(req.to.profile_photo_path)}
    endChildren={<>
      <button disabled className="bg-background_grey text-gray-400 font-semibold h-[2rem] w-24 rounded-full border-gray-300 border text-sm">Pending</button>
    </>}
    href={`/profile/${req.to.id}`}
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