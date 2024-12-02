import { Link } from "react-router-dom";
import useFetchApi, { fetchApi } from "../../hooks/useFetchApi";
import { UsersResponse } from "../../type";
import toImageSrc from "../../utils/image";
import { useEffect } from "react";

export default function NewChat() {
	const { loading, value, error, recall } = useFetchApi<UsersResponse>("/api/chats/never-chatted");

    return (<>
{loading ? <>

</> : 
<>
<div className="h-96 overflow-y-scroll pt-3">
    <div className="rounded-lg w-full max-w-md right-80 top-32 z-10">
        <ul className="rounded-xl overflow-hidden border">
            {value?.body!.map((user) => (
            <Link to={`/chat/${user.id}`}
                key={user.id}
                className="p-4 h-20 flex items-center cursor-pointer hover:bg-gray-100 bg-white text-black"
            >
                <img
                src={toImageSrc(user.profile_photo_path)}
                alt={user.full_name || ""}
                className="w-8 h-8 rounded-full mr-4"
                />
                <span className="font-medium">{user.full_name}</span>
            </Link>
            ))}
        </ul>
    </div>
</div>
</>}    
</>)
    
    
}