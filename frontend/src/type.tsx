export type BaseResponse<T> = {
    success: boolean,
    message: string,
    body: T
}

export type AuthResponse = BaseResponse<{
    username: string, 
    email: string, 
    name: string,
    iat: number,
    exp: number,
}>
