import { Result, RPC_ERROR_BY_CODE } from "@/types/do/response";
import { PostgrestError } from "@supabase/supabase-js";

function mapRpcErrorToRepoError(error: PostgrestError): Error | null {
    const def = RPC_ERROR_BY_CODE[error.code];
    if (!def) {
        return null;
    }
    const err = new Error(def.message);
    err.name = def.name;
    return err;
}

export function handleRpcResult<T>(result: { data: T; error: PostgrestError | null; }): Result<T> {
    if (result.error) {
        const err = mapRpcErrorToRepoError(result.error);
        if (err) {
            return { data: null, error: err };
        }
        return { data: null, error: result.error };
    }
    return { data: result.data, error: null };
}
