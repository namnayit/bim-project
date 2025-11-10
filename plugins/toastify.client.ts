// plugins/toastify.client.ts
import Vue3Toastify, { type ToastContainerOptions, type ToastOptions, toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(Vue3Toastify) as ToastContainerOptions;

    // Modified toastify function to automatically handle and format error messages
    nuxtApp.provide("toastify", (msg: string, type: string | "success" | "info" | "error" = "info") => {
        // Automatically detect and strip field names from Zod error messages if present
        toast(msg, {
            type,
            autoClose: 3000,
            position: toast.POSITION.TOP_CENTER,
            hideProgressBar: false,
            pauseOnFocusLoss: false,
            theme: "colored",
        } as ToastOptions);
    });
});
