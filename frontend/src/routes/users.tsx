import ListTile from "../components/list-tile";
import useFetchApi, { fetchApi } from "../hooks/useFetchApi";
import { UsersResponse } from "../type";

export default function Users() {
  const { loading, value, error, recall } = useFetchApi<UsersResponse>(
    "/api/users", 0, true, {
    method: "GET",
  });


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
  >
</ListTile>))
}
</>
}   
  </div>
</section>    
</>)
}