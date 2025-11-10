<template>
    <section class="bg-zinc-100 dark:bg-zinc-900">
        <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <a href="#" class="flex items-center mb-6 text-2xl font-semibold text-zinc-900 dark:text-white">Site Manager</a>
            <div class="w-full bg-zinc-50 rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-zinc-800 dark:border-zinc-700">
                <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <h1 class="text-xl font-bold leading-tight tracking-tight text-zinc-900 md:text-2xl dark:text-white">Create a new account</h1>
                    <form class="space-y-4 md:space-y-6" @submit.prevent="signUpUser">
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
                        <div>
                            <label for="username" class="block mb-2 text-sm font-medium text-zinc-900 dark:text-white">Username</label>
                            <input
                                v-model="username"
                                type="text"
                                id="username"
                                class="bg-zinc-100 border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-zinc-700 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="Choose a username"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            class="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                        >
                            Sign up
                        </button>
                        <div v-if="errorMessage" class="text-red-500 text-sm mt-2">{{ errorMessage }}</div>
                    </form>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const supabase = useSupabaseClient();
const router = useRouter();

const email = ref("");
const password = ref("");
const username = ref("");
const errorMessage = ref("");

const signUpUser = async () => {
    // Step 1: Create a user in Supabase auth with email and password
    const { data, error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
    });

    if (error) {
        errorMessage.value = error.message;
    } else {
        // Step 2: Insert the additional user info into your custom 'users' table
        await supabase.from("users").insert({
            id: data.user.id, // The user's UUID from Supabase auth
            username: username.value, // Username from the form
            email: email.value, // Email from the form
            role: "user", // Default role is 'user'
        });

        // Step 3: Redirect the user to a dashboard or login page
        router.push("/dashboard");
    }
};
</script>
