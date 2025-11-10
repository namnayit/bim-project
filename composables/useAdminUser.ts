import { ref, onMounted } from "vue";

// State to manage users and error handling
const isCreateUserOpen = ref(false);
const usersLoading = ref(false);
const isEditUserOpen = ref(false);
const selectedUser = ref(null); // Holds the user being edited
const users = ref([]);
const errorMessage = ref("");

// Composable to manage user-related actions
export function useAdminUser() {
    const supabase = useSupabaseClient();

    // Toggle the Create User slide-over
    function toggleCreateUser() {
        isCreateUserOpen.value = !isCreateUserOpen.value;
    }

    // Toggle Edit User slide-over
    function toggleEditUser(user) {
        selectedUser.value = user;
        isEditUserOpen.value = true;
    }

    // Fetch users from the Supabase "users" table
    const fetchUsers = async () => {
        usersLoading.value = true;
        const { data, error } = await supabase.from("users").select("id, username, email, role");

        if (error) {
            errorMessage.value = "Error fetching users: " + error.message;
        } else {
            users.value = data;
        }
        usersLoading.value = false;
    };

    // Edit user by calling the server-side API route
    const editUser = async (userId, updatedUser) => {
    try {
        const response = await fetch("/api/updateUser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId,
                email: updatedUser.email,
                username: updatedUser.username,
                role: updatedUser.role,
                password: updatedUser.password || undefined,
            }),
        });

        const result = await response.json();

        if (response.ok) {
            fetchUsers();
            isEditUserOpen.value = false;
            return true;
        } else {
            errorMessage.value = `Error updating user: ${result.error}`;
            return false;
        }
    } catch (error) {
        errorMessage.value = `Unexpected error: ${error.message}`;
        return false;
    }
};


    // Delete user from Supabase Auth and the custom "users" table
    const deleteUser = async (userId) => {
        try {
            const response = await fetch("/api/deleteUser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                }),
            });

            const result = await response.json();
            if (response.ok) {
                // Refresh the users list after successful deletion
                fetchUsers();
                return true;
            } else {
                errorMessage.value = `Error deleting user: ${result.error}`;
                return false;
            }
        } catch (error) {
            errorMessage.value = `Unexpected error: ${error.message}`;
            return false;
        }
    };

    return {
        toggleCreateUser,
        isCreateUserOpen,
        isEditUserOpen,
        toggleEditUser,
        selectedUser,
        users,
        errorMessage,
        fetchUsers,
        editUser, // Added the editUser function
        deleteUser,
        usersLoading,
    };
}
