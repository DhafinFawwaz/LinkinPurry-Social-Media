export type BaseResponse<T> = {
    success: boolean,
    message: string,
    body: T
}

export type AuthResponse = BaseResponse<User>

export type User = {
    username: string;
    work_history: string | null;
    skills: string | null;
    id: bigint;
    created_at: string; // unfortunately, this is a string
    updated_at: string; // unfortunately, this is a string
    email: string;
    // password_hash: string; 
    full_name: string | null;
    profile_photo_path: string;
    // iat: number;
    // exp: number;
}

export type ConnectionRequestsResponse = BaseResponse<User[]>

export type Post = {
    id: number,
    created_at: string,
    updated_at: string,
    content: string,
    user_id: number,
    user: User,
}

export type PostResponse = BaseResponse<Post[]>

export type UsersResponse = BaseResponse<User[]>


export type ProfileResponse = BaseResponse<Profile>

export type AccessLevel = "public" | "owner" | "not_connected" | "connection_requested" | "connection_received" | "connected";

export type Profile = User & {
    name: string,
    connection: AccessLevel,
    relevant_posts: Post[],
}
