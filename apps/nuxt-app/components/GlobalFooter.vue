<template>
  <footer class="py-6">
    <div class="container text-center text-sm text-muted-foreground">
      {{ t('footer.copyright', { year }) }}
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t } = useI18n()
const year = new Date().getFullYear()
</script>
