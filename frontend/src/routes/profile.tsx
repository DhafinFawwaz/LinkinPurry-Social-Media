import ProfileInfo from '../components/profile/ProfileInfo';
import ProfileCards from '../components/profile/ProfileCards';
import Dialog from '../components/popup';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import FormInput from '../components/form-input';
import { AuthResponse, ProfileResponse, User } from '../type';
import FormTextarea from '../components/form-textarea';
import { useState } from 'react';
import toImageSrc from '../utils/image';
import EditIcon from '../assets/images/edit-icon.svg';
import useFetchApi, { fetchApi } from '../hooks/useFetchApi';
import ProfileTile from '../components/profile/profile-tile';
import ListTile from '../components/list-tile';
import { useParams } from 'react-router-dom';
import { AccessLevel } from '../type';

export const EditProfileSchema = z.object({
  username: z.string().min(1, "Username is required"),
  name: z.string().optional(),
  work_history: z.string().optional(),
  skills: z.string().optional(),
});
export type EditProfileSchema = z.infer<typeof EditProfileSchema>;



export default function Profile() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError, reset} = useForm<EditProfileSchema>({mode: "all", resolver: zodResolver(EditProfileSchema)});

  const { user_id } = useParams();
  const { loading, value, recall } = useFetchApi<ProfileResponse>(`/api/profile/${user_id}`);
  
  const [file, setFile] = useState<File>();
  function handleImageChange(e: any) {
    setFile(e.target.files[0]);
  }

  async function onSubmit(data: EditProfileSchema) {
    console.log(data);
    console.log(file);
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("name", data.name || "");
    formData.append("work_history", data.work_history || "");
    formData.append("skills", data.skills || "");
    if (file) formData.append("profile_photo", file);

    const res = await fetchApi(`/api/profile/${user_id}`, {
      method: "PUT",
      body: formData,
    })
    if(!res.ok) {
      alert("Failed to update profile");
      return
    }

    recall();
    setIsDialogOpen(false);
    setFile(undefined);
  }
  function onEditButtonClick() {
    setIsDialogOpen(true);
  }

  function getAccessLevel(): AccessLevel {
    if(loading) return "public";
    if(!value) return "public";
    if(value.body.connection === "connected") return "connected";
    if(value.body.connection === "not_connected") return "not_connected";
    if(value.body.connection === "connection_requested") return "connection_requested";
    if(value.body.can_edit) return "owner";
    return "public";
  }

  async function onConnect() {
    const res = await fetchApi(`/api/profile/${user_id}/connect`, { method: "POST" })
    if(!res.ok) {
      alert("Failed to connect to user");
      return
    }

    recall();
  }

  async function onDisconnect() {
    const res = await fetchApi(`/api/profile/${user_id}/disconnect`, { method: "POST" })
    if(!res.ok) {
      alert("Failed to disconnect to user");
      return
    }

    recall();
  }


  return (<>
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
    <input onChange={handleImageChange} id='profile_photo_path' type="file" hidden />
    
    <div className='grid grid-cols-2 gap-4'>
      <FormInput register={register} error={errors.username} field={"username"} type={"text"} title={"Username"} defaultValue={value?.body.username}></FormInput>
      <FormInput register={register} error={errors.name} field={"name"} type={"text"} title={"Name"} defaultValue={value?.body.name || ""}></FormInput>
    </div>
    <FormTextarea register={register} error={errors.work_history} field={"work_history"} title={"Work History"} defaultValue={value?.body.work_history || ""}></FormTextarea>
    <FormTextarea register={register} error={errors.skills} field={"skills"} title={"Enter your work Skills"} defaultValue={value?.body.skills || ""}></FormTextarea>

    <button disabled={isSubmitting} className="disabled:cursor-not-allowed disabled:bg-slate-400 disabled:text-slate-200 rounded-lg bg-blue-600 hover:bg-blue-700 focus:ring-4 ring-blue-500 py-2 font-bold text-white w-full">Submit</button>
  </form>
</>
}

</Dialog>
{loading ? <></> : <>
<section className="mt-16 mb-4">
  <div className="flex flex-col min-h-dvh min-h-screen items-center px-2 sm:px-5 mx-auto gap-2">
    <div className='w-full max-w-md'>
      <ProfileInfo
        banner={""}
        photo={toImageSrc(value?.body.profile_photo_path!)}
        name={value?.body.name || ""}
        connections={20}
        accessLevel={getAccessLevel()}
        user_id={Number(user_id)}
        onEditButtonClick={onEditButtonClick}
        onConnectButtonClick={onConnect}
        onDisconnectButtonClick={onDisconnect}
      />
      <ProfileTile title='Work History'>{value?.body.work_history}</ProfileTile>
      <ProfileTile title='Skills'>{value?.body.skills}</ProfileTile>
      <ProfileTile title='Post'>
        <div className='flex flex-col gap-4'>
          {value?.body.relevant_posts.map(post =>
            <ListTile key={post.id}
              title={value.body.name || ""} 
              subtitle={"Write a post!"}
              imageSrc={toImageSrc(value.body.profile_photo_path)}
              href={`/profile/${user_id}`}
              >
            <div className="px-2 pb-2 text-sm">
              {post.content}
            </div>
            </ListTile>
          )}
        </div>
      </ProfileTile>
    </div>
  </div>
</section>
</>
}
</>
  );
};

