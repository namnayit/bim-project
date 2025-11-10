import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
    // Correct way to access runtime config in Nitro server routes
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = useRuntimeConfig(event)
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Server configuration error',
            message: 'Missing Supabase configuration'
        })
    }

    const body = await readBody(event)
    const { userId } = body

    const supabaseAdmin = createClient(
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY
    );

    try {
        // Step 1: Delete the user from the Supabase Auth table
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (authError) {
            return { statusCode: 400, body: { error: `Error deleting user from auth table: ${authError.message}` } };
        }

        // Step 2: Delete the user from the custom 'users' table
        const { error: dbError } = await supabaseAdmin.from("users").delete().eq("id", userId);
        if (dbError) {
            return { statusCode: 400, body: { error: `Error deleting user from custom users table: ${dbError.message}` } };
        }

        // Step 3: Return success response
        return { statusCode: 200, body: { success: true } };
    } catch (error) {
        return { statusCode: 500, body: { error: `Unexpected error: ${error.message}` } };
    }
});
