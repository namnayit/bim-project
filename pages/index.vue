<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useSite } from "@/composables/useSite";
import BSiteCard from "@/components/BSiteCard.vue";
import BNav from "~/components/BNav.vue";
import { useRoute } from "vue-router";

const router = useRouter();
const { filteredSites, searchQuery, fetchSites, sitesLoading, errorMessage } = useSite();

const sortOptions = [
    { key: "name", label: "Name (A-Z)", order: "asc" },
    { key: "name", label: "Name (Z-A)", order: "desc" },
    { key: "created_at", label: "Date Created (Newest)", order: "desc" },
    { key: "created_at", label: "Date Created (Oldest)", order: "asc" },
];
const selectedSort = ref(sortOptions[0]);
const showSortDropdown = ref(false);

const applySort = (sortOption) => {
    selectedSort.value = sortOption;
    const { key, order } = sortOption;
    filteredSites.value.sort((a, b) => {
        if (order === "asc") {
            return a[key] > b[key] ? 1 : -1;
        } else {
            return a[key] < b[key] ? 1 : -1;
        }
    });
    showSortDropdown.value = false;
};

onMounted(fetchSites);

const goBack = () => {
    router.push("/admin/sites");
};
</script>

<template>
    <BNav />
    <!-- Header with search bar and sort dropdown -->
    <section class="px-3 pb-4">
        <div class="flex items-center justify-between mx-auto max-w-screen-xl pt-4 j-start">

                <button @click="goBack" class="flex items-center justify-center w-10 h-10 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-600 text-white rounded-full mr-2 transition">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 512 512" fill="none">
                    <path d="M328 112L184 256l144 144" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="48" />
                </svg>
            </button><span>
                <h2 class="text-2xl font-semibold sm:block hidden">Sites</h2></span>
            
            <div class="flex items-center space-x-2 relative">
                <!-- Search Field -->
                <form class="max-w-md sm:min-w-[300px] min-w-full">
                    <div class="relative">
                        <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                            <svg class="w-4 h-4 text-zinc-500 dark:text-zinc-400" aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                            </svg>
                        </div>
                        <input v-model="searchQuery" type="search" placeholder="Search Materials & Equipment"
                            class="pl-8 bg-zinc-100 border border-zinc-300 text-zinc-900 text-sm rounded-lg focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none block w-full p-2.5 dark:bg-zinc-800 dark:border-zinc-600 dark:placeholder-zinc-400 dark:text-white" />
                    </div>
                </form>

                <!-- Sort Dropdown -->
                <div class="relative">
                    <!-- Button to open dropdown -->
                    <button @click="showSortDropdown = !showSortDropdown"
                        class="flex items-center justify-center p-2 text-xs w-10 h-10 font-medium text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:text-blue-700 focus:ring-2 focus:ring-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 512 512"
                            stroke="currentColor">
                            <path
                                d="M35.4 87.12l168.65 196.44A16.07 16.07 0 01208 294v119.32a7.93 7.93 0 005.39 7.59l80.15 26.67A7.94 7.94 0 00304 440V294a16.07 16.07 0 014-10.44L476.6 87.12A14 14 0 00466 64H46.05A14 14 0 0035.4 87.12z"
                                fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="32" />
                        </svg>
                    </button>

                    <!-- Dropdown Menu -->
                    <div v-if="showSortDropdown"
                        class="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-lg shadow-lg dark:bg-zinc-800 dark:border-zinc-600">
                        <ul class="py-1 text-sm text-zinc-700 dark:text-zinc-300">
                            <li v-for="option in sortOptions" :key="option.label" @click="applySort(option)"
                                class="px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer">
                                {{ option.label }}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sites displayed as cards -->
        <div
            v-if="!sitesLoading"
            class="columns-2 sm:columns-2 lg:columns-3 gap-3 mx-auto max-w-screen-xl my-4 space-y-3"
            >
            <BSiteCard
                v-for="site in filteredSites"
                :key="site.id"
                :site="site"
                :searchQuery="searchQuery"
                class="mb-3 break-inside-avoid"
            />
        </div>

        <!-- Loading and Error Messages -->
        <div v-if="sitesLoading" class="text-zinc-500 text-center mt-4"></div>
        <div v-if="errorMessage" class="text-red-500 text-sm mt-4">{{ errorMessage }}</div>
    </section>
</template>
