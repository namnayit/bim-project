import Compressor from "compressorjs";
import { ref } from "vue";

const assets = ref([]);
const sites = ref([]);
const selectedAsset = ref(null);
const isEditSlideOverOpen = ref(false);
const isTransferSlideOverOpen = ref(false);
const isAddSlideOverOpen = ref(false);
const errorMessage = ref("");
const imageUploadStatus = ref("");
const assetTransfering = ref(false);

export function useAsset() {
  const supabase = useSupabaseClient();

  // Fetch assets for a specific site
  const fetchAssets = async (siteId) => {
    const { data, error } = await supabase
      .from("assets")
      .select("*")
      .eq("site_id", siteId)
      .order("category", { ascending: true })
      .order("name", { ascending: true }); // Orders assets alphabetically by name and category

    if (error) {
      errorMessage.value = `Error fetching assets: ${error.message}`;
    } else {
      assets.value = data;
    }
  };

  // Fetch other sites for transfer
  const fetchOtherSites = async (currentSiteId) => {
    const { data, error } = await supabase
      .from("sites")
      .select("*")
      .neq("id", currentSiteId);
    if (error) {
      errorMessage.value = `Error fetching sites: ${error.message}`;
    } else {
      sites.value = data;
    }
  };

  // Toggle the Edit Asset slide-over
  const toggleEditSlideOver = (asset = null) => {
    selectedAsset.value = asset ? { ...asset } : null;
    isEditSlideOverOpen.value = !isEditSlideOverOpen.value;
  };

  // Toggle the Transfer Asset slide-over
  const toggleTransferSlideOver = (asset = null) => {
    selectedAsset.value = asset ? { ...asset } : null;
    if (asset) fetchOtherSites(asset.site_id);
    isTransferSlideOverOpen.value = !isTransferSlideOverOpen.value;
  };

  // Toggle the Add Asset slide-over
  const toggleAddSlideOver = () => {
    console.log("Toggling Add Asset slide-over");
    isAddSlideOverOpen.value = !isAddSlideOverOpen.value;
  };

  // Add a new asset
  const addAsset = async (newAsset) => {
    const { data: existing, error: fetchError } = await supabase
      .from("assets")
      .select("id")
      .eq("name", newAsset.name)
      .eq("site_id", newAsset.site_id)
      .eq("category", newAsset.category) // Added category to uniqueness check
      .maybeSingle();

    if (existing) {
      return {
        success: false,
        error:
          "An asset with this name already exists for the site in this category",
      };
    } else {
      const { data, error } = await supabase
        .from("assets")
        .insert(newAsset)
        .select("id")
        .single();
      if (error) {
        return {
          success: false,
          error: `Error adding asset: ${error.message}`,
        };
      }

      await fetchAssets(newAsset.site_id);
      return { success: true, id: data.id };
    }
  };

  // Edit asset properties, including image URL update
  const editAsset = async (updatedAsset) => {
    const { id, site_id, name, quantity, type, image_url, category } =
      updatedAsset;
    const payload = { name, quantity, type, image_url, category };

    const { error } = await supabase
      .from("assets")
      .update(payload)
      .eq("id", id);
    if (error) {
      errorMessage.value = `Error updating asset: ${error.message}`;
      console.log("[v0] Update error details:", error);
      return false;
    }
    await fetchAssets(site_id);
    return true;
  };

  // Add a helper to update the image URL for an existing asset
  const updateAssetImageUrl = async (assetId, imageUrlPath) => {
    const { error } = await supabase
      .from("assets")
      .update({ image_url: imageUrlPath })
      .eq("id", assetId);
    if (error) {
      errorMessage.value = `Failed to update asset image URL: ${error.message}`;
    }
  };

  // Function to upload and optimize the asset image
  const uploadImage = async (file) => {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.7,
        maxWidth: 1000,
        maxHeight: 1000,
        success: async (compressedFile) => {
          const fileExt = compressedFile.name.split(".").pop();
          const fileName = `${Date.now()}.${fileExt}`;
          const filePath = `assets/${fileName}`;

          const { data, error } = await supabase.storage
            .from("assets-images")
            .upload(filePath, compressedFile);

          if (error) {
            imageUploadStatus.value = `Failed to upload image: ${error.message}`;
            reject(error);
          } else {
            const { data } = supabase.storage
              .from("assets-images")
              .getPublicUrl(filePath);
            resolve(data.publicUrl);
          }
        },
        error(err) {
          imageUploadStatus.value = `Image compression failed: ${err.message}`;
          reject(err);
        },
      });
    });
  };

  // Add or update asset image URL
  const addOrUpdateAssetImage = async (assetId, file) => {
    try {
      // Upload the image to storage and get the public URL
      const imageUrl = await uploadImage(file);

      console.log("Image URL!!!:", imageUrl);

      if (!imageUrl)
        throw new Error("Failed to retrieve image URL after upload");
      console.log("assetID!!!!!: ", assetId);
      // Update the asset with the new image URL if `assetId` is provided
      if (assetId) {
        const { error } = await supabase
          .from("assets")
          .update({ image_url: imageUrl })
          .eq("id", assetId);
        if (error) throw error;
        selectedAsset.value.image_url = imageUrl; // Update selected asset's image locally
      }

      console.log("Image URL!!!:", imageUrl);

      return imageUrl; // Return the URL for further handling
    } catch (error) {
      errorMessage.value = `Error updating asset image: ${error.message}`;
      return null;
    }
  };

  // Function to delete asset image
  const deleteAssetImage = async (assetId) => {
    try {
      const { image_url } = selectedAsset.value;

      if (!image_url) throw new Error("No image found to delete.");

      const filePath = image_url.split("assets-images/")[1];
      const { error: storageError } = await supabase.storage
        .from("assets-images")
        .remove([filePath]);

      if (storageError)
        throw new Error(
          `Failed to delete image from storage: ${storageError.message}`
        );

      const { error: updateError } = await supabase
        .from("assets")
        .update({ image_url: null })
        .eq("id", assetId);

      if (updateError)
        throw new Error(
          `Failed to update asset image URL: ${updateError.message}`
        );

      await fetchAssets(selectedAsset.value.site_id);
      return true;
    } catch (error) {
      errorMessage.value = error.message;
      return false;
    }
  };

  const transferAssetToMultipleSites = async (
    transfers: { targetSiteId: number; quantity: number }[]
  ) => {
    try {
      assetTransfering.value = true;
      const {
        id: assetId,
        site_id: sourceSiteId,
        quantity: currentQuantity,
        name,
        type,
        image_url,
        category,
      } = selectedAsset.value;

      const totalQty = transfers.reduce((sum, t) => sum + t.quantity, 0);
      if (totalQty > currentQuantity)
        throw new Error("Transfer quantity exceeds available.");

      // Update source asset quantity
      const remaining = currentQuantity - totalQty;
      const { error: updateError } = await supabase
        .from("assets")
        .update({ quantity: remaining })
        .eq("id", assetId);
      if (updateError) throw updateError;

      // Process all transfers
      const transferPromises = transfers.map(
        async ({ targetSiteId, quantity }) => {
          const { data: targetAsset, error } = await supabase
            .from("assets")
            .select("*")
            .eq("site_id", targetSiteId)
            .eq("name", name)
            .eq("category", category)
            .maybeSingle();

          if (error && error.code !== "PGRST116") throw error;

          if (targetAsset) {
            const newQty = targetAsset.quantity + quantity;
            const { error: updError } = await supabase
              .from("assets")
              .update({ quantity: newQty, image_url })
              .eq("id", targetAsset.id);
            if (updError) throw updError;
          } else {
            const { error: insError } = await supabase.from("assets").insert({
              site_id: targetSiteId,
              name,
              quantity,
              type,
              image_url,
              category,
            });
            if (insError) throw insError;
          }
        }
      );

      await Promise.all(transferPromises);

      // If source asset quantity becomes 0, move to `is_main = true` site
      if (remaining === 0) {
        const { data: mainSite, error: mainError } = await supabase
          .from("sites")
          .select("id")
          .eq("isMain", true)
          .maybeSingle();

        if (mainError) throw mainError;
        if (!mainSite) throw new Error("Main site not found.");

        const { data: mainAsset, error: existingMainAssetError } =
          await supabase
            .from("assets")
            .select("*")
            .eq("site_id", mainSite.id)
            .eq("name", name)
            .eq("category", category)
            .maybeSingle();

        if (
          existingMainAssetError &&
          existingMainAssetError.code !== "PGRST116"
        ) {
          throw existingMainAssetError;
        }

        if (mainAsset) {
          const { error: updateMainAsset } = await supabase
            .from("assets")
            .update({ quantity: mainAsset.quantity + 0 })
            .eq("id", mainAsset.id);
          if (updateMainAsset) throw updateMainAsset;
        } else {
          const { error: insertMainAsset } = await supabase
            .from("assets")
            .insert({
              site_id: mainSite.id,
              name,
              quantity: 0,
              type,
              image_url,
              category,
            });
          if (insertMainAsset) throw insertMainAsset;
        }
        const { error: deleteZeroAsset } = await supabase
          .from("assets")
          .delete()
          .eq("id", assetId);
        if (deleteZeroAsset) throw deleteZeroAsset;
      }

      // Refresh source site assets
      await fetchAssets(sourceSiteId);

      // Refresh all target sites assets
      await Promise.all(transfers.map((t) => fetchAssets(t.targetSiteId)));

      assetTransfering.value = false;
      return true;
    } catch (err) {
      errorMessage.value = err.message || "Transfer failed";
      assetTransfering.value = false;
      return false;
    }
  };

  const deleteAsset = async (assetId: number) => {
    try {
      const { error } = await supabase
        .from("assets")
        .delete()
        .eq("id", assetId);
      if (error) {
        return {
          success: false,
          error: `Error deleting asset: ${error.message}`,
        };
      }
      assets.value = assets.value.filter((asset) => asset.id !== assetId);
      return { success: true };
    } catch (err) {
      return { success: false, error: `Error deleting asset: ${err}` };
    }
  };

  return {
    assets,
    sites,
    selectedAsset,
    isEditSlideOverOpen,
    isTransferSlideOverOpen,
    isAddSlideOverOpen,
    errorMessage,
    imageUploadStatus,
    fetchAssets,
    fetchOtherSites,
    toggleEditSlideOver,
    toggleTransferSlideOver,
    toggleAddSlideOver,
    assetTransfering,
    addAsset,
    updateAssetImageUrl,
    editAsset,
    transferAssetToMultipleSites,
    uploadImage,
    addOrUpdateAssetImage,
    deleteAssetImage,
    deleteAsset,
  };
}
