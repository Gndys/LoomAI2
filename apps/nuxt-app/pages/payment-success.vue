<template>
  <div>
    <!-- SEO Head -->
    <Head>
      <title>{{ $t('payment.metadata.success.title') }}</title>
      <meta name="description" :content="$t('payment.metadata.success.description')" />
      <meta name="keywords" :content="$t('payment.metadata.success.keywords')" />
    </Head>

    <div class="container max-w-2xl py-20">
      <!-- Loading State -->
      <div v-if="isVerifying" class="flex flex-col items-center text-center space-y-6">
        <Loader2 class="h-12 w-12 animate-spin text-primary" />
        <p class="text-muted-foreground">{{ $t('common.loading') }}</p>
      </div>

      <!-- Success State -->
      <div v-else-if="isValid" class="flex flex-col items-center text-center space-y-6">
        <div class="rounded-full bg-green-100 p-3">
          <CheckCircle2 class="h-12 w-12 text-green-600" />
        </div>
        
        <h1 class="text-3xl font-bold">
          {{ $t('payment.result.success.title') }}
        </h1>
        
        <p class="text-muted-foreground">
          {{ $t('payment.result.success.description') }}
        </p>

        <div class="flex flex-col sm:flex-row gap-4 pt-6">
          <Button as-child>
            <NuxtLink :to="localePath('/dashboard')">
              {{ $t('payment.result.success.actions.viewSubscription') }}
            </NuxtLink>
          </Button>
          
          <Button variant="outline" as-child>
            <NuxtLink :to="localePath('/')">
              {{ $t('payment.result.success.actions.backToHome') }}
            </NuxtLink>
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { CheckCircle2, Loader2 } from 'lucide-vue-next'

// Router and route
const route = useRoute()
const localePath = useLocalePath()
const { t } = useI18n()

// Get query parameters
const sessionId = route.query.session_id as string
const provider = (route.query.provider as string) || 'stripe'
// Alipay uses out_trade_no as the order identifier
const outTradeNo = route.query.out_trade_no as string

// WeChat and Alipay don't need verification - they use webhooks for confirmation
const skipVerification = provider === 'wechat' || provider === 'alipay'

// Reactive state
const isVerifying = ref(!skipVerification)
const isValid = ref(skipVerification)

console.log('session', sessionId, 'provider', provider, 'out_trade_no', outTradeNo)

// Verify payment session on mount
onMounted(async () => {
  // For WeChat and Alipay, payment status is confirmed via webhook
  // The return URL is just for user experience
  if (provider === 'wechat' || provider === 'alipay') {
    isValid.value = true
    isVerifying.value = false
    return
  }

  // For Creem, we don't need sessionId, verification is done via URL signature
  // For Stripe and others, sessionId is required
  if (!sessionId && provider !== 'creem') {
    await navigateTo(localePath('/pricing'))
    return
  }

  try {
    // Determine verification endpoint based on provider
    let verifyUrl: string
    if (provider === 'stripe') {
      verifyUrl = `/api/payment/verify/stripe?session_id=${sessionId}`
    } else if (provider === 'creem') {
      // Creem verification needs the full URL for signature verification
      verifyUrl = `/api/payment/verify/creem${window.location.search}`
    } else {
      // Default to Stripe verification (backward compatibility)
      verifyUrl = `/api/payment/verify/stripe?session_id=${sessionId}`
    }

    const response = await fetch(verifyUrl)
    
    if (response.ok) {
      isValid.value = true
    } else {
      throw new Error('Invalid session')
    }
  } catch (error) {
    console.error('Session verification failed:', error)
    await navigateTo(localePath('/pricing'))
  } finally {
    isVerifying.value = false
  }
})

// SEO
useHead({
  title: () => t('payment.metadata.success.title'),
  meta: [
    { name: 'description', content: () => t('payment.metadata.success.description') },
    { name: 'keywords', content: () => t('payment.metadata.success.keywords') }
  ]
})
</script> 