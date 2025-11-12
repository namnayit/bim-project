<script setup lang="ts">
import AssetAddSlideOver from "@/components/BAssetAddSlider.vue";
import AssetEditSlideOver from "@/components/BAssetEditSlider.vue";
import AssetTransferSlideOver from "@/components/BAssetTransferSlider.vue";
import { useAsset } from "@/composables/useAsset";
import { useSite } from "@/composables/useSite";
import { useUser } from "@/composables/useUser";
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import BNav from "~/components/BNav.vue";

const { userRole, fetchUserRole } = useUser();

const route = useRoute();
const router = useRouter();
const nuxtApp = useNuxtApp();
const isAdmin = computed(() => userRole.value === "admin");

const { selectedSite, siteName, fetchSiteDetails } = useSite();
const {
  assets,
  fetchAssets,
  toggleAddSlideOver,
  isAddSlideOverOpen,
  toggleEditSlideOver,
  toggleTransferSlideOver,
  deleteAsset,
  transferAssetToMultipleSites,
} = useAsset();

const searchQuery = ref(""); // Search query for filtering assets

// Use computed property to get assets from useAsset only
const displayedAssets = computed(() => assets.value);

const groupedAssets = computed(() => {
  const equipment = displayedAssets.value.filter(
    (asset) => asset.category === "equipment"
  );
  const materials = displayedAssets.value.filter(
    (asset) => asset.category === "materials"
  );
  return { equipment, materials };
});

const highlightedAssets = computed(() => {
  if (!searchQuery.value) {
    return {
      equipment: groupedAssets.value.equipment.map((asset) => ({
        ...asset,
        highlightedName: asset.name,
        highlightedType: asset.type,
        highlightedQuantity: asset.quantity.toString(),
      })),
      materials: groupedAssets.value.materials.map((asset) => ({
        ...asset,
        highlightedName: asset.name,
        highlightedType: asset.type,
        highlightedQuantity: asset.quantity.toString(),
      })),
    };
  }

  const query = searchQuery.value.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  const regex = new RegExp(`(${query})`, "gi");

  const filterAndHighlight = (assetList) => {
    return assetList
      .filter(
        (asset) =>
          asset.name?.toLowerCase().includes(query.toLowerCase()) ||
          asset.type?.toLowerCase().includes(query.toLowerCase()) ||
          asset.quantity?.toString().includes(query)
      )
      .map((asset) => ({
        ...asset,
        highlightedName: asset.name.replace(
          regex,
          `<mark class="bg-yellow-300 dark:bg-yellow-600">$1</mark>`
        ),
        highlightedType: asset.type.replace(
          regex,
          `<mark class="bg-yellow-300 dark:bg-yellow-600">$1</mark>`
        ),
        highlightedQuantity: asset.quantity
          .toString()
          .replace(
            regex,
            `<mark class="bg-yellow-300 dark:bg-yellow-600">$1</mark>`
          ),
      }));
  };

  return {
    equipment: filterAndHighlight(groupedAssets.value.equipment),
    materials: filterAndHighlight(groupedAssets.value.materials),
  };
});

// Unified fetch function
const fetchData = async (siteId) => {
  await fetchSiteDetails(siteId);
  await fetchAssets(siteId);
};

// Fetch data on mount
onMounted(() => {
  fetchData(route.params.id);
  fetchUserRole();
});

// Watch for route changes
watch(
  () => route.params.id,
  (newId) => {
    fetchData(newId);
  }
);

const handleDeleteAsset = async (assetId: number) => {
  if (confirm("Are you sure you want to delete this asset?")) {
    const success = await deleteAsset(assetId);
    if (success) {
      nuxtApp.$toastify("Asset deleted successfully!", "success");
      await fetchData(route.params.id); // Refresh both site and assets
    } else {
      nuxtApp.$toastify("Error deleting asset.", "error");
    }
  }
};

const handleTransferComplete = async () => {
  await fetchData(route.params.id);
};

const goBack = () => {
  router.push("/");
};
</script>

