<script setup lang="ts">
import { ref, watch } from "vue";
import { useNuxtApp } from "#app";
import { useAsset } from "@/composables/useAsset";
import Compressor from "compressorjs";
const route = useRoute();

const nuxtApp = useNuxtApp();
const { editAsset, selectedAsset, toggleEditSlideOver, isEditSlideOverOpen, fetchAssets, addOrUpdateAssetImage, deleteAssetImage } = useAsset();

const name = ref(selectedAsset.value?.name || "");
const quantity = ref(selectedAsset.value?.quantity || 1);
const imageUrl = ref(selectedAsset.value?.image_url || "");
const uploading = ref(false);
const siteId = route.params.id;

watch(selectedAsset, (newAsset) => {
    if (newAsset) {
        name.value = newAsset.name;
        quantity.value = newAsset.quantity;
        imageUrl.value = newAsset.image_url || "";
    }
});

// Watch the slider's open state and prevent focus on inputs when opened
watch(isEditSlideOverOpen, (isOpen) => {
    if (isOpen) {
        setTimeout(() => {
            document.activeElement?.blur(); // Remove focus from any inputs
        }, 100);
    }
});

const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        uploading.value = true;
        new Compressor(file, {
            quality: 0.6,
            maxWidth: 1000,
            success: async (compressedFile) => {
                const success = await addOrUpdateAssetImage(selectedAsset.value.id, compressedFile);
                if (success) {
                    imageUrl.value = selectedAsset.value.image_url;
                    fetchAssets(siteId);
                    nuxtApp.$toastify("Image uploaded successfully!", "success");
                } else {
                    nuxtApp.$toastify("Failed to upload image.", "error");
                }
                uploading.value = false;
            },
            error: (err) => {
                nuxtApp.$toastify(`Image compression failed: ${err.message}`, "error");
                uploading.value = false;
            },
        });
    }
};

const removeImage = async () => {
    const success = await deleteAssetImage(selectedAsset.value.id);
    if (success) {
        imageUrl.value = "";
        nuxtApp.$toastify("Image removed successfully!", "success");
    } else {
        nuxtApp.$toastify("Failed to remove image.", "error");
    }
};

const incrementQuantity = () => {
    quantity.value += 1;
};

const decrementQuantity = () => {
    if (quantity.value > 1) quantity.value -= 1;
};

const saveChanges = async () => {
    const updatedAsset = { id: selectedAsset.value.id, name: name.value, quantity: quantity.value, image_url: imageUrl.value };
    const success = await editAsset(updatedAsset);
    if (success) {
        nuxtApp.$toastify("Asset updated successfully!", "success");
        fetchAssets(selectedAsset.value.site_id);
        toggleEditSlideOver();
    } else {
        nuxtApp.$toastify("Failed to update asset.", "error");
    }
};
</script>

<template>
    <USlideover v-model="isEditSlideOverOpen">
        <UCard class="flex flex-col flex-1" :ui="{ body: { base: 'flex-1' }, ring: '', divide: 'divide-y divide-zinc-100 dark:divide-zinc-800' }">
            <template #header>
                <h3 class="text-xl font-semibold">Edit Asset</h3>
            </template>

            <div class="space-y-4">
                <!-- Asset Name -->
                <div>
                    <label class="block text-lg font-medium text-zinc-700 dark:text-zinc-200">Name</label>
                    <input
                        v-model="name"
                        type="text"
                        class="mt-1 bg-zinc-100 border border-zinc-300 text-zinc-900 text-lg rounded-lg focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none block w-full p-3 dark:bg-zinc-800 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white"
                    />
                </div>

                <!-- Quantity with increment and decrement buttons -->
                <div>
                    <label class="block text-lg font-medium text-zinc-700 dark:text-zinc-200">Quantity</label>
                    <div class="flex items-center mt-1">
                        <input
                            v-model="quantity"
                            type="number"
                            min="1"
                            class="bg-zinc-100 border border-zinc-300 text-zinc-900 text-lg rounded-lg focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none w-full p-3 dark:bg-zinc-800 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white"
                        />
                        <div class="ml-2 flex flex-col">
                            <button @mousedown.prevent @click="incrementQuantity" class="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-t-md">▲</button>
                            <button @mousedown.prevent @click="decrementQuantity" class="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-b-md">▼</button>
                        </div>
                    </div>
                </div>

                <!-- Image Upload Section -->
                <div class="space-y-2">
                    <label class="block text-lg font-medium text-zinc-700 dark:text-zinc-200">Asset Image</label>
                    <div v-if="imageUrl" class="relative w-40 h-40 border rounded-lg overflow-hidden">
                        <img :src="imageUrl" alt="Asset Image" class="w-full h-full object-cover" />
                        <button @click="removeImage" class="absolute top-1 right-1 text-white bg-red-500 rounded-full p-1 w-8">&#x2715;</button>
                    </div>
                    <label v-else class="w-40 h-40 bg-gray-100 dark:bg-gray-700 flex items-center justify-center border rounded-lg cursor-pointer">
                        <input type="file" class="hidden" @change="handleImageUpload" accept="image/*" />
                        <span v-if="uploading">Uploading...</span>
                        <span v-else class="text-blue-500">Click to Upload</span>
                    </label>
                </div>
            </div>

            <template #footer>
                <div class="flex space-x-4 w-full">
                    <button @click="saveChanges" class="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700">Save Changes</button>
                    <button @click="toggleEditSlideOver" class="flex-1 bg-red-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-600">Cancel</button>
                </div>
            </template>
        </UCard>
    </USlideover>
</template>
