<script setup lang="ts">
import { useAdminUser } from "~/composables/useAdminUser";
import BEditUserSlider from "~/components/Admin/BEditUserSlider.vue";

// Use composable to get users and manage editing and deletion
const { users, errorMessage, fetchUsers, usersLoading, toggleEditUser, deleteUser } = useAdminUser();

// Automatically fetch users when the component using this composable is mounted
onMounted(fetchUsers);

// Function to confirm and delete a user
const handleDeleteUser = async (userId) => {
    if (confirm("Are you sure you want to delete this user?")) {
        const success = await deleteUser(userId);
        if (success) {
            alert("User deleted successfully.");
        } else {
            alert("Error deleting user.");
        }
    }
};
</script>

<template>
    <div class="relative overflow-x-auto border dark:border-zinc-500 rounded-lg mx-auto max-w-screen-xl mt-4">
        <div class="overflow-hidden rounded-lg">
            <table class="w-full text-sm text-left rtl:text-right text-zinc-500 dark:text-zinc-400">
                <thead class="text-xs text-zinc-700 uppercase bg-zinc-100 dark:bg-zinc-700 dark:text-zinc-400">
                    <tr>
                        <th scope="col" class="px-6 py-3">Username</th>
                        <th scope="col" class="px-6 py-3">Email</th>
                        <th scope="col" class="px-6 py-3">Role</th>
                        <th scope="col" class="px-6 py-3"><span class="sr-only">Edit</span></th>
                        <th scope="col" class="px-6 py-3"><span class="sr-only">Delete</span></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in users" :key="user.id" class="bg-zinc-50 border-b dark:bg-zinc-800 dark:border-zinc-700">
                        <th scope="row" class="px-6 py-4 font-medium text-zinc-900 whitespace-nowrap dark:text-white">{{ user.username }}</th>
                        <td class="px-6 py-4">{{ user.email }}</td>
                        <td class="px-6 py-4">{{ user.role }}</td>
                        <td class="px-6 py-4 text-right">
                            <a href="#" @click.prevent="toggleEditUser(user)" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</a>
                        </td>
                        <td class="px-6 py-4 text-right">
                            <a href="#" @click.prevent="handleDeleteUser(user.id)" class="font-medium text-red-600 dark:text-red-500 hover:underline">Delete</a>
                        </td>
                    </tr>
                    <tr v-if="users.length === 0">
                        <td colspan="5" class="text-center py-4 text-zinc-500 dark:text-zinc-400">No users found</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <!-- Error message -->
        <div v-if="errorMessage" class="text-red-500 text-sm mt-4">{{ errorMessage }}</div>
    </div>

    <!-- Edit User Slide-Over -->
    <BEditUserSlider />
</template>
