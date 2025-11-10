<script setup lang="ts">
import BNav from "~/components/BNav.vue";
import BUsersTable from "~/components/Admin/BUsersTable.vue";
import BCreateUserSlider from "~/components/Admin/BCreateUserSlider.vue";
import { ref } from "vue";
import { useAdminUser } from "@/composables/useAdminUser";

const { toggleCreateUser, isCreateUserOpen } = useAdminUser();

definePageMeta({
    middleware: "check-admin", // Use 'check-admin' here
});

// Control slide-over visibility from the parent
</script>

<template>
    <BNav />

    <div class="px-3">
        <div class="flex items-center justify-between mx-auto max-w-screen-xl pt-8">
            <h2 class="text-2xl font-semibold">Users</h2>
            <button
                @click="toggleCreateUser"
                type="button"
                class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
                Create User
            </button>
        </div>

        <BUsersTable />

        <!-- Create User Slideover Component -->
        <BCreateUserSlider />
    </div>
</template>
