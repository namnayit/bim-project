<script setup lang="ts">
import { useRouter } from "vue-router";
import BNav from "~/components/BNav.vue";
import BSitesTable from "~/components/Admin/BSitesTable.vue"; // A table to list all sites

const router = useRouter();
const nuxtApp = useNuxtApp();
const toastMessage = useState("toastMessage"); // Global toast message state

definePageMeta({
    middleware: "check-admin", // Use 'check-admin' here
});

// Watch for route changes and trigger the toast after each navigation
onBeforeMount(() => {
    // Check if there's a message immediately after the component is about to mount
    if (toastMessage.value) {
        nuxtApp.$toastify(toastMessage.value, "success");
        toastMessage.value = null; // Clear the toast message after showing it
    }
});

router.afterEach(() => {
    // Ensure the toast is shown after every route transition
    if (toastMessage.value) {
        nuxtApp.$toastify(toastMessage.value, "success");
        toastMessage.value = null; // Clear the toast message after showing it
    }
});
</script>

<template>
    <BNav />
    <div class="px-3">
        <div class="flex items-center justify-between mx-auto max-w-screen-xl pt-4">
            <h2 class="text-2xl font-semibold">Sites</h2>
            <NuxtLink
                to="/admin/sites/create"
                type="button"
                class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            >
                Create Site
            </NuxtLink>
        </div>

        <!-- Display list of sites -->
        <BSitesTable />
    </div>
</template>
