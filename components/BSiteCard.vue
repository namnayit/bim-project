<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import type { Ref } from "vue";

const props = defineProps<{
    site: {
        id: string;
        name: string;
        project_manager?: string;
        site_manager?: string;
        assets: { id: string; name: string; quantity: number }[];
    };
    searchQuery: string;
}>();

const router = useRouter();
const goToSite = () => {
    router.push(`/sites/${props.site.id}`);
};

const escapeRegex = (str: string) =>
    str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

// Highlight utility
const highlight = (text: string) => {
    if (!props.searchQuery) return text;
    const query = escapeRegex(props.searchQuery);
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, `<mark class="bg-yellow-300 dark:bg-yellow-600">$1</mark>`);
};

// Computed fields with highlighted matches
const highlightedName = computed(() => highlight(props.site.name));
const highlightedProjectManager = computed(() =>
    props.site.project_manager ? highlight(props.site.project_manager) : null
);
const highlightedSiteManager = computed(() =>
    props.site.site_manager ? highlight(props.site.site_manager) : null
);
const highlightedAssets = computed(() =>
    props.site.assets.map((asset) => ({
        ...asset,
        highlightedName: highlight(asset.name),
    }))
);
</script>

<template>
    <div @click="goToSite" class="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 border border-zinc-300 dark:border-zinc-600 dark:hover:bg-zinc-700 cursor-pointer h-scroll">
        <h3
            class="text-lg font-semibold text-zinc-900 dark:text-white capitalize"
            v-html="highlightedName"
        />

        <!-- Project Manager -->
        <div v-if="highlightedProjectManager" class="text-sm text-zinc-700 dark:text-zinc-400 mt-1 capitalize">
            <span class="font-medium">Project Manager:</span>
            <span v-html="highlightedProjectManager" />
        </div>

        <!-- Site Manager -->
        <div v-if="highlightedSiteManager" class="text-sm text-zinc-700 dark:text-zinc-400 mt-1 capitalize">
            <span class="font-medium">Site Manager:</span>
            <span v-html="highlightedSiteManager" />
        </div>

        <!-- Display all assets -->
        <div class="mt-3">
            <h4 class="text-md font-medium text-zinc-700 dark:text-zinc-300">Materials & Equipment:</h4>
            <ul class="list-inside mt-1 capitalize">
                <li
                    v-for="asset in highlightedAssets"
                    :key="asset.id"
                    class="text-sm text-zinc-600 dark:text-zinc-400"
                >
                    <span v-html="asset.highlightedName" /> - {{ asset.quantity }}
                </li>
            </ul>
        </div>
    </div>
</template>
