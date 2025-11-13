import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const searchQuery = query.q?.toString().toLowerCase() || "";
    const siteId = query.siteId?.toString() || "";

    if (!searchQuery || searchQuery.length < 2 || !siteId) {
        return { assets: [] };
    }

    try {
        const supabase = await serverSupabaseClient(event);

        const { data, error } = await supabase
            .from("assets")
            .select("name")
            .eq("site_id", siteId)
            .ilike("name", `%${searchQuery}%`)
            .limit(10);

        if (error) {
            throw error;
        }

        const uniqueNames = [...new Set(data.map(asset => asset.name))];

        return { assets: uniqueNames };
    } catch (error) {
        console.error("Error fetching asset names:", error);
        return { assets: [], error: error.message };
    }
});
