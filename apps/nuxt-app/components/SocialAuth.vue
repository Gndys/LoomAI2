<template>
  <div :class="cn('flex flex-col gap-4', className)">
    <SocialButton 
      v-for="provider in providers" 
      :key="provider" 
      :provider="provider" 
      @click="handleProviderClick(provider)"
    />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'
import { authClientVue } from '@libs/auth/authClient'
import type { SocialProvider } from '@/types/auth'

interface Props {
  className?: string
  providers?: SocialProvider[]
}

const props = withDefaults(defineProps<Props>(), {
  className: '',
  providers: () => ['google', 'github', 'wechat', 'phone']
})

// Navigation
const localePath = useLocalePath()

// Handle provider click
const handleProviderClick = async (provider: SocialProvider) => {
  switch (provider) {
    case 'wechat':
      await navigateTo(localePath('/wechat'))
      break
    case 'phone':
      await navigateTo(localePath('/cellphone'))
      break
    default:
      // Other providers use default social login flow
      await authClientVue.signIn.social({
        provider,
      })
  }
}
</script> 