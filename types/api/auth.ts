import { SignUpSuccessData, SignInSuccessData } from "@/lib/services/auth/auth-types";
import { ApiResponse } from "./common";


export type SignUpResponse = ApiResponse<SignUpSuccessData>;

export type SignInResponse = ApiResponse<SignInSuccessData>;

export type SignOutResponse = ApiResponse<void>;
