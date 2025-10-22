
'use client';

import * as React from 'react';
import { useState, useRef, MouseEvent, ReactNode, useContext } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Loader2, ChevronDown } from 'lucide-react';
import { translateText } from '@/app/actions';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

type TranslationState = {
  translation: string;
  explanation: string;
  synonyms: string[];
  error?: string | null;
};

type TranslationCache = Record<string, TranslationState>;

const TranslationCacheContext = React.createContext<{
    cache: TranslationCache;
    setCache: React.Dispatch<React.SetStateAction<TranslationCache>>;
} | null>(null);

export const TranslationCacheProvider = ({ children }: { children: ReactNode }) => {
    const [cache, setCache] = useState<TranslationCache>({});
    return (
        <TranslationCacheContext.Provider value={{ cache, setCache }}>
            {children}
        </TranslationCacheContext.Provider>
    );
};

const useTranslationCache = () => {
    const context = useContext(TranslationCacheContext);
    if (!context) {
        throw new Error('useTranslationCache must be used within a TranslationCacheProvider');
    }
    return context;
};

const PopoverContentBody = ({ word, fullText, onOpenChange }: { word: string, fullText: string, onOpenChange: (open: boolean) => void }) => {
    const { cache, setCache } = useTranslationCache();
    const [translation, setTranslation] = React.useState<TranslationState | null>(cache[word] || null);
    const [isLoading, setIsLoading] = React.useState(!cache[word]);
    const [showDetails, setShowDetails] = React.useState(false);

    React.useEffect(() => {
        const handleTranslate = async (wordToTranslate: string) => {
            if (cache[wordToTranslate]) {
                setTranslation(cache[wordToTranslate]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const cleanedWord = wordToTranslate.replace(/[^a-zA-Z]/g, '');
                if (!cleanedWord) {
                    setTranslation({ translation: '', explanation: '', synonyms: [], error: 'Nenhuma palavra traduzível selecionada.' });
                    return;
                }
                const result = await translateText(cleanedWord, fullText);
                if (result.translation) {
                    setTranslation(result);
                    setCache(prev => ({ ...prev, [wordToTranslate]: result }));
                } else {
                    const errorResult = { translation: '', explanation: '', synonyms: [], error: result.error || "Erro desconhecido." };
                    setTranslation(errorResult);
                    setCache(prev => ({ ...prev, [wordToTranslate]: errorResult }));
                }
            } catch (error) {
                console.error("Falha na tradução", error);
                const errorResult = { translation: '', explanation: '', synonyms: [], error: 'Falha ao buscar tradução.' };
                setTranslation(errorResult);
                setCache(prev => ({ ...prev, [wordToTranslate]: errorResult }));
            } finally {
                setIsLoading(false);
            }
        };

        handleTranslate(word);
    }, [word, fullText, cache, setCache]);


    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }
    
    if (translation?.error) {
        return <p className="text-sm text-center text-destructive p-4">{translation.error}</p>;
    }

    if (!translation) return null;

    return (
        <div className="grid gap-4">
            <div className="space-y-2">
                <h3 className="font-extrabold text-2xl text-primary capitalize">{translation.translation}</h3>
                {!showDetails && (
                    <Button variant="ghost" size="sm" onClick={() => setShowDetails(true)} className="w-full justify-center text-xs">
                        Saber mais
                        <ChevronDown className="w-4 h-4 ml-1" />
                    </Button>
                )}
            </div>

            {showDetails && (
                <div className="space-y-4 animate-in fade-in duration-300">
                    <Separator />
                    <p className="text-sm text-muted-foreground">{translation.explanation}</p>
                    {translation.synonyms && translation.synonyms.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            <span className="text-xs font-semibold text-muted-foreground mt-1">Sinônimos:</span>
                            {translation.synonyms.map((s, i) => <Badge key={i} variant="secondary">{s}</Badge>)}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

const InteractiveText = ({ text }: { text: string }) => {
    return (
        <>
            {text.split(/(\s+)/).map((segment, index) => {
                if (/^\s+$/.test(segment)) {
                    return segment;
                }
                return segment.split(/([,.;!?()"])/).map((wordSegment, i) => {
                    if (!wordSegment) return null;
                    const isWord = /[a-zA-Z]/.test(wordSegment);
                    return (
                        <span 
                            key={`${index}-${i}`} 
                            className={cn(isWord && "cursor-pointer hover:underline decoration-primary/50 decoration-2 underline-offset-2 transition-colors duration-200")}
                        >
                            {wordSegment}
                        </span>
                    );
                });
            })}
        </>
    );
};


export function ClickableText({ children, className }: { children: ReactNode; className?: string }) {
  const [popoverState, setPopoverState] = useState<{ open: boolean; target: HTMLElement | null; word: string; fullText: string; }>({
    open: false,
    target: null,
    word: '',
    fullText: '',
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const handleContainerClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    
    if (target.tagName !== 'SPAN') {
        setPopoverState(prev => ({ ...prev, open: false }));
        return;
    };

    const word = target.textContent || '';
    const cleanedWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
    const fullText = target.closest('p')?.textContent || '';


    if (cleanedWord.length > 0) {
        setPopoverState({
            open: true,
            target: target,
            word: cleanedWord,
            fullText: fullText
        });
    } else {
        setPopoverState(prev => ({ ...prev, open: false }));
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
        setPopoverState(prev => ({ ...prev, open: false }));
    }
  }

  const interactiveChildren = React.Children.map(children, child => {
    if (typeof child === 'string') {
        return <p><InteractiveText text={child} /></p>;
    }
    if (React.isValidElement(child) && typeof child.props.children === 'string') {
        return React.cloneElement(child, {
            ...child.props,
            children: <InteractiveText text={child.props.children} />
        });
    }
    return child;
  });

  return (
    <Popover open={popoverState.open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
             <div 
                style={{
                    position: 'absolute',
                    top: popoverState.target?.offsetTop ?? 0,
                    left: popoverState.target?.offsetLeft ?? 0,
                    width: popoverState.target?.offsetWidth,
                    height: popoverState.target?.offsetHeight,
                    pointerEvents: 'none'
                }}
             />
        </PopoverTrigger>
        
        <div 
            ref={containerRef}
            onClick={handleContainerClick} 
            className={cn('text-lg md:text-xl leading-relaxed select-none space-y-4', className)}
        >
            {interactiveChildren}
        </div>

        <PopoverContent className="w-80 shadow-xl" side="top" align="center">
            {popoverState.word && (
                <PopoverContentBody
                    word={popoverState.word}
                    fullText={popoverState.fullText}
                    onOpenChange={handleOpenChange}
                />
            )}
        </PopoverContent>
    </Popover>
  );
}
