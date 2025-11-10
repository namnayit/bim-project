<script setup lang="ts">
import { ref } from "vue";
import { useAdminUser } from "@/composables/useAdminUser";

const { toggleCreateUser, isCreateUserOpen, fetchUsers } = useAdminUser();

// Form data
const username = ref("");
const email = ref("");
const password = ref("");
const role = ref("user");

// State for error handling
const errorMessage = ref("");

// Supabase client
const supabase = useSupabaseClient();

const sanitizeAscii = (value: string) =>
  value
    .replace(/[“”‘’]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[…]/g, "...")
    .replace(/[^\x00-\x7F]/g, "")
    .trim();

const createUser = async () => {
    try {
        const cleanUsername = sanitizeAscii(username.value);
        const cleanEmail = sanitizeAscii(email.value);
        const cleanPassword = sanitizeAscii(password.value);
        const cleanRole = sanitizeAscii(role.value);

        console.log(cleanUsername, cleanEmail, cleanPassword, cleanRole);

        const response = await $fetch("/api/createUser", {
            method: "POST",
            body: {
                email: cleanEmail,
                password: cleanPassword,
                username: cleanUsername,
                role: cleanRole,
            },
        });

        console.log(response);

        if (response.error) {
            errorMessage.value = `Error creating user: ${response.error}`;
            return;
        }

        fetchUsers();
        toggleCreateUser();
        username.value = "";
        email.value = "";
        password.value = "";
        role.value = "user";
        errorMessage.value = "";
    } catch (error) {
        console.error("Unexpected error", error);
        errorMessage.value = "An unexpected error occurred. Please try again.";
    }
};

</script>

<template>
    <!-- Bind v-model to isCreateUserOpen -->
    <USlideover v-model="isCreateUserOpen">
        <UCard class="flex flex-col flex-1" :ui="{ body: { base: 'flex-1' }, ring: '', divide: 'divide-y divide-zinc-100 dark:divide-zinc-800' }">
            <!-- Slide-Over Header -->
            <template #header>
                <UButton color="gray" variant="ghost" size="sm" icon="i-heroicons-x-mark-20-solid" class="flex sm:hidden absolute end-5 top-5 z-10" square padded @click="toggleCreateUser" />
                <h3 class="text-xl font-semibold">Create New User</h3>
            </template>

            <!-- Form for Creating a New User -->
            <div class="p-6 space-y-4">
                <div>
                    <label for="username" class="block text-sm font-medium">Username</label>
                    <input
                        v-model="username"
                        id="username"
                        type="text"
                        class="mt-1 bg-zinc-100 border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-zinc-700 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Enter username"
                    />
                </div>

                <div>
                    <label for="email" class="block text-sm font-medium">Email</label>
                    <input
                        v-model="email"
                        id="email"
                        type="email"
                        class="mt-1 bg-zinc-100 border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-zinc-700 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Enter email"
                    />
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium">Password</label>
                    <input
                        v-model="password"
                        id="password"
                        type="password"
                        class="mt-1 bg-zinc-100 border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-zinc-700 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Enter password"
                    />
                </div>

                <div>
                    <label for="role" class="block text-sm font-medium">Role</label>
                    <select
                        v-model="role"
                        id="role"
                        class="mt-1 bg-zinc-100 border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-zinc-700 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <!-- Display Error Message if there's an error -->
                <div v-if="errorMessage" class="text-red-500 text-sm mt-2">{{ errorMessage }}</div>
            </div>

            <!-- Slide-Over Footer -->
            <template #footer>
                <div class="p-6">
                    <button @click="createUser" type="button" class="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none">Create User</button>
                </div>
            </template>
        </UCard>
    </USlideover>
</template>
