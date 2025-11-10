import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = useRuntimeConfig(event)
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw createError({
          statusCode: 500,
          statusMessage: 'Server configuration error',
          message: 'Missing Supabase configuration'
      })
  }
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const { userId, email, username, role, password } = body;

  // const supabaseAdmin = createClient(
  //   config.SUPABASE_URL,
  //   config.SUPABASE_SERVICE_ROLE_KEY
  // );
  const supabaseAdmin = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY
  );

  const updatePayload = { email };

  if (password && password.trim() !== "") {
    updatePayload.password = password;
  }

//   console.log("Updating auth user with:", updatePayload);

  const { data: updatedUser, error: authError } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    updatePayload
  );

//   console.log("Supabase auth update response:", updatedUser, authError);

  if (authError) {
    return { statusCode: 400, body: { error: authError.message } };
  }

  const { error: dbError } = await supabaseAdmin
    .from("users")
    .update({ username, email, role })
    .eq("id", userId);

  if (dbError) {
    return { statusCode: 400, body: { error: dbError.message } };
  }

  return { statusCode: 200, body: { success: true } };
});
