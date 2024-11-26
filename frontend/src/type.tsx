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
    iat: number;
    exp: number;
}

export type ConnectionRequestsResponse = BaseResponse<{
    from: User,
    created_at: string,
    from_id: number,
    to_id: number,
}[]>

export type PostResponse = BaseResponse<{
    id: number,
    created_at: string,
    updated_at: string,
    content: string,
    user_id: number,
    user: User,
}[]>

export type UsersResponse = BaseResponse<User[]>