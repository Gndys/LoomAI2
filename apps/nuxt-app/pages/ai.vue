<template>
  <div class="flex flex-col h-screen">
    <!-- Header -->
    <div class="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur">
      <div class="max-w-3xl mx-auto py-4 px-4">
        <div class="flex items-center justify-between">
          <div class="mr-4">
            <h1 class="text-xl font-semibold text-foreground">{{ $t('ai.chat.title') }}</h1>
            <p class="text-sm text-muted-foreground">{{ $t('ai.chat.description') }}</p>
          </div>
          <Button
            v-if="messages && messages.length > 0"
            variant="outline"
            size="sm"
            @click="reloadConversation"
          >
            {{ $t('ai.chat.actions.newChat') }}
          </Button>
        </div>
      </div>
    </div>

    <!-- AI Elements Conversation Container -->
    <Conversation class="flex-1">
      <ConversationContent class="max-w-3xl mx-auto space-y-4 pb-40">
        <!-- Welcome message when no messages -->
        <ConversationEmptyState
          v-if="!messages || messages.length === 0"
          :title="$t('ai.chat.welcomeMessage')"
          :description="$t('ai.chat.description')"
        >
          <template #icon>
            <MessageSquareIcon class="size-6" />
          </template>
        </ConversationEmptyState>

        <!-- Messages using AI Elements -->
        <Message
          v-for="message in messages || []"
          :key="message.id"
          :from="message.role === 'system' ? 'assistant' : message.role"
        >
          <MessageContent>
            <template v-if="message.parts && message.parts.length > 0">
              <template v-for="(part, i) in message.parts" :key="i">
                <Response v-if="part.type === 'text' && (part as any).text" :content="(part as any).text" />
              </template>
            </template>
            <template v-else-if="(message as any).content">
              <!-- Fallback for messages with content but no parts (like user messages) -->
              <Response :content="(message as any).content" />
            </template>
            <!-- No fallback for empty messages during streaming -->
          </MessageContent>
        </Message>

        <!-- Error State -->
        <div v-if="error" class="max-w-3xl mx-auto px-4 py-4">
          <div class="flex items-center justify-between p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg">
            <div class="flex-1">
              <p class="font-medium">{{ $t('ai.chat.errors.requestFailed') }}</p>
              <p class="text-sm opacity-90 mt-1">
                {{ error.message || $t('ai.chat.errors.unknownError') }}
              </p>
            </div>
            <div class="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                @click="regenerate"
                :disabled="status === 'streaming'"
              >
                {{ $t('ai.chat.actions.retry') }}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                @click="() => {
                  if (messages && messages.length > 0) {
                    messages.splice(-1, 1);
                  }
                }"
              >
                {{ $t('ai.chat.actions.dismiss') }}
              </Button>
            </div>
          </div>
        </div>
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>

    <!-- Fixed form at the bottom -->
    <div class="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-sm p-4 pb-4 safe-area-inset-bottom">
      <div class="max-w-3xl mx-auto">
        <PromptInput @submit="handleSubmit">
          <PromptInputTextarea 
            :placeholder="error ? $t('ai.chat.errors.inputDisabled') : $t('ai.chat.placeholder')"
            :disabled="status === 'streaming' || error != null"
          />
          <PromptInputToolbar>
            <PromptInputTools>
              <!-- Model selector -->
              <PromptInputModelSelect v-model="selectedModel">
                <PromptInputModelSelectTrigger>
                  <PromptInputModelSelectValue placeholder="Select Model" />
                </PromptInputModelSelectTrigger>
                <PromptInputModelSelectContent>
                  <template v-for="([prov, models], index) in Object.entries(providerModels)" :key="prov">
                    <div v-if="index > 0" class="h-px bg-border my-1" />
                    <div class="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {{ $t(`ai.chat.providers.${prov}`) || prov.charAt(0).toUpperCase() + prov.slice(1) }}
                    </div>
                    <PromptInputModelSelectItem 
                      v-for="mod in models" 
                      :key="mod" 
                      :value="`${prov}:${mod}`"
                    >
                      {{ $t(`ai.chat.models.${mod}`) || mod }}
                    </PromptInputModelSelectItem>
                  </template>
                </PromptInputModelSelectContent>
              </PromptInputModelSelect>
            </PromptInputTools>

            <PromptInputSubmit 
              :status="error ? 'error' : status"
              :disabled="error != null"
            />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, watch, h, defineComponent, toRef } from 'vue'
import { Chat } from '@ai-sdk/vue'
import { DefaultChatTransport } from 'ai'
import { Send, Loader2, MessageSquareIcon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { authClientVue } from '@libs/auth/authClient'

// AI Elements components
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation'
import {
  Message,
  MessageContent,
} from '@/components/ai-elements/message'
import { Response } from '@/components/ai-elements/response'
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectValue,
} from '@/components/ai-elements/prompt-input'

