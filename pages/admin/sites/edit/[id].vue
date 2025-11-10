<script setup lang="ts">
import BNav from "~/components/BNav.vue";
import { useRoute, useRouter } from "vue-router";
import { useSite } from "~/composables/useSite";

const route = useRoute();
const router = useRouter();
const { fetchSiteDetails, addAssetRow, removeAssetRow, updateSite, siteName, projectManager, siteManager, assets } = useSite();

definePageMeta({
    middleware: "check-admin", // Use 'check-admin' here
});

// Fetch the site details when the component is mounted
onMounted(() => {
    const siteId = route.params.id;
    fetchSiteDetails(siteId);
});

// Handle site update
const handleUpdateSite = async () => {
    const siteId = route.params.id;
    const success = await updateSite(siteId);

    if (success) {
        router.push("/admin/sites");
    }
};
</script>

<template>
    <BNav />
    <div class="px-3">
        <div class="mx-auto max-w-screen-xl py-6">
            <!-- Title and Update Site button in the same div -->
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-semibold">Edit Site</h2>
                <button @click="handleUpdateSite" class="text-white bg-blue-500 hover:bg-blue-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Update Site</button>
            </div>

            <form @submit.prevent="handleUpdateSite" class="space-y-6">
                <!-- Site name field -->
                <div>
                    <label for="siteName" class="block mb-2 text-sm font-medium text-zinc-900 dark:text-white">Site Name</label>
                    <input
                        v-model="siteName"
                        type="text"
                        id="siteName"
                        class="bg-zinc-100 border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-zinc-700 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        required
                    />
                </div>

                <!-- Project Manager field -->
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

                <!-- Site Manager field -->
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

                <!-- Assets section -->
                <h3 class="text-xl font-semibold mb-4">Assets (Materials & Equipment)</h3>

                <div v-for="(asset, index) in assets" :key="index" class="space-y-4">
                    <div class="grid grid-cols-12 gap-4">
                        <!-- Asset name -->
                        <div class="col-span-5">
                            <label class="block mb-2 text-sm font-medium text-zinc-900 dark:text-white">Asset Name</label>
                            <input
                                v-model="asset.name"
                                type="text"
                                class="bg-zinc-100 border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-zinc-700 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="Enter asset name"
                                required
                            />
                        </div>

                        <!-- Quantity -->
                        <div class="col-span-3">
                            <label class="block mb-2 text-sm font-medium text-zinc-900 dark:text-white">Quantity</label>
                            <input
                                v-model="asset.quantity"
                                type="number"
                                step="0.01"
                                class="bg-zinc-100 border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-zinc-700 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="Enter quantity"
                                required
                            />
                        </div>

                        <!-- Remove row button -->
                        <div class="col-span-1 flex items-end">
                            <button
                                type="button"
                                @click="removeAssetRow(index)"
                                class="text-white bg-red-500 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-pink-300 dark:focus:ring-pink-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-0.5"
                            >
                                &#x2715;
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Add asset row button -->
                <button type="button" @click="addAssetRow" class="mt-4 text-white bg-green-500 hover:bg-green-700 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Add Asset +</button>
            </form>
        </div>
    </div>
</template>
