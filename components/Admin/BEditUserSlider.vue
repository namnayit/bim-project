<script setup lang="ts">
import { ref, watch } from "vue";
import { useAdminUser } from "@/composables/useAdminUser";

// Access composable to handle editing
const { selectedUser, isEditUserOpen, toggleEditUser, editUser } = useAdminUser();

// Form data for editing a user
const username = ref("");
const email = ref("");
const role = ref("user");
const password = ref(""); // Optional password change

// State for error handling
const errorMessage = ref("");

// Watch `selectedUser` to pre-fill the form when the user is selected
watch(selectedUser, (user) => {
    if (user) {
        username.value = user.username;
        email.value = user.email;
        role.value = user.role;
    }
});

// Function to handle user update
const saveChanges = async () => {
  const updatedUser: {
    username: string;
    email: string;
    role: string;
    password?: string;
  } = {
    username: username.value,
    email: email.value,
    role: role.value,
  };

  if (password.value.trim() !== "") {
    if (password.value.length < 6) {
        alert("❌ Password must be at least 6 characters.");
      return;
    }

    updatedUser.password = password.value;
  }

  const success = await editUser(selectedUser.value.id, updatedUser);

  if (!success) {
    errorMessage.value = "Error updating user. Please try again.";
  } else {
    alert("✅ User updated successfully!");
    password.value = "";
  }
};
</script>

<template>
    <USlideover v-model="isEditUserOpen">
        <UCard class="flex flex-col flex-1" :ui="{ body: { base: 'flex-1' }, ring: '', divide: 'divide-y divide-zinc-100 dark:divide-zinc-800' }">
            <!-- Slide-Over Header -->
            <template #header>
                <UButton color="gray" variant="ghost" size="sm" icon="i-heroicons-x-mark-20-solid" class="flex sm:hidden absolute end-5 top-5 z-10" square padded @click="toggleEditUser(null)" />
                <h3 class="text-xl font-semibold">Edit User</h3>
            </template>

            <!-- Form for Editing User -->
            <div class="p-6 space-y-4">
                <div>
                    <label for="username" class="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Username</label>
                    <input
                        v-model="username"
                        id="username"
                        type="text"
                        class="mt-1 bg-zinc-100 border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-zinc-700 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Enter username"
                    />
                </div>

                <div>
                    <label for="email" class="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Email</label>
                    <input
                        v-model="email"
                        id="email"
                        type="email"
                        class="mt-1 bg-zinc-100 border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-zinc-700 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Enter email"
                    />
                </div>

                <div>
                    <label for="role" class="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Role</label>
                    <select
                        v-model="role"
                        id="role"
                        class="mt-1 bg-zinc-100 border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-zinc-700 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <!-- Optional password change -->
                <div>
                    <label for="password" class="block text-sm font-medium text-zinc-700 dark:text-zinc-200">Password (Optional)</label>
                    <input
                        v-model="password"
                        id="password"
                        type="password"
                        class="mt-1 bg-zinc-100 border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-zinc-700 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Enter new password (optional)"
                    />
                </div>

                <!-- Display Error Message if there's an error -->
                <div v-if="errorMessage" class="text-red-500 text-sm mt-2">{{ errorMessage }}</div>
            </div>

            <!-- Slide-Over Footer -->
            <template #footer>
                <div class="p-6">
                    <button @click="saveChanges" type="button" class="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none">Save Changes</button>
                </div>
            </template>
        </UCard>
    </USlideover>
</template>
