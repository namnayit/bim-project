<script setup lang="ts">
import { useNuxtApp } from "#app";
import { useAsset } from "@/composables/useAsset";
import Compressor from "compressorjs";
import { ref } from "vue";

const nuxtApp = useNuxtApp();
const route = useRoute();
const {
  addAsset,
  isAddSlideOverOpen,
  updateAssetImageUrl,
  toggleAddSlideOver,
  fetchAssets,
  addOrUpdateAssetImage,
} = useAsset();

const name = ref("");
const quantity = ref(1);
const imageUrl = ref("");
const type = ref("material");
const siteId = route.params.id;

const uploading = ref(false);
const tempFile = ref(null);

const suggestions = ref([]);
const showSuggestions = ref(false);
const searchTimeout = ref(null);

watch(isAddSlideOverOpen, (isOpen) => {
  if (isOpen) {
    setTimeout(() => {
      document.activeElement?.blur();
    }, 100);
  } else {
    name.value = "";
    quantity.value = 1;
    imageUrl.value = "";
    tempFile.value = null;
    suggestions.value = [];
    showSuggestions.value = false;
  }
});

const searchAssetNames = async () => {
  const query = name.value.trim();

  if (query.length < 2) {
    suggestions.value = [];
    showSuggestions.value = false;
    return;
  }

  try {
    const response = await $fetch(
      `/api/assets/search?q=${encodeURIComponent(query)}`
    );
    suggestions.value = response.assets || [];
    showSuggestions.value = suggestions.value.length > 0;
  } catch (error) {
    console.error("Error fetching asset suggestions:", error);
    suggestions.value = [];
    showSuggestions.value = false;
  }
};

const handleNameInput = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  searchTimeout.value = setTimeout(() => {
    searchAssetNames();
  }, 300);
};

const selectSuggestion = (suggestion) => {
  name.value = suggestion;
  suggestions.value = [];
  showSuggestions.value = false;
};

const closeSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    uploading.value = true;
    tempFile.value = file; // Store the file temporarily
    new Compressor(file, {
      quality: 0.6,
      maxWidth: 1000,
      success: async (compressedFile) => {
        const objectUrl = URL.createObjectURL(compressedFile);
        imageUrl.value = objectUrl; // Display preview
        uploading.value = false;
      },
      error: (err) => {
        nuxtApp.$toastify(`Image compression failed: ${err.message}`, "error");
        uploading.value = false;
      },
    });
  }
};

const removeImage = () => {
  imageUrl.value = "";
  tempFile.value = null;
  nuxtApp.$toastify("Image removed.", "success");
};

const incrementQuantity = () => {
  quantity.value += 1;
};

const decrementQuantity = () => {
  if (quantity.value > 1) quantity.value -= 1;
};

// Save asset and then upload image if it exists
const saveAsset = async () => {
  const newAsset = {
    name: name.value,
    quantity: quantity.value,
    type: type.value,
    site_id: siteId,
  };

  const result = await addAsset(newAsset);

  if (result.success) {
    nuxtApp.$toastify("Asset added successfully!", "success");

    if (tempFile.value) {
      await addOrUpdateAssetImage(result.id, tempFile.value);
    }

    fetchAssets(siteId);
    toggleAddSlideOver();
  } else {
    nuxtApp.$toastify(result.error, "error");
  }
};
</script>

<template>
  <USlideover v-model="isAddSlideOverOpen">
    <UCard
      class="flex flex-col flex-1"
      :ui="{
        body: { base: 'flex-1' },
        ring: '',
        divide: 'divide-y divide-zinc-100 dark:divide-zinc-800',
      }"
    >
      <template #header>
        <h3 class="text-xl font-semibold">Add New Asset</h3>
      </template>

      <div class="space-y-4">
        <!-- Asset Name with Autocomplete -->
        <div class="relative">
          <label
            class="block text-lg font-medium text-zinc-700 dark:text-zinc-200"
            >Name</label
          >
          <input
            v-model="name"
            @input="handleNameInput"
            @focus="name.length >= 2 && searchAssetNames()"
            @blur="closeSuggestions"
            type="text"
            placeholder="Type to search existing assets..."
            class="mt-1 bg-zinc-100 border border-zinc-300 text-zinc-900 text-lg rounded-lg focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none block w-full p-3 dark:bg-zinc-800 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white"
          />

          <!-- Autocomplete Dropdown -->
          <div
            v-if="showSuggestions && suggestions.length > 0"
            class="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg shadow-lg max-h-48 overflow-y-auto"
          >
            <ul>
              <li
                v-for="(suggestion, index) in suggestions"
                :key="index"
                @mousedown="selectSuggestion(suggestion)"
                class="px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer text-zinc-900 dark:text-white capitalize"
              >
                {{ suggestion }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Quantity with increment and decrement buttons -->
        <div>
          <label
            class="block text-lg font-medium text-zinc-700 dark:text-zinc-200"
            >Quantity</label
          >
          <div class="flex items-center mt-1">
            <input
              v-model="quantity"
              type="number"
              min="1"
              class="bg-zinc-100 border border-zinc-300 text-zinc-900 text-lg rounded-lg focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none w-full p-3 dark:bg-zinc-800 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white"
            />
            <div class="ml-2 flex flex-col">
              <button
                @mousedown.prevent
                @click="incrementQuantity"
                class="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-t-md"
              >
                ▲
              </button>
              <button
                @mousedown.prevent
                @click="decrementQuantity"
                class="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-b-md"
              >
                ▼
              </button>
            </div>
          </div>
        </div>

        <!-- Image Upload Section -->
        <div class="space-y-2">
          <label
            class="block text-lg font-medium text-zinc-700 dark:text-zinc-200"
            >Asset Image</label
          >
          <div
            v-if="imageUrl"
            class="relative w-40 h-40 border rounded-lg overflow-hidden"
          >
            <img
              :src="imageUrl"
              alt="Asset Image"
              class="w-full h-full object-cover"
            />
            <button
              @click="removeImage"
              class="absolute top-1 right-1 text-white bg-red-500 rounded-full p-1 w-8"
            >
              &#x2715;
            </button>
          </div>
          <label
            v-else
            class="w-40 h-40 bg-gray-100 dark:bg-gray-700 flex items-center justify-center border rounded-lg cursor-pointer"
          >
            <input
              type="file"
              class="hidden"
              @change="handleImageUpload"
              accept="image/*"
            />
            <span v-if="uploading">Uploading...</span>
            <span v-else class="text-blue-500">Press to Upload</span>
          </label>
        </div>
      </div>

      <template #footer>
        <div class="flex space-x-4 w-full">
          <button
            @click="saveAsset"
            class="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Save
          </button>
          <button
            @click="toggleAddSlideOver"
            class="flex-1 bg-red-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-600"
          >
            Cancel
          </button>
        </div>
      </template>
    </UCard>
  </USlideover>
</template>
