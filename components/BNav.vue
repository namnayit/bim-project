<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useUser } from "@/composables/useUser";

const { userRole, fetchUserRole } = useUser();
const isDarkMode = ref(false);
const showDropdown = ref(false);
const route = useRoute();

// Theme management
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

// Supabase auth and user logic
const isOnAdminRoute = computed(() => route.path.startsWith("/admin"));

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const isAdmin = computed(() => userRole.value === "admin");
const profileImageUrl = computed(() => `https://ui-avatars.com/api/?name=${encodeURIComponent(user.value?.email || "User")}&background=0D8ABC&color=fff`);

const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login"; // Redirect to login page
};

// Initialize theme and fetch user role on mount
onMounted(() => {
    loadTheme();
    fetchUserRole();
});
</script>

<template>
    <!-- Primary Navbar -->
    <nav class="bg-zinc-50 border-zinc-200 dark:bg-zinc-900 border-b dark:border-b-zinc-500 px-3">
        <div class="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl py-4">
            <NuxtLink to="/" class="flex items-center rtl:space-x-reverse">
                <span class="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Site Manager</span>
            </NuxtLink>
            <div class="flex items-center space-x-2 rtl:space-x-reverse">
                <!-- a button which takes them to "/" -->
                <NuxtLink
                    v-if="isAdmin && isOnAdminRoute"
                    to="/"
                    class="flex items-center justify-center py-2 px-4 text-xs h-9 font-medium text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:text-blue-700 focus:ring-2 focus:ring-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-white"
                    >App</NuxtLink
                >
                <!-- Theme Toggle Button -->
                <button
                    @click="toggleTheme"
                    class="flex items-center justify-center p-2 text-xs w-9 h-9 font-medium text-zinc-700 bg-zinc-50 border border-zinc-200 rounded-lg hover:bg-zinc-50 hover:text-blue-700 focus:ring-2 focus:ring-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-white"
                >
                    <svg v-if="isDarkMode" class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            d="M10 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-11a1 1 0 0 0 1-1V1a1 1 0 0 0-2 0v2a1 1 0 0 0 1 1Zm0 12a1 1 0 0 0-1 1v2a1 1 0 1 0 2 0v-2a1 1 0 0 0-1-1ZM4.343 5.757a1 1 0 0 0 1.414-1.414L4.343 2.929a1 1 0 0 0-1.414 1.414l1.414 1.414Zm11.314 8.486a1 1 0 0 0-1.414 1.414l1.414 1.414a1 1 0 0 0 1.414-1.414l-1.414-1.414ZM4 10a1 1 0 0 0-1-1H1a1 1 0 0 0 0 2h2a1 1 0 0 0 1-1Zm15-1h-2a1 1 0 1 0 0 2h2a1 1 0 0 0 0-2ZM4.343 14.243l-1.414 1.414a1 1 0 1 0 1.414 1.414l1.414-1.414a1 1 0 0 0-1.414-1.414ZM14.95 6.05a1 1 0 0 0 .707-.293l1.414-1.414a1 1 0 1 0-1.414-1.414l-1.414 1.414a1 1 0 0 0 .707 1.707Z"
                        />
                    </svg>
                    <svg v-else class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                        <path d="M17.8 13.75a1 1 0 0 0-.859-.5A7.488 7.488 0 0 1 10.52 2a1 1 0 0 0 0-.969A1.035 1.035 0 0 0 9.687.5h-.113a9.5 9.5 0 1 0 8.222 14.247 1 1 0 0 0 .004-.997Z" />
                    </svg>
                </button>

                <!-- User Menu Dropdown -->
                <div class="relative" v-click-outside="() => (showDropdown = false)">
                    <button @click="showDropdown = !showDropdown" type="button" class="flex text-sm bg-gray-800 rounded-full" id="user-menu-button">
                        <img :src="profileImageUrl" class="w-8 h-8 rounded-full" alt="User photo" />
                    </button>

                    <!-- Dropdown menu -->
                    <div v-if="showDropdown" class="absolute right-0 z-50 mt-2 w-48 bg-zinc-50 divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600">
                        <div class="px-4 py-3">
                            <span class="block text-sm text-gray-500 dark:text-gray-400">{{ user?.email || "user@example.com" }}</span>
                        </div>
                        <ul class="py-2" aria-labelledby="user-menu-button">
                            <li v-if="isAdmin">
                                <NuxtLink to="/admin/sites" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">Admin Dashboard</NuxtLink>
                            </li>
                            <li>
                                <button @click="signOut" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">Sign Out</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <!-- Admin-only Secondary Navbar -->
    <nav v-if="isAdmin && isOnAdminRoute" class="bg-zinc-50 dark:bg-zinc-700 border-b dark:border-b-zinc-500">
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
