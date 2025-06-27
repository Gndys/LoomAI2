<template>
  <div :class="cn('flex flex-col gap-4', className)">
    <!-- Display error message -->
    <FormError v-if="errorMessage" :message="errorMessage" :code="errorCode" />
    
    <form @submit="onSubmit" class="flex flex-col gap-4">
      <div class="grid gap-6">
        <!-- Email input -->
        <div class="grid gap-2">
          <Label for="email">{{ t('auth.signin.email') }}</Label>
          <div class="relative">
            <Input
              id="email"
              v-bind="emailAttrs"
              v-model="email"
              type="email"
              :placeholder="t('auth.signin.emailPlaceholder')"
              :class="cn(errors.email && 'border-destructive')"
              :aria-invalid="errors.email ? 'true' : 'false'"
              autocomplete="email"
            />
            <span v-if="errors.email" class="text-destructive text-xs absolute -bottom-5 left-0">
              {{ errors.email }}
            </span>
          </div>
        </div>

        <!-- Password input -->
        <div class="grid gap-2">
          <div class="flex items-center">
            <Label for="password">{{ t('auth.signin.password') }}</Label>
            <NuxtLink
              :to="localePath('/forgot-password')"
              class="ml-auto text-sm underline-offset-4 hover:underline"
            >
              {{ t('auth.signin.forgotPassword') }}
            </NuxtLink>
          </div>
          <div class="relative">
            <Input
              id="password"
              v-bind="passwordAttrs"
              v-model="password"
              type="password"
              :class="cn(errors.password && 'border-destructive')"
              :aria-invalid="errors.password ? 'true' : 'false'"
              autocomplete="current-password"
            />
            <span v-if="errors.password" class="text-destructive text-xs absolute -bottom-5 left-0">
              {{ errors.password }}
            </span>
          </div>
        </div>

        <!-- Captcha component (if enabled) -->
        <div v-if="captchaEnabled" class="grid gap-2">
          <VueTurnstile
            ref="turnstileRef"
            :site-key="captchaSiteKey"
            v-model="turnstileToken"
            size="flexible"
            @error="onTurnstileError"
            @expired="onTurnstileExpired"
            :theme="isDark ? 'dark' : 'light'"
          />
          <span v-if="turnstileError" class="text-destructive text-xs">
            {{ turnstileError }}
          </span>
        </div>

        <!-- Remember me option -->
        <div class="flex items-center space-x-2">
          <input
            id="remember"
            v-bind="rememberAttrs"
            v-model="remember"
            type="checkbox"
            class="border-primary text-primary ring-offset-background focus-visible:ring-ring h-4 w-4 rounded border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          />
          <Label for="remember" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {{ t('auth.signin.rememberMe') }}
          </Label>
        </div>

        <!-- Submit button -->
        <Button 
          type="submit" 
          class="w-full" 
          :disabled="loading || isSubmitting || (captchaEnabled && !turnstileToken)"
        >
          {{ loading ? t('auth.signin.submitting') : t('auth.signin.submit') }}
        </Button>
      </div>

      <!-- Registration link -->
      <div class="text-center text-sm">
        {{ t('auth.signin.noAccount') }}
        <NuxtLink :to="localePath('/signup')" class="underline underline-offset-4">
          {{ t('auth.signin.signupLink') }}
        </NuxtLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { createValidators } from '@libs/validators'
import { authClientVue } from '@libs/auth/authClient'
import { cn } from '@/lib/utils'
import VueTurnstile from 'vue-turnstile'

interface Props {
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  className: ''
})

// Initialize internationalization and navigation
const { t } = useI18n()
const localePath = useLocalePath()
const { locale } = useI18n()

// State management
const loading = ref(false)
const errorMessage = ref('')
const errorCode = ref('')

// Get runtime configuration
const runtimeConfig = useRuntimeConfig()

// Captcha related state
const captchaEnabled = computed(() => {
  // Use environment variable or default to true
  return runtimeConfig.public.captchaEnabled !== 'false'
})

const captchaSiteKey = computed(() => {
  // Use Nuxt's public environment variables
  const siteKey = runtimeConfig.public.turnstileSiteKey as string | undefined
  return siteKey || '1x00000000000000000000AA' // Test key
})

const turnstileToken = ref('')
const turnstileError = ref('')
const turnstileRef = ref()

// Theme detection (simplified version)
const isDark = ref(false)

// Turnstile event handlers
const onTurnstileError = () => {
  turnstileError.value = t('auth.signin.captchaError')
  turnstileToken.value = ''
}

const onTurnstileExpired = () => {
  turnstileError.value = t('auth.signin.captchaExpired')
  turnstileToken.value = ''
}

// Create internationalized validators
const { loginFormSchema } = createValidators(t)

// Form validation
const { handleSubmit, errors, defineField, isSubmitting } = useForm({
  validationSchema: toTypedSchema(loginFormSchema),
  initialValues: {
    email: '',
    password: '',
    remember: true
  }
})

// Define form fields
const [email, emailAttrs] = defineField('email', {
  validateOnBlur: true
})
const [password, passwordAttrs] = defineField('password', {
  validateOnBlur: true  
})
const [remember, rememberAttrs] = defineField('remember')

// Handle form submission
const onSubmit = handleSubmit(async (values) => {
  loading.value = true
  errorMessage.value = ''
  errorCode.value = ''
  turnstileError.value = ''

  // Validate captcha (if enabled)
  if (captchaEnabled.value && !turnstileToken.value) {
    turnstileError.value = t('auth.signin.captchaRequired')
    loading.value = false
    return
  }

  try {
    const fetchOptions: any = {}
    
    // If captcha is enabled, add captcha token to request headers
    if (captchaEnabled.value && turnstileToken.value) {
      fetchOptions.headers = {
        'x-captcha-response': turnstileToken.value
      }
    }

    const result = await authClientVue.signIn.email({
      email: values.email,
      password: values.password,
      callbackURL: `/${locale.value}`,
      ...(values.remember ? { rememberMe: true } : {}),
      fetchOptions
    })

    // Check for errors
    if (result && 'error' in result && result.error) {
      const error = result.error
      if (error.code && error.message) {
        errorMessage.value = t('auth.signin.errors.invalidCredentials')
        errorCode.value = error.code
      } else {
        errorMessage.value = t('auth.signin.errors.invalidCredentials')
        errorCode.value = 'UNKNOWN_ERROR'
      }
    } else if (result && 'user' in result) {
      // Login successful, redirect to dashboard
      await navigateTo(localePath('/dashboard'))
    } else {
      // Unknown response format
      errorMessage.value = t('auth.signin.errors.invalidCredentials')
      errorCode.value = 'UNEXPECTED_RESPONSE'
    }
  } catch (err) {
    errorMessage.value = t('auth.signin.errors.invalidCredentials')
    errorCode.value = 'UNEXPECTED_ERROR'
  } finally {
    loading.value = false
  }
})
</script> 