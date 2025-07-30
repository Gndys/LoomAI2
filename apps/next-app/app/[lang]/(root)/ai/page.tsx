'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight'
import { useChat } from '@ai-sdk/react';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/use-translation';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
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
  const { messages, input, handleInputChange, handleSubmit: originalHandleSubmit, setMessages } = useChat({
    initialMessages
  });
  const [provider, setProvider] = useState<keyof typeof providerModels>('qwen');
  const [model, setModel] = useState('qwen-turbo');
  const [hasSubscription, setHasSubscription] = useState(true); // 默认允许，避免闪烁
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      console.error('Failed to check subscription status:', error);
      setHasSubscription(false);
    }
  };

  // New conversation function  
  const startNewConversation = () => {
    // Reset messages to initial state
    setMessages([]);
  };

  // Enhanced form submission with subscription check
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;
    
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
    
    // Use the original handleSubmit from useChat
    originalHandleSubmit(event, { body: { provider, model } });
  };

  // Auto-scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Trigger scroll when messages change and check subscription on mount
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
            <div>
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
      
      {/* Scrollable messages area */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-3xl mx-auto py-6 px-4 space-y-4">
          {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-muted-foreground text-sm">
              {t.ai.chat.welcomeMessage}
            </div>
          </div>
          )}
          { messages.length > 0 && messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`px-2 py-1 rounded-sm shadow-sm border ${
                  message.role === 'user'
                    ? 'bg-secondary text-secondary-foreground border-secondary'
                    : 'bg-card text-card-foreground border-border'
                }`}
              >
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case 'text':
                      return <div className="prose prose-headings:my-2 prose-li:my-0 prose-ul:my-1 prose-p:my-2 
                prose-pre:p-0 prose-pre:my-1 
            dark:prose-invert prose-pre:bg-muted prose-pre:text-muted-foreground" key={`${message.id}-${i}`}>
                          <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{part.text}</ReactMarkdown>
                        </div>;
                    default:
                      return null;
                  }
                })}
              </div>
            </div>
          ))}
          {/* Empty div for scrolling reference */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed form at the bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto py-4 px-4">
          <div className="border border-border rounded-lg shadow-md bg-card">
            {/* Input field */}
            <div className="p-3 pb-2">
              <input
                className="w-full bg-transparent outline-none text-card-foreground placeholder:text-muted-foreground"
                value={input}
                placeholder={t.ai.chat.placeholder}
                onChange={handleInputChange}
              />
            </div>
            
            {/* Toolbar */}
            <div className="flex items-center justify-between p-2 border-t border-border">
              {/* Model selector */}
              <div className="flex items-center">
                <Select 
                  value={`${provider}:${model}`}
                  onValueChange={(value) => {
                    const [selectedProvider, selectedModel] = value.split(':');
                    setProvider(selectedProvider as keyof typeof providerModels);
                    setModel(selectedModel);
                  }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Model" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(providerModels).map(([prov, models]) => (
                      <SelectGroup key={prov}>
                        <SelectLabel>{prov.charAt(0).toUpperCase() + prov.slice(1)}</SelectLabel>
                        {models.map((mod: string) => (
                          <SelectItem key={mod} value={`${prov}:${mod}`}>{mod}</SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Submit button */}
              <Button 
                type="submit"
                size="icon"
                variant="outline"
                className="size-8"
                disabled={!input.trim()}
              >
                <Send/>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
    </>
  );
} 