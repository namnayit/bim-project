<script setup lang="ts">
import BNav from "~/components/BNav.vue";
import { ref } from "vue";
import { useRouter } from "vue-router";

const supabase = useSupabaseClient();
const siteName = ref("");
const projectManager = ref("");
const siteManager = ref("");

const router = useRouter();

definePageMeta({
    middleware: "check-admin", // Use 'check-admin' here
});

// Function to handle form submission
const createSite = async () => {
    // Example logic for creating a site (you'd replace this with your actual API call)
    try {
        await supabase.from("sites").insert([
            {
                name: siteName.value,
                project_manager: projectManager.value || null, // Optional field
                site_manager: siteManager.value || null, // Optional field
            },
        ]);

        // Navigate back to sites page after creation
        router.push(`/admin/sites/`);
    } catch (error) {
        console.error("Error creating site:", error);
    }
};
</script>

<template>
    <BNav />

    <div class="px-3">
        <div class="mx-auto max-w-screen-xl px-4 py-6">
            <h2 class="text-2xl font-semibold mb-4">Create Site</h2>

            <form @submit.prevent="createSite" class="space-y-6">
                <div>
                    <label for="siteName" class="block mb-2 text-sm font-medium text-zinc-900 dark:text-white">Site Name</label>
                    <input
                        v-model="siteName"
                        type="text"
                        id="siteName"
                        class="bg-zinc-100 border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-zinc-700 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Enter site name"
                        required
                    />
                </div>

                <!-- Project Manager Input -->
                <div>
                    <label for="projectManager" class="block mb-2 text-sm font-medium text-zinc-900 dark:text-white"> Project Manager <span class="text-sm text-zinc-500">(optional)</span> </label>
                    <input
                        v-model="projectManager"
                        type="text"
                        id="projectManager"
                        class="bg-zinc-100 border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-zinc-700 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Enter project manager name"
                    />
                </div>

                <!-- Site Manager Input -->
                <div>
                    <label for="siteManager" class="block mb-2 text-sm font-medium text-zinc-900 dark:text-white"> Site Manager <span class="text-sm text-zinc-500">(optional)</span> </label>
                    <input
                        v-model="siteManager"
                        type="text"
                        id="siteManager"
                        class="bg-zinc-100 border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-zinc-700 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Enter site manager name"
                    />
                </div>

                <button
                    type="submit"
                    class="text-white bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                    Create Site
                </button>
            </form>
        </div>
    </div>
</template>
