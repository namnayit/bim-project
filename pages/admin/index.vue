<script setup lang="ts">
const router = useRouter();

onMounted(() => {
    // push to admin/sites
    router.push("/admin/sites");
});
</script>
