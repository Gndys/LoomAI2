<template>
  <div class="flex flex-col h-screen">
    <!-- Header -->
    <div class="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur">
      <div class="max-w-3xl mx-auto py-4 px-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-semibold text-foreground">{{ $t('ai.chat.title') }}</h1>
            <p class="text-sm text-muted-foreground">{{ $t('ai.chat.description') }}</p>
          </div>
          <Button
            v-if="messages.length > 0"
            variant="outline"
            size="sm"
            @click="reload"
          >
            {{ $t('ai.chat.actions.newChat') }}
          </Button>
        </div>
      </div>
    </div>

    <!-- Scrollable messages area -->
    <div ref="messagesContainer" class="flex-1 overflow-y-auto pb-24">
      <div class="max-w-3xl mx-auto py-6 px-4 space-y-4">
        <!-- Welcome message when no messages -->
        <div v-if="messages.length === 0" class="text-center py-8">
          <div class="text-muted-foreground text-sm">
            {{ $t('ai.chat.welcomeMessage') }}
          </div>
        </div>

        <!-- Messages -->
        <div
          v-for="message in messages"
          :key="message.id"
          class="flex"
          :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="px-4 py-2 rounded-lg shadow-sm border max-w-[80%]"
            :class="message.role === 'user'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card text-card-foreground border-border'"
          >
            <!-- User message -->
            <div v-if="message.role === 'user'" class="whitespace-pre-wrap">
              {{ message.content }}
            </div>
            
            <!-- AI message with parts support -->
            <div v-else>
              <div v-for="(part, index) in message.parts" :key="index">
                <!-- Text part with markdown rendering -->
                <div v-if="part.type === 'text'" class="prose prose-headings:my-2 prose-li:my-0 prose-ul:my-1 prose-p:my-2 
                prose-pre:p-0 prose-pre:my-1 
            dark:prose-invert prose-pre:bg-muted prose-pre:text-muted-foreground">
                  <VueMarkdownRender 
                    :source="part.text" 
                    :options="markdownOptions"
                    :plugins="plugins"
                  />
                </div>
                
                <!-- Tool invocation part -->
                <div v-else-if="part.type === 'tool-invocation'" class="mt-2 p-2 bg-muted rounded text-sm">
                  <div class="font-medium">{{ $t('ai.chat.toolCall') }}</div>
                  <pre class="text-xs mt-1">{{ JSON.stringify(part.toolInvocation, null, 2) }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading indicator -->
        <div v-if="isLoading" class="flex justify-start">
          <div class="px-4 py-2 rounded-lg bg-card text-card-foreground border border-border">
            <div class="flex items-center space-x-2">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span class="text-sm text-muted-foreground">{{ $t('ai.chat.thinking') }}</span>
            </div>
          </div>
        </div>

        <!-- Error message -->
        <div v-if="error" class="flex justify-start">
          <div class="px-4 py-2 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
            <div class="flex items-center justify-between">
              <span class="text-sm">{{ error.message || error }}</span>
              <Button 
                size="sm" 
                variant="ghost"
                @click="() => error = undefined"
              >
                <X class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <!-- Scroll anchor -->
        <div ref="scrollAnchor" />
      </div>
    </div>

    <!-- Fixed form at the bottom -->
    <div class="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t border-border">
      <form @submit="handleSubmit" class="max-w-3xl mx-auto py-4 px-4">
        <div class="border border-border rounded-lg shadow-md bg-card">
          <!-- Input field -->
          <div class="p-3 pb-2">
            <textarea
              v-model="input"
              class="w-full bg-transparent outline-none text-card-foreground placeholder:text-muted-foreground resize-none"
              :placeholder="$t('ai.chat.placeholder')"
              :disabled="isLoading"
              rows="1"
              @keydown="handleKeydown"
              @input="adjustTextareaHeight"
              ref="textareaRef"
            />
          </div>
          
          <!-- Toolbar -->
          <div class="flex items-center justify-between p-2 border-t border-border">
            <!-- Model selector -->
            <div class="flex items-center space-x-2">
              <Select v-model="selectedModel">
                <SelectTrigger class="w-[200px]">
                  <SelectValue :placeholder="$t('ai.chat.providers.title')" />
                </SelectTrigger>
                <SelectContent>
                  <template v-for="(models, provider) in providerModels" :key="provider">
                    <SelectLabel>{{ $t(`ai.chat.providers.${provider}`) }}</SelectLabel>
                    <SelectItem 
                      v-for="model in models" 
                      :key="model" 
                      :value="`${provider}:${model}`"
                    >
                      {{ $t(`ai.chat.models.${model}`) || model }}
                    </SelectItem>
                  </template>
                </SelectContent>
              </Select>
            </div>
            
            <!-- Submit button -->
            <Button 
              type="submit"
              size="icon"
              variant="outline"
              :disabled="!input.trim() || isLoading"
            >
              <Send v-if="!isLoading" class="h-4 w-4" />
              <Loader2 v-else class="h-4 w-4 animate-spin" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, watch } from 'vue'
