// composables/useUser.ts
import { ref, onMounted } from "vue";

export function useUser() {
    const supabase = useSupabaseClient();
    const authUser = useSupabaseUser();
    const userRole = ref(null);

    // Fetch the user's role from the database
    const fetchUserRole = async () => {
        console.log("Fetching user role...");
        if (!authUser.value) return;

        const { data, error } = await supabase.from("users").select("role").eq("id", authUser.value.id).single();

        if (error) {
            console.error("Error fetching user role:", error.message);
        } else {
            userRole.value = data.role;
        }
    };

    return { userRole, fetchUserRole };
}
