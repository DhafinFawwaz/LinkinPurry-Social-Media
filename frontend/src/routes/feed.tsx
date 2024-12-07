import { useState, useEffect, useRef } from "react";
import useFetchApi, { fetchApi } from "../hooks/useFetchApi";
import { ConnectionRequestsResponse, FeedResponse as PostResponse, Post, User } from "../type";
import toImageSrc from "../utils/image";
import ListTile from "../components/list-tile";
import Dialog from '../components/popup';
import Dropdown from '../components/Dropdown';
import { ToastContainer, toast, Zoom } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 

export default function Feed({user}: {user?: User}) {
  const [posts, setPosts] = useState<Post[]>([]); 
  const [cursor, setCursor] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false); 
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<{ id: number; content: string } | null>(null);

  const initialFetch = useFetchApi<PostResponse>(
    `/api/feed?limit=10`,
    0,
    true,
    { method: "GET" }
  );

  useEffect(() => {
    if (initialFetch.value?.body) {
      setPosts(initialFetch.value.body.feeds);
      setCursor(initialFetch.value.body.cursor || 1);
    }
  }, [initialFetch.value]);

  function openEditDialog(post: { id: number; content: string }) {
    setSelectedPost(post);
    setEditDialogOpen(true);
  }

  function openDeleteDialog(post: { id: number; content: string }) {
    setSelectedPost(post);
    setDeleteDialogOpen(true);
  }

  async function handleSaveEdit() {
    if (!selectedPost) return;

    console.log("payload:", { content: selectedPost.content });
    console.log("post id:", selectedPost.id);
  
    try {
      const res = await fetchApi(`/api/feed/${selectedPost.id}`, {
        method: "PUT",
        body: JSON.stringify({ content: selectedPost.content }),
        headers: { 
          "content-type": "application/json"
        },
      });
  
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || "Failed to update the post.");
        return;
      }

      setEditDialogOpen(false);
      toast.success("Post updated successfully.");
      initialFetch.recall();
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("An error occurred while updating the post.");
    }
  }

  async function handleDeletePost() {
    if (!selectedPost) return;
  
    try {
      const res = await fetchApi(`/api/feed/${selectedPost.id}`, {
        method: "DELETE",
      });
  
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || "Failed to delete the post.");
        return;
      }
      
      toast.success("Post deleted successfully.");
      setDeleteDialogOpen(false);
      initialFetch.recall();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("An error occurred while deleting the post.");
    }
  }

  async function post() {
    const content = textAreaRef.current?.value;
    if (!content) return;
    const body = { content: content };
    const res = await fetchApi("/api/feed", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { 
        "content-type": "application/json" // For some reason, this is required. Login doesn't require this
      },
    });
    if (!res.ok) {
      const data = await res.json();
      toast.error(data.message || "Failed to create the post.");
      return;
    }

    textAreaRef.current!.value = "";
    toast.success("Post created successfully.");
    initialFetch.recall();
  }

  async function loadMore() {
    setLoadingMore(true);
    const limit = 10;
    const res = await fetchApi(`/api/feed?limit=${limit}&cursor=${cursor}`, {
      method: "GET",
    });
    
    if (res.ok) {
      const data: PostResponse = await res.json();
      setPosts((prev) => [...prev, ...data.body.feeds]);
      setCursor(data.body.cursor || 1);
    } else {
      toast.error("Failed to load more posts");
    }

    setLoadingMore(false);
  }

  return (<>
<ToastContainer
  position="bottom-left"
  hideProgressBar={true}
  transition={Zoom}
  autoClose={3000} 
  draggable
/>

<Dialog
  title="Edit Post"
  open={editDialogOpen}
  onClose={() => setEditDialogOpen(false)}
>
  {selectedPost && (
    <div className="flex flex-col gap-4">
      <textarea
        className="w-full p-2 border border-gray-300 rounded-lg"
        value={selectedPost.content}
        onChange={(e) => setSelectedPost({ ...selectedPost, content: e.target.value })}
      />
      <button
        onClick={handleSaveEdit}
        className="bg-blue_primary hover:bg-blue_hover font-semibold text-white px-4 py-2 rounded-lg"
      >
        Save
      </button>
    </div>
  )}
</Dialog>

<Dialog
  title="Delete Post"
  open={deleteDialogOpen}
  onClose={() => setDeleteDialogOpen(false)}
>
  {selectedPost && (
    <div className="flex flex-col gap-4">
      <p className="text-center">Are you sure you want to delete this post?</p>
      <button
        onClick={handleDeletePost}
        className="bg-red-500 hover:bg-red-600 font-semibold text-white px-4 py-2 rounded-lg"
      >
        Delete
      </button>
    </div>
  )}
</Dialog>

<section className="mt-20 sm:mt-16 mb-2">
  <div className="flex flex-col min-h-dvh min-h-screen items-center px-2 sm:px-5 mx-auto gap-2 max-w-lg">

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
    ) : (posts.map((post, i) => (
      <ListTile
        key={i}
        title={post.user.full_name!}
        subtitle={new Date(post.updated_at).toLocaleString()}
        imageSrc={toImageSrc(post.user.profile_photo_path)}
        href={`/profile/${post.user.id}`}
        endChildren={
          Number(user?.id) === Number(post.user.id) && (
            <Dropdown
              options={[
                {
                  label: "Edit",
                  onClick: () => openEditDialog({ id: post.id, content: post.content }),
                },
                {
                  label: "Delete",
                  onClick: () => openDeleteDialog({ id: post.id, content: post.content }),
                },
              ]}
            />
          )
        }
      >
        <div className="px-2 pb-2 text-sm">{post.content}</div>
      </ListTile>
    )))
    }
    
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