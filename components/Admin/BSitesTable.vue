<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
const supabase = useSupabaseClient();

// Reactive variables for sites data and error handling
const sites = ref([]);
const errorMessage = ref("");
const sitesLoading = ref(false);
const showModal = ref(false); // Modal visibility state
const siteToDelete = ref(null); // Store the site to be deleted
const router = useRouter();
const nuxtApp = useNuxtApp(); // Access the Nuxt app for toastify

// Fetch sites from Supabase when component is mounted
const fetchSites = async () => {
    sitesLoading.value = true;
    const { data, error } = await supabase.from("sites").select("*").eq("archive", false);

    if (error) {
        errorMessage.value = "Error fetching sites";
        console.error(error);
    } else {
        sites.value = data;
    }
    sitesLoading.value = false;
};

// Call fetchSites on mount
onMounted(fetchSites);

// Show the delete confirmation modal
const confirmDelete = (siteId) => {
    siteToDelete.value = siteId; // Store the site ID to be deleted
    showModal.value = true; // Show the modal
};

// Function to delete a site
const deleteSite = async () => {
    if (siteToDelete.value) {
        const { error } = await supabase.from("sites").delete().eq("id", siteToDelete.value);
        if (!error) {
            sites.value = sites.value.filter((site) => site.id !== siteToDelete.value);
            siteToDelete.value = null; // Clear the stored site ID
            showModal.value = false; // Hide the modal

            // Show success toast
            nuxtApp.$toastify("Site deleted successfully!", "success");
        } else {
            errorMessage.value = "Error deleting site.";
            console.error(error);

            // Show error toast
            nuxtApp.$toastify("Error deleting site: " + error.message, "error");
        }
    }
};

// Function to navigate to the edit site page
const editSite = (siteId) => {
    router.push(`/admin/sites/edit/${siteId}`);
};

// Close the modal
const closeModal = () => {
    siteToDelete.value = null; // Clear the stored site ID
    showModal.value = false; // Hide the modal
};
</script>

<template>
    <div class="relative overflow-x-auto border dark:border-zinc-500 rounded-lg mx-auto max-w-screen-xl mt-4">
        <div class="overflow-hidden rounded-lg">
            <table class="w-full text-sm text-left rtl:text-right text-zinc-500 dark:text-zinc-400">
                <thead class="text-xs text-zinc-700 uppercase bg-zinc-100 dark:bg-zinc-700 dark:text-zinc-400">
                    <tr>
                        <th scope="col" class="sm:px-6 px-2 py-3">Site Name</th>
                        <th scope="col" class="sm:px-6 hidden px-2 py-3">Archived</th>
                        <th scope="col" class="sm:px-6 px-2 py-3 justify-end flex">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="site in sites" :key="site.id" class="bg-zinc-50 border-b dark:bg-zinc-800 dark:border-zinc-700">
                        <th scope="row" class="sm:px-6 px-2 py-4 font-medium whitespace-nowrap capitalize text-zinc-900 dark:text-white dark:group-hover:text-yellow-400 group-hover:text-yellow-700">
                            {{ site.name }}
                        </th>
                        <td class="sm:px-6 px-2 py-4 hidden">{{ site.archive ? "Yes" : "No" }}</td>
                        <td class="sm:px-6 px-2 py-4">
                            <div class="flex justify-end space-x-4">
                                <!-- Edit Button -->
                                <nuxt-link :to="`/admin/sites/edit/${site.id}`" class="text-blue-600 dark:text-blue-500 hover:underline flex items-center space-x-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5M16 3.4a2.6 2.6 0 113.6 3.6L9.8 16.8a4 4 0 01-1.6 1L5 19l1.2-3.2a4 4 0 011-1.6l9.8-9.8z"
                                        />
                                    </svg>
                                </nuxt-link>

                                <!-- Delete Button -->
                                <button @click.prevent="confirmDelete(site.id)" class="text-red-600 dark:text-red-500 hover:underline flex items-center space-x-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M19 7L5 7M10 11V17M14 11V17M5 7L7 20a2 2 0 002 2h6a2 2 0 002-2L19 7M9 3h6a2 2 0 012 2v2H7V5a2 2 0 012-2z"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr v-if="sites.length === 0">
                        <td colspan="3" class="text-center py-4 text-zinc-500 dark:text-zinc-400">No sites found</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Error message -->
        <div v-if="errorMessage" class="text-red-500 text-sm mt-4">{{ errorMessage }}</div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showModal" id="deleteModal" tabindex="-1" aria-hidden="true" class="fixed top-0 right-0 left-0 z-50 w-full h-full bg-zinc-900 bg-opacity-50 flex justify-center items-center">
        <div class="relative p-4 w-full max-w-md h-auto">
            <div class="relative p-4 text-center bg-zinc-50 rounded-lg shadow dark:bg-zinc-800 sm:p-5">
                <button
                    @click="closeModal"
                    type="button"
                    class="text-zinc-400 absolute top-2.5 right-2.5 bg-transparent hover:bg-zinc-100 hover:text-zinc-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-zinc-600 dark:hover:text-white"
                >
                    <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path
                            fill-rule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clip-rule="evenodd"
                        ></path>
                    </svg>
                    <span class="sr-only">Close modal</span>
                </button>
                <svg class="text-zinc-400 dark:text-zinc-500 w-11 h-11 mb-3.5 mx-auto" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path
                        fill-rule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clip-rule="evenodd"
                    ></path>
                </svg>
                <p class="mb-4 text-zinc-500 dark:text-zinc-300">Are you sure you want to delete this site?</p>
                <div class="flex justify-center items-center space-x-4">
                    <button
                        @click="closeModal"
                        type="button"
                        class="py-2 px-3 text-sm font-medium text-zinc-500 bg-zinc-50 rounded-lg border border-zinc-200 hover:bg-zinc-50 dark:bg-zinc-700 dark:text-zinc-300 dark:border-zinc-500 dark:hover:text-white dark:hover:bg-zinc-600"
                    >
                        No, cancel
                    </button>
                    <button @click="deleteSite" type="submit" class="py-2 px-3 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600">
                        Yes, I'm sure
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
