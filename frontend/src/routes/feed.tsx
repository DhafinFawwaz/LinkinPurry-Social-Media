import { useEffect, useRef } from "react";
import useFetchApi, { fetchApi } from "../hooks/useFetchApi";
import { ConnectionRequestsResponse, PostResponse, User } from "../type";
import toImageSrc from "../utils/image";
import ListTile from "../components/list-tile";
import { JWTContent } from "../type";

export default function Feed({user}: {user?: JWTContent}) {
  const { loading, value, error, recall } = useFetchApi<PostResponse>(
    "/api/feed?limit=10&cursor=0", 0, true, {
    method: "GET",
  });

  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  async function post() {
    const content = textAreaRef.current?.value;
    if (!content) return;
    const res = await fetchApi("/api/feed", {
      method: "POST",
      body: JSON.stringify({ content }),
    });
    if(!res.ok) {
      alert("Failed to post");
      return;
    }

    textAreaRef.current!.value = "";
    recall();
  }

  return (<>
<section className="mt-16 mb-2">
  <div className="flex flex-col min-h-dvh min-h-screen items-center px-2 sm:px-5 mx-auto gap-2">

{user ? <>
<ListTile
  title={user.full_name} 
  subtitle={"Write a post!"}
  imageSrc={toImageSrc(user.profile_photo_path)}
  href={`/profile/${user.id}`}
  >
<div className="px-2 pb-2 text-sm">
  <textarea ref={textAreaRef} className="w-full min-h-20 h-20 p-2 border border-gray-300 rounded-md hover:border-blue-600 focus:border-blue-600 focus:bg-blue-50 focus:outline-none" placeholder="What's on your mind?"></textarea>
  <div className="flex justify-end gap-2">
    <button onClick={post} className="items-center bg-blue_primary text-white font-semibold h-[2rem] w-20 flex justify-center rounded-full hover:bg-blue_hover text-sm">
      Post
    </button>
  </div>
</div>
</ListTile>
</>
: <></>
}

{loading ? 
<></>
:
<>
{value?.body.map((req, i) => (<ListTile key={i}
  title={req.user.full_name!} 
  subtitle={new Date(req.updated_at).toLocaleString()}
  imageSrc={toImageSrc(req.user.profile_photo_path)}
  href={`/profile/${req.user.id}`}
  >
<div className="px-2 pb-2 text-sm">
  {req.content}
</div>
</ListTile>))
}


</>
}   
  </div>
</section>    
</>)
}