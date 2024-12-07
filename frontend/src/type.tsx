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

export type ConnectionInviteResponse = BaseResponse<{
    requests: {
        created_at: string,
        from: User
    }[],
    pending: {
        created_at: string,
        to: User
    }[]
}>

export type ConnectionRequestsResponse = BaseResponse<{
    created_at: string,
    from: User
}[]>


export type UserPrimitive = {
    id: number,
    full_name: string,
    profile_photo_path: string
}

export type Post = {
    id: number,
    created_at: string,
    updated_at: string,
    content: string,
    user_id: number,
    user: UserPrimitive,
}

export type FeedResponse = BaseResponse<{
    cursor: number | null,
    feeds: Post[]
}>

export type UsersResponse = BaseResponse<User[]>


export type ProfileResponse = BaseResponse<Profile>

export type AccessLevel = "public" | "owner" | "not_connected" | "connection_requested" | "connection_received" | "connected";

export type Profile = User & {
    name: string,
    connection: AccessLevel,
    relevant_posts: Post[],
    connection_count: number,
}

export type ChatMessage = {
    id: number,
    timestamp: string,
    from_id: number,
    to_id: number,
    message: string,
}

export type ChatResponse = BaseResponse<{
    chats: ChatMessage[],
    room: string,
}>
export type ChatErrorResponse = BaseResponse<null>



export type LatestChat = {
    id: number,
    timestamp: string,
    message: string,
    other_user_id: number,
    user_id: number,
    full_name: string,
    profile_photo_path: string,
}
export type LatestChatResponse = BaseResponse<LatestChat[]>


export type RecommendationResponse = BaseResponse<{
    users2nd: (UserPrimitive & {created_at: string, c1_id: bigint, c1_full_name: string})[],
    users3rd: (UserPrimitive & {created_at: string, c1_id: bigint, c1_full_name: string, c2_id: bigint, c2_full_name: string})[]
}>