import { useChat } from '@ai-sdk/vue'
import { Send, X, Loader2 } from 'lucide-vue-next'
import VueMarkdownRender from 'vue-markdown-render'
import markdownItHighlightjs from 'markdown-it-highlightjs'
//import 'vue-markdown-render/dist/style.css'

// SEO and metadata
const { t: $t } = useI18n()

useSeoMeta({
  title: $t('ai.metadata.title'),
  description: $t('ai.metadata.description'),
  keywords: $t('ai.metadata.keywords')
})

// Local reactive data
const selectedModel = ref('openai:gpt-4o')
const messagesContainer = ref<HTMLElement>()
const scrollAnchor = ref<HTMLElement>()
const textareaRef = ref<HTMLTextAreaElement>()

// Provider models configuration
const providerModels = {
  openai: ['gpt-4o', 'gpt-3.5-turbo', 'gpt-3.5'],
  qwen: ['qwen-max', 'qwen-plus', 'qwen-turbo'],
  deepseek: ['deepseek-chat', 'deepseek-coder'],
}
const plugins = [markdownItHighlightjs]

// Markdown rendering options
const markdownOptions = {
  html: false,
  breaks: true,
  linkify: true,
  typographer: true,
  highlight: (str: string, lang: string) => {
    // Simple highlighting - you can enhance this with a proper highlighter
    return `<pre><code class="language-${lang}">${str}</code></pre>`
  }
}
const initialMessages: any[] = [
    { id: '1', content: '你好，我是Grok，一个AI助手。', role: 'user' },
    { id: '2', content: `# Hello, Markdown!
This is a **bold** text with some *italic* content.

- Item 1  
- Item 2

\`\`\`javascript
console.log("Code block");
\`\`\`
`, role: 'assistant' },
  ];

// Use the AI SDK's useChat hook
const { 
  messages, 
  input, 
  handleSubmit: originalHandleSubmit, 
  isLoading, 
  error, 
  reload 
} = useChat({
  api: '/api/chat',
  body: computed(() => {
    const [provider, model] = selectedModel.value.split(':')
    return { provider, model }
  }),
  onError: (error) => {
    console.error('Chat error:', error)
  },
  initialMessages
})

// Auto-scroll to bottom
const scrollToBottom = async () => {
  await nextTick()
  scrollAnchor.value?.scrollIntoView({ behavior: 'smooth' })
}

// Enhanced form submission with custom body
const handleSubmit = (event: Event) => {
  event.preventDefault()
  if (!input.value.trim() || isLoading.value) return
  
  // Reset textarea height
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }

  // Use the original handleSubmit from useChat
  originalHandleSubmit(event)
  
  // Scroll to bottom after submission
  nextTick(() => scrollToBottom())
}

// Handle keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSubmit(event)
  }
}

// Auto-resize textarea
const adjustTextareaHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 120) + 'px'
  }
}

// Watch for messages changes to auto-scroll
watch(messages, scrollToBottom, { deep: true })

// Initialize on mount
onMounted(() => {
  // Focus on input
  if (textareaRef.value) {
    textareaRef.value.focus()
  }
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