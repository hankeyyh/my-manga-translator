import { UserTransaction } from "../do/user-transaction";


export type ListUserTransactionsPage = {
    items: UserTransaction[];
    nextCursor: string | null;
};
