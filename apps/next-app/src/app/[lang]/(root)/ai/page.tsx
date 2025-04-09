'use client';

import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()
  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState('gpt-4o');

  const providerModels = {
    openai: ['gpt-4o', 'gpt-3.5', 'gpt-3'],
    qwen: ['qwen-max', 'qwen-plus', 'qwen-turbo'],
    deepseek: ['deepseek-chat', 'deepseek-coder'],
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <Select onValueChange={(value) => {
        const [selectedProvider, selectedModel] = value.split(':');
        setProvider(selectedProvider);
        setModel(selectedModel);
      }}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a provider and model" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(providerModels).map(([prov, models]) => (
            <SelectGroup key={prov}>
              <SelectLabel>{prov.charAt(0).toUpperCase() + prov.slice(1)}</SelectLabel>
              {models.map((mod) => (
                <SelectItem key={mod} value={`${prov}:${mod}`}>{mod}</SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>

      {messages.map((message) => (
        <div key={message.id} className="whitespace-pre-wrap">
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.parts.map((part, i) => {
            switch (part.type) {
              case 'text':
                return <div key={`${message.id}-${i}`}>{part.text}</div>;
            }
          })}
        </div>
      ))}

      <form onSubmit={(e) => handleSubmit(e, { body: { provider, model } })} className="mt-4">
        <input
          className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
} 