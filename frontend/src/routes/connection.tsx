import { useEffect } from "react";
import useFetchApi, { fetchApi } from "../hooks/useFetchApi";
import { ConnectionRequestsResponse, User } from "../type";
import toImageSrc from "../utils/image";
import ListTile from "../components/list-tile";


export default function Network() {
  const { loading, value, error, recall } = useFetchApi<ConnectionRequestsResponse>(
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
    })
    if(!res.ok) {
      alert("Denying failed");
      return;
    }

    recall();
  }



  return (<>
<section className="mt-16 mb-2">
  <div className="flex flex-col min-h-dvh min-h-screen items-center px-2 sm:px-5 mx-auto gap-2">
{loading ? 
<></>
:
<>
{value?.body.map((req, i) => (<ListTile key={i}
  title={req.from.full_name!} 
  subtitle={new Date(req.created_at).toLocaleString()}
  imageSrc={toImageSrc(req.from.profile_photo_path)}
  endChildren={<>
    <button onClick={() => accept(req.from)} className="bg-white text-black_primary font-semiboldrounded-full border border-black_primary hover:bg-white_hover h-[2rem] w-24 items-center justify-center flex rounded-full text-sm">Deny</button>
    <div className="w-4"></div>
    <button onClick={() => deny(req.from)} className="items-center bg-blue_primary text-white font-semibold h-[2rem] w-24 flex justify-center rounded-full hover:bg-blue_hover text-sm">Accept</button>
  </>}
  href={`/profile/${req.from.id}`}
  >
</ListTile>))
}
</>
}   
  </div>
</section>    
</>)
}