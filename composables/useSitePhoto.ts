import { ref } from "vue";
import Compressor from "compressorjs";

const photos = ref([]);
const isAddPhotoSlideOverOpen = ref(false);
const errorMessage = ref("");

export function useSitePhoto() {
  const supabase = useSupabaseClient();

  const fetchPhotos = async (siteId) => {
    const { data, error } = await supabase
      .from("site_photos")
      .select("*")
      .eq("site_id", siteId)
      .order("created_at", { ascending: false });

    if (error) {
      errorMessage.value = `Error fetching photos: ${error.message}`;
    } else {
      photos.value = data;
    }
  };

  const toggleAddPhotoSlideOver = () => {
    isAddPhotoSlideOverOpen.value = !isAddPhotoSlideOverOpen.value;
  };

  const uploadPhoto = async (file) => {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.7,
        maxWidth: 1920,
        maxHeight: 1920,
        success: async (compressedFile) => {
          const fileExt = compressedFile.name.split(".").pop();
          const fileName = `${Date.now()}.${fileExt}`;
          const filePath = `site-photos/${fileName}`;

          const { data, error } = await supabase.storage
            .from("assets-images")
            .upload(filePath, compressedFile);

          if (error) {
            reject(error);
          } else {
            const { data: publicUrl } = supabase.storage
              .from("assets-images")
              .getPublicUrl(filePath);
            resolve(publicUrl.publicUrl);
          }
        },
        error(err) {
          reject(err);
        },
      });
    });
  };

  const addPhoto = async (siteId, file, description = "") => {
    try {
      const imageUrl = await uploadPhoto(file);

      const { data, error } = await supabase
        .from("site_photos")
        .insert({
          site_id: siteId,
          image_url: imageUrl,
          description: description,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchPhotos(siteId);
      return { success: true, data };
    } catch (error) {
      errorMessage.value = `Error adding photo: ${error.message}`;
      return { success: false, error: error.message };
    }
  };

  const deletePhoto = async (photoId, siteId) => {
    try {
      const photo = photos.value.find((p) => p.id === photoId);
      if (!photo) throw new Error("Photo not found");

      if (photo.image_url) {
        const filePath = photo.image_url.split("assets-images/")[1];
        if (filePath) {
          await supabase.storage.from("assets-images").remove([filePath]);
        }
      }

      const { error } = await supabase
        .from("site_photos")
        .delete()
        .eq("id", photoId);

      if (error) throw error;

      await fetchPhotos(siteId);
      return { success: true };
    } catch (error) {
      errorMessage.value = `Error deleting photo: ${error.message}`;
      return { success: false, error: error.message };
    }
  };

  return {
    photos,
    isAddPhotoSlideOverOpen,
    errorMessage,
    fetchPhotos,
    toggleAddPhotoSlideOver,
    addPhoto,
    deletePhoto,
  };
}
