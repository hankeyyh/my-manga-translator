import { UserCredit } from "../do/user-credit";
import { UserBasicInfo } from "./user-basic-info";

export interface UserInfo {
    credit?: UserCredit | null;
    user?: UserBasicInfo;
}
