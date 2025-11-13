<template>
  <div>
    <!-- SEO Head -->
    <Head>
      <title>{{ t('pricing.metadata.title') }}</title>
      <meta name="description" :content="t('pricing.metadata.description')" />
      <meta name="keywords" :content="t('pricing.metadata.keywords')" />
    </Head>
    
    <div class="min-h-screen bg-background">
      <!-- Hero Section -->
      <section class="relative py-24 sm:py-32 overflow-hidden">
        <div class="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <motion.div 
            class="mx-auto max-w-4xl text-center"
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.8 }"
          >
            <motion.div
              class="inline-flex items-center space-x-2 px-4 py-2 bg-chart-1-bg-15 rounded-full border border-chart-1/20 mb-8"
              :initial="{ opacity: 0, scale: 0.9 }"
              :animate="{ opacity: 1, scale: 1 }"
              :transition="{ duration: 0.6, delay: 0.2 }"
            >
              <Sparkles class="h-4 w-4 text-chart-1" />
              <span class="text-xs font-medium text-chart-1">{{ t('pricing.title') }}</span>
            </motion.div>

            <h2 class="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6">
              <span class="text-gradient-chart-warm">
                {{ t('pricing.subtitle') }}
              </span>
            </h2>
            
            <p class="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {{ t('pricing.description') }}
            </p>
          </motion.div>
        </div>
      </section>

      <!-- Pricing Cards -->
      <section class="py-24">
        <div class="mx-auto max-w-7xl px-6 lg:px-8">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            <motion.div
              v-for="(plan, index) in plans"
              :key="plan.id"
              :class="[
                'relative rounded-xl p-6 shadow-lg transition-all duration-300 hover:scale-[1.02]',
                isRecommended(plan) 
                  ? 'bg-card border-2 border-chart-1 shadow-chart-1/20' 
                  : 'bg-card border border-border hover:border-border/80'
              ]"
              :initial="{ opacity: 0, y: 20 }"
              :whileInView="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.6, delay: index * 0.1 }"
              :viewport="{ once: true }"
            >
              <!-- Recommended Badge -->
              <div v-if="isRecommended(plan)" class="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div class="inline-flex items-center space-x-2 px-3 py-1.5 bg-gradient-chart-warm text-white rounded-full shadow-md">
                  <Crown class="h-3.5 w-3.5" />
                  <span class="text-xs font-medium">{{ t('pricing.recommendedBadge') }}</span>
                </div>
              </div>

              <!-- Plan Header -->
              <div class="text-center mb-6">
                <h3 :class="[
                  'text-xl font-bold mb-2',
                  isRecommended(plan) ? 'text-card-foreground' : 'text-foreground'
                ]">
                  {{ getPlanName(plan) }}
                </h3>
                
                <p :class="[
                  'text-sm',
                  isRecommended(plan) ? 'text-muted-foreground' : 'text-muted-foreground'
                ]">
                  {{ getPlanDescription(plan) }}
                </p>
              </div>

              <!-- Price -->
              <div class="text-center mb-6">
                <div class="flex items-baseline justify-center space-x-2">
                  <span :class="[
                    'text-4xl font-bold',
                    isRecommended(plan) ? 'text-card-foreground' : 'text-foreground'
                  ]">
                    {{ plan.currency === 'CNY' ? '¥' : '$' }}{{ plan.amount }}
                  </span>
                  <span :class="[
                    'text-base font-medium',
                    isRecommended(plan) ? 'text-muted-foreground' : 'text-muted-foreground'
                  ]">
                    /{{ getPlanDuration(plan) }}
                  </span>
                </div>
                
                <div v-if="isLifetime(plan)" class="mt-2 inline-flex items-center space-x-1 px-2.5 py-1 bg-chart-5-bg-15 text-chart-5 rounded-full text-xs font-medium">
                  <Heart class="h-3.5 w-3.5" />
                  <span>{{ t('pricing.lifetimeBadge') }}</span>
                </div>
              </div>

              <!-- Features -->
              <div class="space-y-3 mb-6">
                <div
                  v-for="feature in getPlanFeatures(plan)"
                  :key="feature"
                  class="flex items-start space-x-3"
                >
                  <div :class="[
                    'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                    isRecommended(plan) 
                      ? 'bg-chart-1' 
                      : 'bg-chart-2-bg-15'
                  ]">
                    <Check :class="[
                      'h-3 w-3',
                      isRecommended(plan) 
                        ? 'text-white' 
                        : 'text-chart-2'
                    ]" />
                  </div>
                  <span :class="[
                    'text-sm leading-6',
                    isRecommended(plan) ? 'text-card-foreground' : 'text-card-foreground'
                  ]">
                    {{ feature }}
                  </span>
                </div>
              </div>

              <!-- CTA Button -->
              <Button
                @click="handleSubscribe(plan)"
                :disabled="loading === plan.id || session.isPending"
                :class="[
                  'w-full py-3 rounded-lg font-semibold text-base transition-all duration-300 hover:scale-[1.02]',
                  isRecommended(plan)
                    ? 'bg-gradient-chart-warm text-primary-foreground shadow-md hover:shadow-lg hover:opacity-90'
                    : isLifetime(plan)
                    ? 'bg-gradient-chart-cool text-primary-foreground shadow-md hover:shadow-lg hover:opacity-90'
                    : 'bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:bg-primary/90',
                  'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
                ]"
              >
                <div v-if="loading === plan.id" class="flex items-center justify-center space-x-2">
                  <Loader2 class="h-4 w-4 animate-spin" />
                  <span>{{ t('common.loading') }}</span>
                </div>
                <div v-else class="flex items-center justify-center space-x-2">
                  <span>{{ t('pricing.cta') }}</span>
                  <ArrowRight class="h-4 w-4" />
                </div>
              </Button>

              <!-- Special Effects for Recommended Plan -->
              <div v-if="isRecommended(plan)" class="absolute inset-0 bg-gradient-chart-warm opacity-5 rounded-xl pointer-events-none"></div>
            </motion.div>
          </div>

          <!-- Additional Info -->
          <motion.div 
            class="mt-16 text-center"
            :initial="{ opacity: 0, y: 20 }"
            :whileInView="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.6, delay: 0.5 }"
            :viewport="{ once: true }"
          >
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div class="flex flex-col items-center space-y-3">
                <div class="w-12 h-12 bg-chart-2-bg-15 rounded-xl flex items-center justify-center">
                  <Shield class="h-6 w-6 text-chart-2" />
                </div>
                <h4 class="font-semibold text-foreground">{{ t('pricing.features.securePayment.title') }}</h4>
                <p class="text-sm text-muted-foreground text-center">{{ t('pricing.features.securePayment.description') }}</p>
              </div>
              
              <div class="flex flex-col items-center space-y-3">
                <div class="w-12 h-12 bg-chart-1-bg-15 rounded-xl flex items-center justify-center">
                  <Zap class="h-6 w-6 text-chart-1" />
                </div>
                <h4 class="font-semibold text-foreground">{{ t('pricing.features.flexibleSubscription.title') }}</h4>
                <p class="text-sm text-muted-foreground text-center">{{ t('pricing.features.flexibleSubscription.description') }}</p>
              </div>
              
              <div class="flex flex-col items-center space-y-3">
                <div class="w-12 h-12 bg-chart-3-bg-15 rounded-xl flex items-center justify-center">
                  <Star class="h-6 w-6 text-chart-3" />
                </div>
                <h4 class="font-semibold text-foreground">{{ t('pricing.features.globalCoverage.title') }}</h4>
                <p class="text-sm text-muted-foreground text-center">{{ t('pricing.features.globalCoverage.description') }}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>

    <!-- Payment Modal -->
    <Dialog :open="!!qrCodeUrl" @update:open="(open) => !open && closeQrCodeModal()">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle class="text-center">
            <span v-if="currentPlan">
              {{ currentPlan.currency === 'CNY' ? '¥' : '$' }}{{ currentPlan.amount }} - 
              {{ getPlanName(currentPlan) }}
            </span>
          </DialogTitle>
        </DialogHeader>
        <div class="flex flex-col items-center space-y-6">
          <!-- Payment Steps -->
          <div class="w-full max-w-md mx-auto">
            <div class="relative after:absolute after:inset-x-0 after:top-5 after:block after:h-0.5 after:-translate-y-1/2 after:rounded-lg after:bg-muted">
              <div class="relative z-10 flex justify-between">
                <div
                  v-for="(step, index) in steps"
                  :key="index"
                  class="flex flex-col items-center"
                >
                  <div :class="[
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold',
                    index <= currentStep
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground'
                  ]">
                    {{ index + 1 }}
                  </div>
                  <div class="mt-3 w-24 text-center">
                    <div :class="[
                      'text-sm font-semibold',
                      index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                    ]">
                      {{ step.title }}
                    </div>
                    <div :class="[
                      'mt-1 text-xs',
                      index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                    ]">
                      {{ step.description }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- QR Code -->
          <div v-if="qrCodeUrl" class="flex flex-col items-center space-y-4">
            <img 
              :src="qrCodeUrl" 
              alt="WeChat Pay QR Code" 
              class="w-64 h-64"
            />
            <p class="text-sm text-muted-foreground text-center">
              {{ t('payment.scanQrCode') }}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import { Check, Star, Crown, Heart, ArrowRight, Shield, Sparkles, Zap, Loader2 } from 'lucide-vue-next'
import { motion } from 'motion-v'
import type { Plan } from '@config'

// Get config data
const runtimeConfig = useRuntimeConfig()
const plans = computed(() => Object.values(runtimeConfig.public.paymentPlans) as Plan[])

// Authentication - Use Better Auth composable
const { user, isAuthenticated, session } = useAuth()

// Router and i18n
const router = useRouter()
const route = useRoute()
const { locale, t } = useI18n()
const localePath = useLocalePath()

// Reactive state
const loading = ref<string | null>(null)
const qrCodeUrl = ref<string | null>(null)
const currentPlan = ref<Plan | null>(null)
const currentStep = ref(0)
const orderId = ref<string | null>(null)
const pollingInterval = ref<NodeJS.Timeout | null>(null)

// Payment steps
const steps = computed(() => [
  { title: t('payment.steps.initiate'), description: t('payment.steps.initiateDesc') },
  { title: t('payment.steps.scan'), description: t('payment.steps.scanDesc') },
  { title: t('payment.steps.pay'), description: t('payment.steps.payDesc') },
])

// Helper functions
const isRecommended = (plan: Plan) => plan.recommended
const isLifetime = (plan: Plan) => plan.id === 'lifetime'

const getPlanName = (plan: Plan) => {
  return plan.i18n?.[locale.value]?.name || plan.i18n?.['zh-CN']?.name || 'Plan'
}

const getPlanDescription = (plan: Plan) => {
  return plan.i18n?.[locale.value]?.description || plan.i18n?.['zh-CN']?.description || 'Description'
}

const getPlanDuration = (plan: Plan) => {
  return plan.i18n?.[locale.value]?.duration || plan.i18n?.['zh-CN']?.duration || 'Duration'
}

const getPlanFeatures = (plan: Plan) => {
  return plan.i18n?.[locale.value]?.features || plan.i18n?.['zh-CN']?.features || []
}

// Payment polling
const startPolling = (orderIdValue: string) => {
  // Clear existing polling
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
  }

  const interval = setInterval(async () => {
    try {
      const response = await $fetch(`/api/payment/query?orderId=${orderIdValue}&provider=wechat`) as any

      if (response.status === 'paid') {
        clearInterval(interval)
        pollingInterval.value = null
        await navigateTo(localePath(`/payment-success?provider=wechat`))
      } else if (response.status === 'failed') {
        clearInterval(interval)
        pollingInterval.value = null
        toast.error(t('payment.result.failed'))
        closeQrCodeModal()
      }
    } catch (error) {
      console.error('Payment polling error:', error)
    }
  }, 3000) // Poll every 3 seconds

  pollingInterval.value = interval
}

