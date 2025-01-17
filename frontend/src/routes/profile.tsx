import ProfileInfo from '../components/profile/ProfileInfo';
import ProfileCards from '../components/profile/ProfileCards';
import Dialog from '../components/popup';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import FormInput from '../components/form-input';
import { AuthResponse, ProfileResponse, User } from '../type';
import FormTextarea from '../components/form-textarea';
import { useEffect, useState } from 'react';
import toImageSrc from '../utils/image';
import EditIcon from '../assets/images/edit-icon.svg';
import useFetchApi, { fetchApi } from '../hooks/useFetchApi';
import ProfileTile from '../components/profile/profile-tile';
import ListTile from '../components/list-tile';
import { useParams } from 'react-router-dom';
import { AccessLevel } from '../type';
import Dropdown from '../components/Dropdown';
import { ToastContainer, toast, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const EditProfileSchema = z.object({
  username: z.string().min(1, "Username is required"),
  name: z.string().optional(),
  work_history: z.string().optional(),
  skills: z.string().optional(),
});
export type EditProfileSchema = z.infer<typeof EditProfileSchema>;



export default function Profile({ logout, onProfileEdited }: { logout: () => void, onProfileEdited: () => void }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError, reset} = useForm<EditProfileSchema>({mode: "all", resolver: zodResolver(EditProfileSchema)});

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<{ id: number; content: string } | null>(null);

  const { user_id } = useParams<{ user_id: string }>();
  const { loading, value, recall } = useFetchApi<ProfileResponse>(`/api/profile/${user_id}`, 0, true, {}, [user_id]);
  // console.log("Profile", value);
  // console.log("Profile", value?.body.connection_count);

  
  const [file, setFile] = useState<File>();
  function handleImageChange(e: any) {
    try {
      const file = e.target.files[0];
      if (file.type.split("/")[0] !== "image") {
        toast.error("Invalid file type. Please upload an image.");
        return;
      }
      setFile(file);
    } catch (error) {
      
    }
  }

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

    try {
      const res = await fetchApi(`/api/feed/${selectedPost.id}`, {
        method: "PUT",
        body: JSON.stringify({ content: selectedPost.content }),
        headers: {
          "content-type": "application/json",
        },
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || "Failed to update the post");
        return;
      }

      toast.success("Post updated successfully.");
      setEditDialogOpen(false);
      recall();
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error("An error occurred while updating the post.");
    }
  }

  async function handleDeletePost() {
    if (!selectedPost) return;

    try {
      const res = await fetchApi(`/api/feed/${selectedPost.id}`, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || "Failed to delete the post");
        return;
      }

      toast.success("Post deleted successfully.");
      setDeleteDialogOpen(false);
      recall();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("An error occurred while deleting the post.");
    }
  }

  async function onSubmit(data: EditProfileSchema) {
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("name", data.name || "");
    formData.append("work_history", data.work_history || "");
    formData.append("skills", data.skills || "");
    if (file) formData.append("profile_photo", file);

    console.log("Data", data);
    console.log("FormData", formData);
    console.log("FormData", formData.get("username"));

    try {
      const res = await fetchApi(`/api/profile/${user_id}`, {
        method: "PUT",
        body: formData,
        headers: {
          "content-type": "multipart/form-data",
        }
      });
      console.log("res.ok", res.ok);
      if (!res.ok) {

        const data = await res.json(); 
        console.log("data", data);
        if(data.errors) {
          if(data.errors.username) {
            setError("username", { message: data.errors.username });
            toast.error(data.errors.username);
          } else if(data.errors.name) {
            setError("name", { message: data.errors.name });
            toast.error(data.errors.name);
          } else if(data.errors.work_history) {
            setError("work_history", { message: data.errors.work_history });
            toast.error(data.errors.work_history);
          } else if(data.errors.skills) {
            setError("skills", { message: data.errors.skills });
            toast.error(data.errors.skills);
          } else if(data.errors.profile_photo) {
            setError("root", { message: data.errors.profile_photo });
            toast.error(data.errors.profile_photo);
          } else {
            toast.error("Failed to update profile");
          }
        }

        else toast.error("Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully.");
      onProfileEdited();
      recall();
      setIsDialogOpen(false);
      setFile(undefined);
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while updating the profile.");
    }
  }
  function onEditButtonClick() {
    setIsDialogOpen(true);
  }

  function getConnectionCount() {
    if (!value) return 0;
    return value.body.connection_count;
  }

  function getAccessLevel(): AccessLevel {
    if(loading) return "public";
    if(!value) return "public";
    if(!value.body) return "public";
    return value.body.connection;
  }

  async function onConnect() {
    try {
      const res = await fetchApi(`/api/profile/${user_id}/connect`, { method: "POST" });

      if (!res.ok) {
        toast.error("Failed to connect to user");
        return;
      }

      toast.success("Request sent.");
      recall();
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while connecting to the user.");
    }
  }

  async function onDisconnect() {
    try {
      const res = await fetchApi(`/api/profile/${user_id}/disconnect`, { method: "DELETE" });

      if (!res.ok) {
        toast.error("Failed to disconnect from user");
        return;
      }

      toast.success("Connection removed.");
      recall();
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while disconnecting from the user.");
    }
  }

  async function accept(user_id: number) {
    try {
      const res = await fetchApi(`/api/profile/${user_id}/accept`, { method: "POST" });

      if (!res.ok) {
        toast.error("Accepting failed");
        return;
      }

      toast.success("Request accepted.");
      recall();
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while accepting the request.");
    }
  }

  async function deny(user_id: number) {
    try {
      const res = await fetchApi(`/api/profile/${user_id}/deny`, { method: "DELETE" });

      if (!res.ok) {
        toast.error("Denying failed");
        return;
      }

      toast.success("Request denied.");
      recall();
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while denying the request.");
    }
  }


  return (<>
<ToastContainer
  position="bottom-left"
  hideProgressBar={true}
  transition={Zoom}
  autoClose={3000} 
  draggable
/>

<Dialog title='Edit Profile' open={isDialogOpen} onClose={() => {setIsDialogOpen(false)}}>
{loading ? <></> : <>
  <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-0 mt-2">
    
    <div className='w-full flex justify-center mb-4 relative'>
      <label htmlFor='profile_photo_path' className='cursor-pointer flex flex-row-reverse group'>
        {file ? 
          <img className='object-cover w-24 h-24 rounded-full' src={URL.createObjectURL(file)} alt="" />
          :
          <img className='object-cover w-24 h-24 rounded-full' src={toImageSrc(value?.body.profile_photo_path!)} alt="" />
        }
        <div className='bg-black opacity-0 group-hover:opacity-15 h-24 w-24 absolute rounded-full'></div>
        <div className="w-8 h-8 bg-slate-200 group-hover:bg-slate-300 rounded-full absolute bottom-0 flex items-center justify-center translate-x-1 translate-y-1">
          <img src={EditIcon} alt="Edit Icon" className="w-4 h-4"/>
        </div>
      </label>
    </div>
    <input onChange={handleImageChange} id='profile_photo_path' type="file" hidden accept='image/png, image/gif, image/jpeg' />
    
    <div className='grid grid-cols-2 gap-4'>
      <FormInput register={register} error={errors.username} field={"username"} type={"text"} title={"Username"} defaultValue={value?.body.username}></FormInput>
      <FormInput register={register} error={errors.name} field={"name"} type={"text"} title={"Name"} defaultValue={value?.body.name || ""}></FormInput>
    </div>
    <FormTextarea register={register} error={errors.work_history} field={"work_history"} title={"Work History"} defaultValue={value?.body.work_history || ""}></FormTextarea>
    <FormTextarea register={register} error={errors.skills} field={"skills"} title={"Enter your work Skills"} defaultValue={value?.body.skills || ""}></FormTextarea>

    <button disabled={isSubmitting} className="disabled:cursor-not-allowed disabled:bg-slate-400 disabled:text-slate-200 rounded-lg bg-blue_primary hover:bg-blue_hover focus:ring-4 ring-blue-500 py-2 font-bold text-white w-full">Submit</button>
  </form>
</>
}

</Dialog>

<Dialog
  title="Edit Post"
  open={editDialogOpen}
  onClose={() => setEditDialogOpen(false)}
>
  {selectedPost && (
    <div className="flex flex-col gap-4">
      <textarea
        className="w-full p-2 border border-gray-300 rounded-lg hover:border-blue-600 focus:border-blue-600 focus:bg-blue-50 focus:outline-none"
        value={selectedPost.content}
        onChange={(e) => setSelectedPost({ ...selectedPost, content: e.target.value })}
      />
      <button
        onClick={handleSaveEdit}
        className="bg-blue_primary font-semibold text-white px-4 py-2 rounded-lg"
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
      <p className='text-center'>Are you sure you want to delete this post?</p>
      <button
        onClick={handleDeletePost}
        className="bg-red-500 hover:bg-red-600 font-semibold text-white px-4 py-2 rounded-lg"
      >
        Delete
      </button>
    </div>
  )}
</Dialog>

{loading ? <></> : <>
<section className="mt-16 mb-4">
  <div className="flex flex-col min-h-dvh min-h-screen items-center px-2 sm:px-5 mx-auto gap-2">
    <div className='w-full max-w-3xl mt-4 sm:mt-0'>
      <ProfileInfo
        banner={""}
        photo={toImageSrc(value?.body.profile_photo_path!)}
        name={value?.body.name || ""}
        connections={getConnectionCount()}
        accessLevel={getAccessLevel()}
        user_id={Number(user_id)}
        onEditButtonClick={onEditButtonClick}
        onConnectButtonClick={onConnect}
        onDisconnectButtonClick={onDisconnect}
        onLogoutButtonClick={logout}
        onAcceptButtonClick={accept}
        onDenyButtonClick={deny}
      />
      <ProfileTile title='Work History'>{value?.body.work_history}</ProfileTile>
      <ProfileTile title='Skills'>{value?.body.skills}</ProfileTile>
{value?.body.connection === "public" ? <></> : 
      <ProfileTile title='Post'>
        <div className='flex flex-col gap-4'>
        {value?.body.relevant_posts.map((post) => (
        <ListTile
          key={post.id}
          title={value.body.name || ""}
          subtitle={new Date(post.updated_at).toLocaleString()}
          imageSrc={toImageSrc(value.body.profile_photo_path)}
          href={`/profile/${user_id}`}
          endChildren={
            getAccessLevel() !== "owner" ? <></> :
            <Dropdown
              options={[
                {
                  label: "Edit",
                  onClick: () => openEditDialog(post),
                },
                {
                  label: "Delete",
                  onClick: () => openDeleteDialog(post),
                },
              ]}
            />
          }
        >
          <div className="px-2 pb-2 text-sm">{post.content}</div>
        </ListTile>
      ))}
        </div>
      </ProfileTile>
}

    </div>
  </div>
</section>
</>
}
</>
  );
};

