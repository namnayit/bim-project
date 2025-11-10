<script setup lang="ts">
import { ref, onMounted } from "vue";

// Reactive state to track the current theme mode
const isDarkMode = ref(false);

// Load the theme from localStorage (if set) and apply it
const loadTheme = () => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        isDarkMode.value = true;
        document.documentElement.classList.add("dark");
    } else {
        isDarkMode.value = false;
        document.documentElement.classList.remove("dark");
    }
};

// Toggle between dark and light mode
const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
    if (isDarkMode.value) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
    } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
    }
};

// Load the theme on mount
onMounted(loadTheme);
</script>

<template>
    <nav class="bg-zinc-50 border-zinc-200 dark:bg-zinc-900 border-b dark:border-b-zinc-500">
        <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl py-4">
            <a href="/" class="flex items-center rtl:space-x-reverse">
                <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Site Manager</span>
            </a>
            <div class="flex items-center space-x-3 rtl:space-x-reverse">
                <!-- Theme Toggle Button -->

                <!-- Dark/Light Mode Switcher Button -->
                <button
                    @click="toggleTheme"
                    class="flex items-center justify-center p-2 text-xs w-9 h-9 font-medium text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-500 dark:bg-zinc-800 focus:outline-none dark:text-zinc-400 dark:border-zinc-600 dark:hover:text-white dark:hover:bg-zinc-700"
                >
                    <!-- Sun Icon (Light Mode) -->
                    <svg v-if="isDarkMode" class="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            d="M10 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-11a1 1 0 0 0 1-1V1a1 1 0 0 0-2 0v2a1 1 0 0 0 1 1Zm0 12a1 1 0 0 0-1 1v2a1 1 0 1 0 2 0v-2a1 1 0 0 0-1-1ZM4.343 5.757a1 1 0 0 0 1.414-1.414L4.343 2.929a1 1 0 0 0-1.414 1.414l1.414 1.414Zm11.314 8.486a1 1 0 0 0-1.414 1.414l1.414 1.414a1 1 0 0 0 1.414-1.414l-1.414-1.414ZM4 10a1 1 0 0 0-1-1H1a1 1 0 0 0 0 2h2a1 1 0 0 0 1-1Zm15-1h-2a1 1 0 1 0 0 2h2a1 1 0 0 0 0-2ZM4.343 14.243l-1.414 1.414a1 1 0 1 0 1.414 1.414l1.414-1.414a1 1 0 0 0-1.414-1.414ZM14.95 6.05a1 1 0 0 0 .707-.293l1.414-1.414a1 1 0 1 0-1.414-1.414l-1.414 1.414a1 1 0 0 0 .707 1.707Z"
                        />
                    </svg>

                    <!-- Moon Icon (Dark Mode) -->
                    <svg v-else class="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                        <path d="M17.8 13.75a1 1 0 0 0-.859-.5A7.488 7.488 0 0 1 10.52 2a1 1 0 0 0 0-.969A1.035 1.035 0 0 0 9.687.5h-.113a9.5 9.5 0 1 0 8.222 14.247 1 1 0 0 0 .004-.997Z" />
                    </svg>
                </button>

                <NuxtLink
                    to="/"
                    class="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm font-medium text-zinc-900 rounded-lg group bg-gradient-to-br from-cyan-500 to-blue-500 group-hover:from-cyan-500 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-cyan-200 dark:focus:ring-cyan-800"
                >
                    <span class="relative px-5 py-2.5 transition-all ease-in duration-75 bg-zinc-50 dark:bg-zinc-900 rounded-md group-hover:bg-opacity-0"> Go to App </span>
                </NuxtLink>
            </div>
        </div>
    </nav>
    <nav class="bg-zinc-50 dark:bg-zinc-700 border-b dark:border-b-zinc-500">
        <div class="max-w-screen-xl py-4 mx-auto">
            <div class="flex items-center">
                <ul class="flex flex-row font-medium mt-0 rtl:space-x-reverse text-sm">
                    <li>
                        <NuxtLink to="/admin/sites" class="text-zinc-900 dark:text-white hover:bg-zinc-600 rounded-lg py-2 px-2" aria-current="page">Sites</NuxtLink>
                    </li>
                    <li>
                        <NuxtLink to="/admin/users" class="text-zinc-900 dark:text-white hover:bg-zinc-600 rounded-lg py-2 px-2">Users</NuxtLink>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>
