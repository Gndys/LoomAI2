'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { MessageSquareIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/use-translation';
import { Button } from '@/components/ui/button';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageContent,
  MessageAvatar,
} from '@/components/ai-elements/message';
import { Response } from '@/components/ai-elements/response';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputSubmit,
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectValue,
} from '@/components/ai-elements/prompt-input';
import '@/app/highlight.css'

export default function Chat() {
  const { t, locale } = useTranslation();
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
  const { messages, append, setMessages, status } = useChat({
    initialMessages
  });
  const [provider, setProvider] = useState<keyof typeof providerModels>('qwen');
  const [model, setModel] = useState('qwen-turbo');
  const [hasSubscription, setHasSubscription] = useState(true); // 默认允许，避免闪烁

  const providerModels = {
    qwen: ['qwen-max', 'qwen-plus', 'qwen-turbo'],
    deepseek: ['deepseek-chat', 'deepseek-coder'],
  };

  // Check user subscription status once on page load
  const checkSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/subscription/status', {
        method: 'GET'
      });
      const data = await response.json();
      setHasSubscription(data && data.hasSubscription);
    } catch (error) {
      // Handle both network errors and JSON parsing errors (like 401 Unauthorized)
      console.warn('Subscription check failed, setting to false');
      setHasSubscription(false);
    }
  };

  // New conversation function
  const startNewConversation = () => {
    // Reset messages to initial state
    setMessages([]);
  };

  // Enhanced form submission with subscription check for PromptInput
  const handlePromptSubmit = async (message: { text?: string; files?: any[] }) => {
    if (!message.text?.trim()) return;

    // Check subscription status (cached from page load)
    if (!hasSubscription) {
      // Show permission denied toast
      toast.error(t.ai.chat.errors.subscriptionRequired, {
        description: t.ai.chat.errors.subscriptionRequiredDescription,
        action: {
          label: t.common.viewPlans,
          onClick: () => {
            // Navigate to pricing page
            window.location.href = `/${locale}/pricing`;
          }
        }
      });
      return;
    }

    // Use append from useChat with provider and model info
    await append({
      role: 'user',
      content: message.text,
    }, {
      body: { provider, model }
    });
  };

  // Check subscription on mount
  // Note: Scrolling is now handled automatically by AI Elements Conversation component

  useEffect(() => {
    // Check subscription status once on page load
    checkSubscriptionStatus();
  }, []);
  return (
    <>
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-3xl mx-auto py-4 px-4">
          <div className="flex items-center justify-between">
            <div className='mr-4'>
              <h1 className="text-xl font-semibold text-foreground">{t.ai.chat.title}</h1>
              <p className="text-sm text-muted-foreground">{t.ai.chat.description}</p>
            </div>
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={startNewConversation}
              >
                {t.ai.chat.actions.newChat}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* AI Elements Conversation Container */}
      <Conversation className="flex-1 pb-24">
        <ConversationContent className="max-w-3xl mx-auto space-y-4 pb-24">
          {messages.length === 0 ? (
            <ConversationEmptyState
              title={t.ai.chat.welcomeMessage}
              description={t.ai.chat.description}
              icon={<MessageSquareIcon className="size-6" />}
            />
          ) : (
            messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <MessageContent>
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case 'text':
                        return (
                          <Response key={`${message.id}-${i}`}>
                            {part.text}
                          </Response>
                        );
                      default:
                        return null;
                    }
                  })}
                </MessageContent>
                <MessageAvatar
                  src={message.role === 'user' ? '/user-avatar.png' : '/ai-avatar.png'}
                  name={message.role === 'user' ? 'User' : 'AI'}
                />
              </Message>
            ))
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* AI Elements PromptInput */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-sm p-4 pb-safe">
        <div className="max-w-3xl mx-auto">
          <PromptInput onSubmit={handlePromptSubmit}>
            <PromptInputTextarea placeholder={t.ai.chat.placeholder} />
            
            <PromptInputToolbar>
              <PromptInputTools>
                {/* Model selector */}
                <PromptInputModelSelect
                  value={`${provider}:${model}`}
                  onValueChange={(value) => {
                    const [selectedProvider, selectedModel] = value.split(':');
                    setProvider(selectedProvider as keyof typeof providerModels);
                    setModel(selectedModel);
                  }}
                >
                  <PromptInputModelSelectTrigger>
                    <PromptInputModelSelectValue placeholder="Select Model" />
                  </PromptInputModelSelectTrigger>
                  <PromptInputModelSelectContent>
                    {Object.entries(providerModels).map(([prov, models], index) => (
                      <div key={prov}>
                        {index > 0 && <div className="h-px bg-border my-1" />}
                        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {prov.charAt(0).toUpperCase() + prov.slice(1)}
                        </div>
                        {models.map((mod: string) => (
                          <PromptInputModelSelectItem key={mod} value={`${prov}:${mod}`}>
                            {mod}
                          </PromptInputModelSelectItem>
                        ))}
                      </div>
                    ))}
                  </PromptInputModelSelectContent>
                </PromptInputModelSelect>
              </PromptInputTools>

              <PromptInputSubmit status={status} />
            </PromptInputToolbar>
          </PromptInput>
        </div>
      </div>
    </div>
    </>
  );
}
