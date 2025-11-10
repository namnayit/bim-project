import { ref, computed } from "vue";
import { useNuxtApp, useState } from "#app";

export function useSite() {
    const supabase = useSupabaseClient();
    const nuxtApp = useNuxtApp();

    // State variables
    const sites = ref([]);
    const site = ref(null);
    const siteName = ref("");
    const projectManager = ref("");
    const siteManager = ref("");
    const assets = ref([]);
    const deletedAssetIds = ref([]);
    const sitesLoading = ref(false);
    const errorMessage = ref("");
    const searchQuery = ref(""); // For searching assets within sites
    const selectedSite = ref(null); // For keeping track of the selected site

    // Persist toast message across routes
    const toastMessage = useState("toastMessage", () => null);
    
    const filteredSites = computed(() => {
        if (!searchQuery.value) return sites.value;

        const query = searchQuery.value.toLowerCase();

        return sites.value.filter((site) => {
            const nameMatch = site.name?.toLowerCase().includes(query);
            const pmMatch = site.project_manager?.toLowerCase().includes(query);
            const smMatch = site.site_manager?.toLowerCase().includes(query);
            const assetMatch = site.assets?.some((asset) =>
                asset.name?.toLowerCase().includes(query)
            );

            return nameMatch || pmMatch || smMatch || assetMatch;
        });
    });

    // Add an asset row (for site details)
    const addAssetRow = () => {
        assets.value.push({ name: "", type: "material", quantity: 0 });
    };

    // Remove an asset row
    const removeAssetRow = (index) => {
        const asset = assets.value[index];
        if (asset.id) {
            deletedAssetIds.value.push(asset.id);
        }
        assets.value.splice(index, 1);
    };

    // Fetch all sites with assets
    const fetchSites = async () => {
        sitesLoading.value = true;

        // const { data, error } = await supabase.from("sites").select("*, assets(*)").eq("archive", false).order("created_at", { ascending: false });
        // if (error) {
        //     errorMessage.value = "Error fetching sites: " + error.message;
        //     nuxtApp.$toastify(errorMessage.value, "error");
        // } else {
        //     sites.value = data;
        // }

        const { data, error } = await supabase.from("sites").select("*, assets(*, name)").eq("archive", false).order("name", { ascending: true }); // Orders sites by created_at

        if (error) {
            errorMessage.value = `Error fetching sites: ${error.message}`;
            nuxtApp.$toastify(errorMessage.value, "error");
        } else {
            // Sort assets alphabetically by name within each site after fetching
            data.forEach((site) => {
                site.assets.sort((a, b) => a.name.localeCompare(b.name));
            });

            sites.value = data;
        }

        sitesLoading.value = false;
    };

    // Fetch site details by ID
    const fetchSiteDetails = async (siteId) => {
        const { data: siteData, error: siteError } = await supabase.from("sites").select("*").eq("id", siteId).single();
        if (siteError) {
            errorMessage.value = "Error fetching site details: " + siteError.message;
            nuxtApp.$toastify(errorMessage.value, "error");
        } else {
            site.value = siteData;
            siteName.value = siteData.name;
            projectManager.value = siteData.project_manager;
            siteManager.value = siteData.site_manager;
            selectedSite.value = siteData;

            const { data: assetData, error: assetError } = await supabase.from("assets").select("*").eq("site_id", siteId).order("name", { ascending: true }); // Orders assets alphabetically by name

            if (assetError) {
                errorMessage.value = "Error fetching assets: " + assetError.message;
                nuxtApp.$toastify(errorMessage.value, "error");
            } else {
                assets.value = assetData.length > 0 ? assetData : [{ name: "", type: "material", quantity: 0 }];
            }
        }
    };

    // Create a new site
    const createSite = async (newSiteName) => {
        const { data, error } = await supabase.from("sites").insert({ name: newSiteName }).single();
        if (error) {
            nuxtApp.$toastify(`Error creating site: ${error.message}`, "error");
        } else {
            sites.value.push(data); // Add the new site to the list
            toastMessage.value = "Site created successfully!";
            return true;
        }
        return false;
    };

    // Update site details
    const updateSite = async (siteId) => {
        const { error: siteError } = await supabase.from("sites").update({ name: siteName.value, project_manager: projectManager.value, site_manager: siteManager.value }).eq("id", siteId);

        if (!siteError) {
            const newAssets = assets.value.filter((asset) => !asset.id);
            if (newAssets.length > 0) {
                const { error: insertError } = await supabase.from("assets").insert(
                    newAssets.map((asset) => ({
                        site_id: siteId,
                        name: asset.name,
                        type: asset.type,
                        quantity: asset.quantity,
                    }))
                );
                if (insertError) {
                    nuxtApp.$toastify(`Error inserting new assets: ${insertError.message}`, "error");
                    return;
                }
            }

            const existingAssets = assets.value.filter((asset) => asset.id);
            if (existingAssets.length > 0) {
                const { error: updateError } = await supabase.from("assets").upsert(
                    existingAssets.map((asset) => ({
                        id: asset.id,
                        site_id: siteId,
                        name: asset.name,
                        type: asset.type,
                        quantity: asset.quantity,
                    })),
                    { onConflict: ["id"] }
                );
                if (updateError) {
                    nuxtApp.$toastify(`Error updating assets: ${updateError.message}`, "error");
                    return;
                }
            }

            if (deletedAssetIds.value.length > 0) {
                const { error: deleteError } = await supabase.from("assets").delete().in("id", deletedAssetIds.value);
                if (deleteError) {
                    nuxtApp.$toastify(`Error deleting assets: ${deleteError.message}`, "error");
                    return;
                }
            }

            toastMessage.value = "Site updated successfully!";
            return true;
        } else {
            nuxtApp.$toastify(`Error updating site: ${siteError.message}`, "error");
            return false;
        }
    };

    // Delete a site
    const deleteSite = async (siteId) => {
        const { error } = await supabase.from("sites").delete().eq("id", siteId);
        if (!error) {
            toastMessage.value = "Site deleted successfully!";
            sites.value = sites.value.filter((site) => site.id !== siteId);
            return true;
        } else {
            nuxtApp.$toastify(`Error deleting site: ${error.message}`, "error");
            return false;
        }
    };

    return {
        sites,
        site,
        siteName,
        projectManager,
        siteManager,
        assets,
        deletedAssetIds,
        sitesLoading,
        errorMessage,
        searchQuery,
        filteredSites,
        selectedSite,
        fetchSites,
        createSite,
        fetchSiteDetails,
        updateSite,
        deleteSite,
        addAssetRow,
        removeAssetRow,
        toastMessage,
    };
}