// ConversationEmptyState component
const ConversationEmptyState = defineComponent({
  props: {
    title: String,
    description: String,
  },
  setup(props, { slots }) {
    return () => h('div', { class: 'text-center py-8' }, [
      h('div', { class: 'mb-4' }, slots.icon?.()),
      h('div', { class: 'text-muted-foreground text-sm' }, props.title),
      props.description && h('div', { class: 'text-muted-foreground text-xs mt-1' }, props.description)
    ])
  }
})

// SEO and metadata
const { t: $t } = useI18n()

useSeoMeta({
  title: $t('ai.metadata.title'),
  description: $t('ai.metadata.description'),
  keywords: $t('ai.metadata.keywords')
})

// Local reactive data
const provider = ref<keyof typeof providerModels>('qwen')
const model = ref('qwen-turbo')
const selectedModel = computed({
  get: () => `${provider.value}:${model.value}`,
  set: (value: string) => {
    const [selectedProvider, selectedModel] = value.split(':')
    provider.value = selectedProvider as keyof typeof providerModels
    model.value = selectedModel
  }
})
const hasSubscription = ref(true) // 默认允许，避免闪烁

// Provider models configuration
const providerModels = {
  qwen: ['qwen-max', 'qwen-plus', 'qwen-turbo'],
  deepseek: ['deepseek-chat', 'deepseek-coder'],
}
const initialMessages: any[] = [
  { 
    id: '1', 
    role: 'user',
    parts: [{ type: 'text', text: '你好，我是用户，测试一下AI助手。' }]
  },
  { 
    id: '2', 
    role: 'assistant',
    parts: [{ 
      type: 'text', 
      text: `# Hello, Markdown!
This is a **bold** text with some *italic* content.

- Item 1  
- Item 2

\`\`\`javascript
console.log("Code block");
\`\`\`
`
    }]
  },
];

// Use the AI SDK's Chat class
const chat = new Chat({
  transport: new DefaultChatTransport({ 
    api: '/api/chat',
    prepareSendMessagesRequest: ({ messages }) => {
      return { body: { messages, provider: provider.value, model: model.value } }
    }
  }),
  messages: initialMessages,
  onError: (error: any) => {
    console.error('Chat error:', error)
  }
})

// Get reactive references from chat
const messages = toRef(chat, 'messages')
const status = toRef(chat, 'status')
const error = toRef(chat, 'error')

// New conversation function
const reloadConversation = () => {
  // Clear messages by creating a new chat instance or resetting
  messages.value.length = 0
}

// Check user subscription status once on page load
const checkSubscriptionStatus = async () => {
  try {
    const response = await $fetch('/api/subscription/status', {
      method: 'GET'
    })
    hasSubscription.value = response && response.hasSubscription
  } catch (error) {
    console.error('Failed to check subscription status:', error)
    hasSubscription.value = false
  }
}

// Enhanced form submission with subscription check
const handleSubmit = (event: Event) => {
  event.preventDefault()
  
  // Get form data
  const form = event.target as HTMLFormElement
  const formData = new FormData(form)
  const message = formData.get('message') as string
  
  if (!message?.trim() || status.value === 'streaming' || error.value != null) return
  
  // Check subscription status (cached from page load)
  if (!hasSubscription.value) {
    // Show permission denied toast
    toast.error($t('ai.chat.errors.subscriptionRequired'), {
      description: $t('ai.chat.errors.subscriptionRequiredDescription'),
      action: {
        label: $t('common.viewPlans'),
        onClick: () => {
          // Navigate to pricing page
          const localePath = useLocalePath()
          navigateTo(localePath('/pricing'))
        }
      }
    })
    return
  }

  // Send message using Chat class
  chat.sendMessage({ text: message })
  
  // Reset form and clear textarea
  form.reset()
  
  // Also manually clear the textarea to ensure it's empty
  const textarea = form.querySelector('textarea[name="message"]') as HTMLTextAreaElement
  if (textarea) {
    textarea.value = ''
    // Trigger input event to update any reactive bindings
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
  }
  
  // Scroll to bottom after submission
  nextTick(() => scrollToBottom())
}

// Regenerate function
const regenerate = () => {
  chat.regenerate()
}

// Auto-scroll to bottom
const scrollToBottom = async () => {
  await nextTick()
}


// Watch for messages changes to auto-scroll
watch(messages, scrollToBottom, { deep: true })

onMounted(() => {
  checkSubscriptionStatus()
})

// Middleware to check subscription (commented out for now)
// definePageMeta({
//   middleware: 'subscription'
// })
</script>

<style scoped>
/* Custom scrollbar for messages container */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground));
}

/* Ensure textarea doesn't exceed max height */
textarea {
  max-height: 120px;
}

/* Safe area handling for mobile devices */
.safe-area-inset-bottom {
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
}

/* Ensure proper spacing for fixed bottom input */
.fixed.bottom-0 {
  min-height: 80px; /* Minimum height to ensure proper spacing */
}

/* Markdown content styling */
.prose pre {
  background-color: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
  padding: 0.5rem;
  border-radius: 0.375rem;
  overflow-x: auto;
}

.prose code {
  background-color: hsl(var(--muted));
  color: hsl(var(--muted-foreground));
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}
</style> 