<template>
  <BNav />
  <section class="px-3">
    <div class="max-w-screen-xl mx-auto pt-4">
      <!-- Site Title and Add Asset Button -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <button
            @click="goBack"
            class="flex items-center justify-center w-10 h-10 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-600 text-white rounded-full mr-2 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-6 h-6"
              viewBox="0 0 512 512"
              fill="none"
            >
              <path
                d="M328 112L184 256l144 144"
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="48"
              />
            </svg>
          </button>
          <h2 class="text-2xl font-semibold capitalize single-head">
            {{ siteName }}
          </h2>
        </div>
        <button
          @click="toggleAddSlideOver"
          class="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg px-4 py-2 ad-ast"
        >
          Add Asset
        </button>
      </div>

      <!-- Search Form -->
      <form class="ml-auto max-w-md sm:min-w-[300px] min-w-full mb-4">
        <div class="relative">
          <div
            class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"
          >
            <svg
              class="w-4 h-4 text-zinc-500 dark:text-zinc-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search Materials & Equipment"
            class="pl-8 bg-zinc-100 border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none block w-full p-2.5 dark:bg-zinc-800 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white"
          />
        </div>
      </form>

      <!-- Display assets grouped by category -->
      <div class="space-y-6">
        <!-- Equipment Section -->
        <div v-if="highlightedAssets.equipment.length > 0">
          <h3 class="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
            Equipment
          </h3>
          <ul class="space-y-3">
            <li
              v-for="asset in highlightedAssets.equipment"
              :key="asset.id"
              class="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 border border-zinc-300 dark:border-zinc-600 flex justify-between items-center"
            >
              <div class="flex items-center space-x-4">
                <!-- Image Preview -->
                <div
                  v-if="asset.image_url"
                  class="w-12 h-12 overflow-hidden rounded-lg border dark:border-zinc-600 image-p"
                >
                  <img
                    :src="asset.image_url"
                    alt="Asset Image"
                    class="object-cover w-full h-full"
                  />
                </div>
                <div
                  v-else
                  class="w-12 h-12 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-lg"
                />

                <!-- Highlighted Asset Fields -->
                <div>
                  <span
                    class="text-lg font-medium text-zinc-900 dark:text-white capitalize"
                    v-html="asset.highlightedName ?? ''"
                  />
                  <span
                    class="block text-sm text-zinc-600 dark:text-zinc-400"
                    v-html="`Quantity: ${asset.highlightedQuantity ?? ''}`"
                  />
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex space-x-4 act-flex">
                <!-- Only For Admin  -->
                <button
                  v-if="isAdmin"
                  @click="handleDeleteAsset(asset.id)"
                  class="text-white p-2 rounded-full bg-red-600 hover:bg-red-800 transition del"
                  title="Delete Asset"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>

                <button
                  @click="toggleEditSlideOver(asset)"
                  class="text-white p-2 rounded-full bg-blue-600 hover:bg-blue-800 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-5 h-5"
                    viewBox="0 0 512 512"
                    fill="none"
                  >
                    <path
                      d="M384 224v184a40 40 0 01-40 40H104a40 40 0 01-40-40V168a40 40 0 0140-40h167.48"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="32"
                    />
                    <path
                      d="M459.94 53.25a16.06 16.06 0 00-23.22-.56L424.35 65a8 8 0 000 11.31l11.34 11.32a8 8 0 0011.34 0l12.06-12c6.1-6.09 6.67-16.01.85-22.38zM399.34 90L218.82 270.2a9 9 0 00-2.31 3.93L208.16 299a3.91 3.91 0 004.86 4.86l24.85-8.35a9 9 0 003.93-2.31L422 112.66a9 9 0 000-12.66l-9.95-10a9 9 0 00-12.71 0z"
                      stroke="currentColor"
                      fill="currentColor"
                    />
                  </svg>
                </button>
                <button
                  @click="toggleTransferSlideOver(asset)"
                  class="text-white p-2 rounded-full bg-green-600 hover:bg-green-800 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-5 h-5"
                    viewBox="0 0 512 512"
                    fill="none"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="32"
                      d="M304 48l112 112-112 112M398.87 160H96M208 464L96 352l112-112M114 352h302"
                    />
                  </svg>
                </button>
              </div>
            </li>
          </ul>
        </div>

        <!-- Materials Section -->
        <div v-if="highlightedAssets.materials.length > 0">
          <h3 class="text-xl font-semibold text-zinc-900 dark:text-white mb-3">
            Materials
          </h3>
          <ul class="space-y-3">
            <li
              v-for="asset in highlightedAssets.materials"
              :key="asset.id"
              class="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 border border-zinc-300 dark:border-zinc-600 flex justify-between items-center"
            >
              <div class="flex items-center space-x-4">
                <!-- Image Preview -->
                <div
                  v-if="asset.image_url"
                  class="w-12 h-12 overflow-hidden rounded-lg border dark:border-zinc-600 image-p"
                >
                  <img
                    :src="asset.image_url"
                    alt="Asset Image"
                    class="object-cover w-full h-full"
                  />
                </div>
                <div
                  v-else
                  class="w-12 h-12 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-lg"
                />

                <!-- Highlighted Asset Fields -->
                <div>
                  <span
                    class="text-lg font-medium text-zinc-900 dark:text-white capitalize"
                    v-html="asset.highlightedName ?? ''"
                  />
                  <span
                    class="block text-sm text-zinc-600 dark:text-zinc-400"
                    v-html="`Quantity: ${asset.highlightedQuantity ?? ''}`"
                  />
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex space-x-4 act-flex">
                <!-- Only For Admin  -->
                <button
                  v-if="isAdmin"
                  @click="handleDeleteAsset(asset.id)"
                  class="text-white p-2 rounded-full bg-red-600 hover:bg-red-800 transition del"
                  title="Delete Asset"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>

                <button
                  @click="toggleEditSlideOver(asset)"
                  class="text-white p-2 rounded-full bg-blue-600 hover:bg-blue-800 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-5 h-5"
                    viewBox="0 0 512 512"
                    fill="none"
                  >
                    <path
                      d="M384 224v184a40 40 0 01-40 40H104a40 40 0 01-40-40V168a40 40 0 0140-40h167.48"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="32"
                    />
                    <path
                      d="M459.94 53.25a16.06 16.06 0 00-23.22-.56L424.35 65a8 8 0 000 11.31l11.34 11.32a8 8 0 0011.34 0l12.06-12c6.1-6.09 6.67-16.01.85-22.38zM399.34 90L218.82 270.2a9 9 0 00-2.31 3.93L208.16 299a3.91 3.91 0 004.86 4.86l24.85-8.35a9 9 0 003.93-2.31L422 112.66a9 9 0 000-12.66l-9.95-10a9 9 0 00-12.71 0z"
                      stroke="currentColor"
                      fill="currentColor"
                    />
                  </svg>
                </button>
                <button
                  @click="toggleTransferSlideOver(asset)"
                  class="text-white p-2 rounded-full bg-green-600 hover:bg-green-800 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-5 h-5"
                    viewBox="0 0 512 512"
                    fill="none"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="32"
                      d="M304 48l112 112-112 112M398.87 160H96M208 464L96 352l112-112M114 352h302"
                    />
                  </svg>
                </button>
              </div>
            </li>
          </ul>
        </div>

        <!-- Empty State -->
        <div
          v-if="
            highlightedAssets.equipment.length === 0 &&
            highlightedAssets.materials.length === 0
          "
          class="text-center py-8"
        >
          <p class="text-zinc-500 dark:text-zinc-400">No assets found</p>
        </div>
      </div>

      <!-- Edit Slide-Over -->
      <AssetEditSlideOver />

      <!-- Add Slide-Over -->
      <AssetAddSlideOver />

      <!-- Transfer Slide-Over -->
      <AssetTransferSlideOver @transfer-complete="handleTransferComplete" />
    </div>
  </section>
</template>
