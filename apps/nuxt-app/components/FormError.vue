<template>
  <Alert v-if="message" variant="destructive" class="mb-6">
    <ExclamationTriangleIcon class="h-4 w-4" />
    <AlertDescription>{{ message }} {{ code ? `- ${code}` : '' }}</AlertDescription>
  </Alert>
</template>

<script setup lang="ts">
// Import icon component (using lucide-vue-next)
import { AlertTriangle as ExclamationTriangleIcon } from 'lucide-vue-next'

interface Props {
  message?: string
  code?: string
}

defineProps<Props>()
</script> 