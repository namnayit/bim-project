<script setup lang="ts">
import { ref, watch } from "vue";
import { useNuxtApp } from "#app";
import { useSitePhoto } from "@/composables/useSitePhoto";
import Compressor from "compressorjs";

const route = useRoute();
const nuxtApp = useNuxtApp();

const { addPhoto, isAddPhotoSlideOverOpen, toggleAddPhotoSlideOver, fetchPhotos } = useSitePhoto();

const description = ref("");
const imageFile = ref(null);
const imagePreview = ref("");
const uploading = ref(false);

const siteId = route.params.id;

watch(isAddPhotoSlideOverOpen, (isOpen) => {
  if (!isOpen) {
    description.value = "";
    imageFile.value = null;
    imagePreview.value = "";
  }
});

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    uploading.value = true;
    imageFile.value = file;
    new Compressor(file, {
      quality: 0.7,
      maxWidth: 1920,
      success: async (compressedFile) => {
        const objectUrl = URL.createObjectURL(compressedFile);
        imagePreview.value = objectUrl;
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
  imagePreview.value = "";
  imageFile.value = null;
};

const savePhoto = async () => {
  if (!imageFile.value) {
    nuxtApp.$toastify("Please select an image", "error");
    return;
  }

  const result = await addPhoto(siteId, imageFile.value, description.value);

  if (result.success) {
    nuxtApp.$toastify("Photo added successfully!", "success");
    fetchPhotos(siteId);
    toggleAddPhotoSlideOver();
  } else {
    nuxtApp.$toastify(result.error, "error");
  }
};
</script>

<template>
  <USlideover v-model="isAddPhotoSlideOverOpen">
    <UCard
      class="flex flex-col flex-1"
      :ui="{
        body: { base: 'flex-1' },
        ring: '',
        divide: 'divide-y divide-zinc-100 dark:divide-zinc-800',
      }"
    >
      <template #header>
        <h3 class="text-xl font-semibold">Add Photo</h3>
      </template>

      <div class="space-y-4">
        <div class="space-y-2">
          <label class="block text-lg font-medium text-zinc-700 dark:text-zinc-200">Photo</label>
          <div v-if="imagePreview" class="relative w-full h-64 border rounded-lg overflow-hidden">
            <img :src="imagePreview" alt="Photo Preview" class="w-full h-full object-cover" />
            <button
              @click="removeImage"
              class="absolute top-2 right-2 text-white bg-red-500 rounded-full p-2 w-10 h-10"
            >
              &#x2715;
            </button>
          </div>
          <label
            v-else
            class="w-full h-64 bg-gray-100 dark:bg-gray-700 flex items-center justify-center border rounded-lg cursor-pointer"
          >
            <input type="file" class="hidden" @change="handleImageUpload" accept="image/*" />
            <span v-if="uploading">Uploading...</span>
            <span v-else class="text-blue-500">Click to Upload Photo</span>
          </label>
        </div>

        <div>
          <label class="block text-lg font-medium text-zinc-700 dark:text-zinc-200">
            Description (Optional)
          </label>
          <textarea
            v-model="description"
            rows="3"
            class="mt-1 bg-zinc-100 border border-zinc-300 text-zinc-900 text-lg rounded-lg focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none block w-full p-3 dark:bg-zinc-800 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white"
            placeholder="Add a description for this photo..."
          />
        </div>
      </div>

      <template #footer>
        <div class="flex space-x-4 w-full">
          <button
            @click="savePhoto"
            class="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Save Photo
          </button>
          <button
            @click="toggleAddPhotoSlideOver"
            class="flex-1 bg-red-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-600"
          >
            Cancel
          </button>
        </div>
      </template>
    </UCard>
  </USlideover>
</template>
