
'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PandaLogo } from './panda-logo';
import { handleAiQuery } from '@/app/actions';
import { Sparkles, Send } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { ClickableText } from './clickable-text';

type Message = {
  sender: 'user' | 'ai';
  text: string;
};

export function AiAssistantSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const query = formData.get('query') as string;

    if (!query || isLoading) return;

    setIsLoading(true);
    // Add user's question to the message history immediately for better UX
    setMessages(prev => [...prev, { sender: 'user', text: query }]);
    formRef.current?.reset();

    const result = await handleAiQuery(query);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Oops! Algo deu errado.',
        description: result.error,
      });
      // Optionally remove the user's message if the query fails
      setMessages(prev => prev.slice(0, -1));
    }

    if (result.answer) {
      setMessages(prev => [...prev, { sender: 'ai', text: result.answer as string }]);
    }
    
    setIsLoading(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader className="text-left">
          <SheetTitle className='flex items-center gap-2'>
            <PandaLogo /> Assistente de Estudos
          </SheetTitle>
          <SheetDescription>
            Tem uma dúvida de inglês? Pergunte ao nosso assistente!
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 flex flex-col gap-4 py-4 min-h-0">
          <ScrollArea className="flex-1 rounded-md border p-4 bg-muted/50">
            {messages.length > 0 ? (
                <div className="space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sender === 'user' ? 'text-right' : 'text-left'}>
                       <span className={`inline-block p-2 rounded-lg ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                         <ClickableText text={msg.text} className="text-sm" />
                       </span>
                    </div>
                ))}
                {isLoading && (
                  <div className="text-left">
                     <span className="inline-block p-2 rounded-lg bg-background">
                       <Sparkles className="h-4 w-4 animate-spin" />
                     </span>
                  </div>
                )}
                </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <Sparkles className="w-10 h-10 mb-2" />
                <p>A resposta do assistente aparecerá aqui.</p>
              </div>
            )}
          </ScrollArea>
        </div>
        <SheetFooter>
          <form ref={formRef} onSubmit={handleFormSubmit} className="w-full flex items-center gap-2">
            <Input name="query" placeholder="Ex: Qual a diferença entre 'in' e 'on'?" disabled={isLoading} />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                  <Sparkles className="h-4 w-4 animate-spin" />
              ) : (
                  <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Perguntar</span>
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

    