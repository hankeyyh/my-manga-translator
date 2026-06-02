import { ApiResponse } from "./response";
import { UserDTO } from "../dto/user";

export interface SignUpSuccessData {
    user: UserDTO | null;
}
export interface SignInSuccessData {
    user: UserDTO | null;
}

export type SignUpResponse = ApiResponse<SignUpSuccessData>;

export type SignInResponse = ApiResponse<SignInSuccessData>;

export type SignOutResponse = ApiResponse<void>;
