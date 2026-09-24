import { Tables, TablesInsert } from "@/types/database";
import { AnonymousTrialGrant } from "@/types/do/anonymous-trial-grant";
import { Result } from "@/types/do/response";
import { SupabaseClient } from "@supabase/supabase-js";

function mapAnonymousTrialGrantRow(row: Tables<"anonymous_trial_grants">): AnonymousTrialGrant {
    return {
        id: row.id,
        ipHash: row.ip_hash,
        grantDate: row.grant_date,
        userId: row.user_id,
    };
}

export class AnonymousTrialGrantsRepository {
    constructor(private supabase: SupabaseClient) {
    }

    async findByIpHashAndGrantDate(ipHash: string, grantDate: string): Promise<Result<AnonymousTrialGrant>> {
        const { data, error } = await this.supabase
            .from("anonymous_trial_grants")
            .select("*")
            .eq("ip_hash", ipHash)
            .eq("grant_date", grantDate)
            .maybeSingle();
        if (error) {
            return { data: null, error };
        }
        if (!data) {
            return { data: null, error: null };
        }
        return { data: mapAnonymousTrialGrantRow(data), error: null };
    }
}
