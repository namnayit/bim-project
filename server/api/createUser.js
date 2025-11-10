import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    // console.log("Received body:", JSON.stringify(body));
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = useRuntimeConfig(event)

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Server configuration error',
            message: 'Missing Supabase configuration'
        })
    }
    const sanitize = (value) => {
        if (typeof value !== "string") return value;
        let cleaned = value
            .replace(/[“”‘’]/g, '"')
            .replace(/[–—]/g, "-")
            .replace(/[…]/g, "...")
            .trim();
        return Buffer.from(cleaned, "utf8")
            .toString("ascii")
            .replace(/[^\x00-\x7F]/g, "");
    };

    const email = sanitize(body.email);
    const password = sanitize(body.password);
    const username = sanitize(body.username);
    const role = sanitize(body.role);

    // const supabaseAdmin = createClient(
    //     process.env.SUPABASE_URL,
    //     process.env.SUPABASE_SERVICE_ROLE_KEY
    // );
    const supabaseAdmin = createClient(
        SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
    });

    if (authError) {
        return { statusCode: 400, body: { error: authError.message } };
    }

    const userId = data.user.id;
    const { error: dbError } = await supabaseAdmin.from("users").insert({
        id: userId,
        username,
        email,
        role,
    });

    if (dbError) {
        return { statusCode: 400, body: { error: dbError.message } };
    }

    return { statusCode: 200, body: { success: true } };
});
