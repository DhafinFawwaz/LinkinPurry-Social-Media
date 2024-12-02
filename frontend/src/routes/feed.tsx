import { useState, useEffect, useRef } from "react";
import useFetchApi, { fetchApi } from "../hooks/useFetchApi";
import { ConnectionRequestsResponse, PostResponse, User } from "../type";
import toImageSrc from "../utils/image";
import ListTile from "../components/list-tile";

export default function Feed({user}: {user?: User}) {
  const [posts, setPosts] = useState<PostResponse["body"]>([]); 
  const [cursor, setCursor] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false); 
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const initialFetch = useFetchApi<PostResponse>(
    `/api/feed?limit=10&cursor=${cursor}`,
    0,
    true,
    { method: "GET" }
  );

  useEffect(() => {
    if (initialFetch.value?.body) {
      setPosts(initialFetch.value.body);
    }
  }, [initialFetch.value]);

  async function post() {
    const content = textAreaRef.current?.value;
    if (!content) return;
    const body = { content: content };
    console.log(JSON.stringify(body));
    const res = await fetchApi("/api/feed", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { 
        "Content-Type": "application/json" // For some reason, this is required. Login doesn't require this
      },
    });
    console.log(body);
    if (!res.ok) {
      const data = await res.json();
      console.log(data);
      alert("Failed to post");
      return;
    }

    textAreaRef.current!.value = "";
    initialFetch.recall();
  }

  async function loadMore() {
    setLoadingMore(true);
    const nextCursor = cursor + 10;
    const res = await fetchApi<PostResponse>(
      `/api/feed?limit=10&cursor=${nextCursor}`,
      { method: "GET" }
    );

    if (res.ok) {
      const data = await res.json();
      setPosts((prev) => [...prev, ...data.body]);
      setCursor(nextCursor);
    }

    setLoadingMore(false);
  }

  return (<>
<section className="mt-20 sm:mt-16 mb-2">
  <div className="flex flex-col min-h-dvh min-h-screen items-center px-2 sm:px-5 mx-auto gap-2">

{user ? <>
<ListTile
  title={user.full_name || ""} 
  subtitle={"Write a post!"}
  imageSrc={toImageSrc(user.profile_photo_path)}
  href={`/profile/${user.id}`}
  >
<div className="px-2 pb-2 text-sm">
  <textarea ref={textAreaRef} className="w-full rounded-xl min-h-20 h-20 p-2 border border-gray-300 rounded-md hover:border-blue-600 focus:border-blue-600 focus:bg-blue-50 focus:outline-none" placeholder="What's on your mind?"></textarea>
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

    {initialFetch.loading ? (
      <p>Loading...</p>
    ) : (
      posts.map((post, i) => (
        <ListTile
          key={i}
          title={post.user.full_name!}
          subtitle={new Date(post.updated_at).toLocaleString()}
          imageSrc={toImageSrc(post.user.profile_photo_path)}
          href={`/profile/${post.user.id}`}
        >
          <div className="px-2 pb-2 text-sm">{post.content}</div>
        </ListTile>
      ))
    )}
    
    {!initialFetch.loading && posts.length > 0 && (
      // <div className="flex justify-center w-full">
        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="mt-2 mr-4 mb-20 sm:mb-8 text-blue_primary border border-blue_primary rounded-full px-4 py-1 hover:bg-blue-100 font-medium bg-transparent"
        >
          {loadingMore ? "Loading..." : "Load More"}
        </button>
      // </div>
    )}
  </div>
</section>    
</>)
}