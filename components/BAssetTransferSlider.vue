<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useNuxtApp } from "#app";
import { useAsset } from "@/composables/useAsset";

const nuxtApp = useNuxtApp();
const {
    sites,
    selectedAsset,
    toggleTransferSlideOver,
    transferAssetToMultipleSites,
    isTransferSlideOverOpen,
    fetchAssets,
    assetTransfering
} = useAsset();

// Track quantity per site
const transferForm = ref<{ [key: number]: number }>({});

watch(selectedAsset, (newAsset) => {
    transferForm.value = {};
});

const maxQuantity = computed(() => selectedAsset.value?.quantity || 0);
const totalTransferQuantity = computed(() =>
    Object.values(transferForm.value).reduce((sum, qty) => sum + (qty || 0), 0)
);

const isTransferDisabled = computed(() =>
    assetTransfering.value ||
    totalTransferQuantity.value <= 0 ||
    totalTransferQuantity.value > maxQuantity.value
);

const emit = defineEmits(['transfer-complete']);

const confirmTransfer = async () => {
  const transfers = Object.entries(transferForm.value)
    .filter(([siteId, qty]) => !isNaN(Number(qty)) && Number(qty) > 0)
    .map(([siteId, qty]) => ({
      targetSiteId: siteId,
      quantity: Number(qty)
    }));

  if (transfers.length === 0) return;

  const success = await transferAssetToMultipleSites(transfers);
  if (success) {
    nuxtApp.$toastify("Asset transferred successfully!", "success");
    transferForm.value = {};
    emit('transfer-complete');
    toggleTransferSlideOver();
  } else {
    nuxtApp.$toastify("Failed to transfer asset.", "error");
  }
};
</script>

<template>
    <USlideover v-model="isTransferSlideOverOpen">
        <UCard class="flex flex-col flex-1" :ui="{ body: { base: 'flex-1' }, ring: '', divide: 'divide-y divide-zinc-100 dark:divide-zinc-800' }">
            <template #header>
                <h3 class="text-xl font-semibold trans-h">Transfer Asset to Multiple Sites</h3>
            </template>

            <div>
                <!-- Info -->
                <label class="block text-lg font-medium text-zinc-700 dark:text-zinc-200 mb-1 site-h">Distribute Quantity</label>
                <p class="text-sm text-zinc-500 dark:text-zinc-400 mb-3 site-p">
                    Available: {{ maxQuantity }} | Transferring: {{ totalTransferQuantity }}
                </p>

                <!-- Site list -->
                <div class="h-[500px] h-60vh overflow-y-auto pr-1">
                    <div v-for="site in sites" :key="site.id" class="flex items-center space-x-3 mb-3 site-l">
                        <label class="w-40 text-zinc-800 dark:text-zinc-200 capitalize">{{ site.name }}</label>
                        <input
                            type="number"
                            min="0"
                            :max="maxQuantity"
                            v-model.number="transferForm[site.id]"
                            placeholder="Qty"
                            class="w-24 border border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-800 p-2 rounded text-zinc-900 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex space-x-4 w-full get-over">
                    <button
                        @click="confirmTransfer"
                        :disabled="isTransferDisabled"
                        class="flex-1 bg-green-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-600"
                    >
                        Confirm Transfer
                    </button>
                    <button @click="toggleTransferSlideOver" class="flex-1 bg-red-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-600">
                        Cancel
                    </button>
                </div>
            </template>
        </UCard>
    </USlideover>
</template>
