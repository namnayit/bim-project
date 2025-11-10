// middleware/checkAdmin.ts
import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";
import { useUser } from "@/composables/useUser";

export default defineNuxtRouteMiddleware(async (to, from) => {
    const { fetchUserRole, userRole } = useUser();

    // Fetch the user's role if it hasn't been fetched yet
    if (!userRole.value) {
        await fetchUserRole();
    }

    // Check if the route starts with "/admin" and the user is not an admin
    if (to.path.startsWith("/admin") && userRole.value !== "admin") {
        // Redirect to the home page (or any other page you'd like)
        return navigateTo("/");
    }
});