// Handle subscription
const handleSubscribe = async (plan: Plan) => {
  try {
    if (!user.value) {
      const returnPath = encodeURIComponent(route.fullPath)
      await navigateTo(localePath(`/signin?returnTo=${returnPath}`))
      return
    }

    loading.value = plan.id
    const provider = plan.provider || 'stripe'
    currentPlan.value = plan
    
    const response = await $fetch('/api/payment/initiate', {
      method: 'POST',
      body: {
        planId: plan.id,
        provider
      }
    })
    
    if (provider === 'wechat') {
      if (response.paymentUrl) {
        try {
          // Generate QR code (we'll need to install qrcode package)
          const QRCode = await import('qrcode')
          const qrDataUrl = await QRCode.toDataURL(response.paymentUrl)
          qrCodeUrl.value = qrDataUrl
          orderId.value = response.providerOrderId
          currentStep.value = 1
          startPolling(response.providerOrderId)
        } catch (err) {
          console.error('QR code generation error:', err)
          toast.error(t('common.unexpectedError'))
        }
      }
    } else {
      if (response.paymentUrl) {
        window.location.href = response.paymentUrl
      }
    }
  } catch (error) {
    console.error('Payment error:', error)
    toast.error(t('common.unexpectedError'))
  } finally {
    loading.value = null
  }
}

// Close QR code modal
const closeQrCodeModal = async () => {
  // If payment is in progress, confirm cancellation
  if (currentStep.value < 2 && orderId.value) {
    const confirmCancel = window.confirm(t('payment.confirmCancel'))
    if (!confirmCancel) {
      return // User cancelled the close, continue payment flow
    }
    
    // Call cancel order API
    try {
      await $fetch(`/api/payment/cancel?orderId=${orderId.value}&provider=wechat`, {
        method: 'POST'
      })
      toast.info(t('payment.orderCanceled'))
    } catch (error) {
      console.error('Cancel order error:', error)
      toast.error(t('common.unexpectedError'))
    }
  }
  
  qrCodeUrl.value = null
  currentPlan.value = null
  currentStep.value = 0
  orderId.value = null
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
    pollingInterval.value = null
  }
}

// Cleanup on unmount
onUnmounted(() => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
  }
})

// SEO
useHead({
  title: () => t('pricing.metadata.title'),
  meta: [
    { name: 'description', content: () => t('pricing.metadata.description') },
    { name: 'keywords', content: () => t('pricing.metadata.keywords') }
  ]
})
</script>