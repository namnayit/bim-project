<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUser } from "@/composables/useUser";

const { userRole } = useUser();

const supabase = useSupabaseClient();
const router = useRouter();

const email = ref("");
const password = ref("");
const errorMessage = ref("");

const signInUser = async () => {
    // Step 1: Sign in the user with email and password
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
    });

    if (error) {
        errorMessage.value = error.message;
    } else {
        // Step 2: Once signed in, get the user's role from the custom `users` table
        const user = data.user; // Supabase returns the user object
        const { data: userData, error: userError } = await supabase.from("users").select("role").eq("id", user.id).single(); // Since it's only one user, use `single`

        if (userError) {
            errorMessage.value = userError.message;
        } else {
            // Step 3: Redirect based on the user's role
            userRole.value = userData.role;
            if (userRole.value === "admin") {
                router.push("/admin/users"); // Redirect to the admin page if the user is an admin
            } else {
                router.push("/"); // Redirect to the homepage if the user is a regular user
            }
        }
    }
};
</script>

<template>
    <section class="bg-zinc-100 dark:bg-zinc-900">
        <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <a href="#" class="flex items-center mb-6 text-2xl font-semibold text-zinc-900 dark:text-white"> Site Manager </a>
            <div class="w-full bg-zinc-50 rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-zinc-800 dark:border-zinc-700">
                <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <h1 class="text-xl font-bold leading-tight tracking-tight text-zinc-900 md:text-2xl dark:text-white">Sign in to your account</h1>
                    <form class="space-y-4 md:space-y-6" @submit.prevent="signInUser">
                        <div>
                            <label for="email" class="block mb-2 text-sm font-medium text-zinc-900 dark:text-white">Your email</label>
                            <input
                                v-model="email"
                                type="email"
                                id="email"
                                class="bg-zinc-100 border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-zinc-700 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="name@company.com"
                                required
                            />
                        </div>
                        <div>
                            <label for="password" class="block mb-2 text-sm font-medium text-zinc-900 dark:text-white">Password</label>
                            <input
                                v-model="password"
                                type="password"
                                id="password"
                                placeholder="••••••••"
                                class="bg-zinc-100 border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-zinc-700 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                        >
                            Sign in
                        </button>
                        <div v-if="errorMessage" class="text-red-500 text-sm mt-2">{{ errorMessage }}</div>
                    </form>
                </div>
            </div>
            <div class="h-[120px]"></div>
        </div>
    </section>
</template>
