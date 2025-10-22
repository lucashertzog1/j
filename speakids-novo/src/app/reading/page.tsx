
'use client';
import { useState, useCallback, ChangeEvent, useMemo, useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClickableText, TranslationCacheProvider } from "@/components/clickable-text";
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, BookCopy, ChevronsRight, UploadCloud, ArrowLeft, ArrowRight, WandSparkles, Send, FileCheck2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchNewStory, handleTranslationEvaluation } from '@/app/actions';
import type { StoryGeneratorOutput, StoryGeneratorInput } from '@/ai/flows/story-generator-flow';
import type { EvaluateTranslationOutput } from '@/ai/schemas/translation-schema';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';


type Difficulty = StoryGeneratorInput['difficulty'];
type Length = StoryGeneratorInput['length'];

interface CustomText {
  title: string;
  content: string;
}

const WORDS_PER_PAGE = 250;

const FileUploader = ({ onTextUpload }: { onTextUpload: (text: CustomText) => void }) => {
    const { toast } = useToast();

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== 'text/plain') {
            toast({
                variant: 'destructive',
                title: 'Tipo de arquivo inválido',
                description: 'Por favor, selecione um arquivo .txt.',
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const textContent = e.target?.result as string;
            onTextUpload({ title: file.name, content: textContent });
        };
        reader.onerror = () => {
             toast({
                variant: 'destructive',
                title: 'Erro de Leitura',
                description: 'Não foi possível ler o arquivo selecionado.',
            });
        }
        reader.readAsText(file);
    };

    return (
        <div className="text-center p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center h-full">
            <UploadCloud className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Carregue seu Arquivo de Texto</h3>
            <p className="text-muted-foreground mb-4">Arraste e solte ou clique para selecionar um arquivo .txt</p>
            <Button asChild variant="outline">
                <label htmlFor="file-upload" className="cursor-pointer">
                    Selecionar Arquivo
                    <input id="file-upload" type="file" className="sr-only" accept=".txt" onChange={handleFileChange} />
                </label>
            </Button>
        </div>
    );
};

// Component to render paginated text content
const PaginatedTextRenderer = ({ content }: { content: CustomText }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const pages = useMemo(() => {
    const words = content.content.split(/\s+/);
    const chunks = [];
    for (let i = 0; i < words.length; i += WORDS_PER_PAGE) {
      chunks.push(words.slice(i, i + WORDS_PER_PAGE).join(' '));
    }
    return chunks;
  }, [content]);

  const totalPages = pages.length;

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
  };

  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  };
  
  return (
    <TranslationCacheProvider>
      <CardContent>
        <ClickableText>
          <p>{pages[currentPage]}</p>
        </ClickableText>
      </CardContent>
      {totalPages > 1 && (
        <div className="p-6 pt-0 flex items-center justify-between">
          <Button variant="outline" onClick={goToPrevPage} disabled={currentPage === 0}>
            <ArrowLeft className="mr-2"/>
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {currentPage + 1} de {totalPages}
          </span>
          <Button variant="outline" onClick={goToNextPage} disabled={currentPage === totalPages - 1}>
            Próxima
            <ArrowRight className="ml-2"/>
          </Button>
        </div>
      )}
    </TranslationCacheProvider>
  )
};

const TranslationPractice = ({ story }: { story: StoryGeneratorOutput }) => {
    const [state, formAction] = useActionState(handleTranslationEvaluation, null);
    const formRef = useRef<HTMLFormElement>(null);
    const { pending } = useFormStatus();

    const evaluationResult = state && 'accuracy' in state ? state : null;
    const error = state && 'error' in state ? state.error : null;

    return (
        <div className="mt-4 p-4 border-t">
            <form action={formAction} ref={formRef}>
                 <Label htmlFor="user-translation" className="text-base font-semibold">Tente traduzir o texto para o português</Label>
                 <Textarea 
                    id="user-translation"
                    name="userTranslation"
                    rows={5}
                    className="mt-2"
                    placeholder="Escreva sua tradução aqui..."
                    required
                 />
                 <input type="hidden" name="originalText" value={story.content} />
                 <input type="hidden" name="referenceTranslation" value={story.translation || ''} />
                 <Button type="submit" className="mt-2" disabled={pending}>
                    {pending ? <Loader2 className="mr-2 animate-spin" /> : <FileCheck2 className="mr-2" />}
                    Avaliar minha tradução
                 </Button>
            </form>
             {error && <p className="text-sm text-destructive mt-2">{error}</p>}
             {evaluationResult && (
                <Alert className="mt-4 animate-in fade-in-50">
                    <WandSparkles className="h-4 w-4" />
                    <AlertTitle className="font-bold">Análise da Tradução</AlertTitle>
                    <AlertDescription>
                        <div className="space-y-3">
                            <p>{evaluationResult.feedback}</p>
                             <div className="space-y-1">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-medium">Precisão</span>
                                    <span>{evaluationResult.accuracy}%</span>
                                </div>
                                <Progress value={evaluationResult.accuracy} className="h-2" />
                            </div>
                        </div>
                    </AlertDescription>
                </Alert>
             )}
        </div>
    );
};


export default function ReadingPage() {
  const { toast } = useToast();
  const [story, setStory] = useState<StoryGeneratorOutput | null>(null);
  const [customText, setCustomText] = useState<CustomText | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPractice, setShowPractice] = useState(false);

  // Story generation options
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [length, setLength] = useState<Length | null>(null);

  const getNewStory = useCallback(async () => {
    if (!difficulty || !length) {
      toast({
        variant: 'destructive',
        title: 'Opções Faltando',
        description: 'Por favor, selecione a dificuldade e o tamanho da história.',
      });
      return;
    }

    setIsLoading(true);
    setStory(null);
    setCustomText(null);
    setShowPractice(false);

    try {
      const newStory = await fetchNewStory({ 
        difficulty, 
        length,
        translateTo: 'Portuguese',
      });
      setStory(newStory);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Falha ao gerar história',
        description: error.message || 'Ocorreu um erro inesperado.',
      });
      setStory(null);
    } finally {
      setIsLoading(false);
    }
  }, [toast, difficulty, length]);

  const handleCustomTextUpload = (text: CustomText) => {
    setCustomText(text);
    setStory(null);
    setShowPractice(false);
  };
  
  const resetView = () => {
    setStory(null);
    setCustomText(null);
    setShowPractice(false);
  }

  const renderInitialState = () => (
     <Card className="max-w-2xl mx-auto w-full text-left bg-white/80 backdrop-blur-sm border-2 border-white/50 animate-in fade-in-50">
        <CardHeader className="p-6 text-center">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
              <BookCopy className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold font-headline">Prática de Leitura</CardTitle>
          <CardDescription className="mt-2">
            Gere uma nova história ou carregue seu próprio texto para praticar.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 pt-0">
          <Tabs defaultValue="generate">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate">Gerar História</TabsTrigger>
              <TabsTrigger value="upload">Ler meu Texto</TabsTrigger>
            </TabsList>
            <TabsContent value="generate" className="pt-6 flex flex-col gap-6">
                <div className='space-y-3'>
                    <Label className='text-base font-semibold'>1. Escolha a Dificuldade</Label>
                    <ToggleGroup type="single" onValueChange={(val: Difficulty) => setDifficulty(val)} value={difficulty || undefined} className="grid grid-cols-3">
                      <ToggleGroupItem value="Beginner" aria-label="Beginner">Iniciante</ToggleGroupItem>
                      <ToggleGroupItem value="Intermediate" aria-label="Intermediate">Intermediário</ToggleGroupItem>
                      <ToggleGroupItem value="Advanced" aria-label="Advanced">Avançado</ToggleGroupItem>
                    </ToggleGroup>
                </div>
                <div className='space-y-3'>
                     <Label className='text-base font-semibold'>2. Escolha o Tamanho</Label>
                    <ToggleGroup type="single" onValueChange={(val: Length) => setLength(val)} value={length || undefined} className="grid grid-cols-3">
                      <ToggleGroupItem value="Short" aria-label="Short">Curta</ToggleGroupItem>
                      <ToggleGroupItem value="Medium" aria-label="Medium">Média</ToggleGroupItem>
                      <ToggleGroupItem value="Long" aria-label="Long">Longa</ToggleGroupItem>
                    </ToggleGroup>
                </div>
                <Button size="lg" onClick={getNewStory} disabled={isLoading || !difficulty || !length}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <ChevronsRight className="mr-2 h-5 w-5" />
                  )}
                  Gerar História
                </Button>
            </TabsContent>
            <TabsContent value="upload" className="pt-6">
                <FileUploader onTextUpload={handleCustomTextUpload} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
  );

  const renderContentContainer = () => {
    if (customText) {
        return <PaginatedTextRenderer content={customText} />
    }
    if (story) {
        return (
            <TranslationCacheProvider>
                <CardContent>
                    <ClickableText>
                        <p>{story.content}</p>
                    </ClickableText>
                </CardContent>
                {story.translation && (
                    <div className="p-6 pt-0">
                       <Button variant="outline" onClick={() => setShowPractice(s => !s)}>
                           {showPractice ? 'Esconder exercício' : 'Tente Traduzir'}
                       </Button>
                       {showPractice && <TranslationPractice story={story} />}
                    </div>
                )}
            </TranslationCacheProvider>
        )
    }
    return null;
  }

  const renderStoryContainer = () => {
    const content = story || customText;
    if (!content) return null;

    return (
       <div className="space-y-6 w-full animate-in fade-in-50">
         <Card className="max-w-4xl mx-auto w-full bg-white/80 backdrop-blur-sm border-2 border-white/50">
            <CardHeader>
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                    <CardTitle>{content.title}</CardTitle>
                    {story && <Badge variant="secondary" className="text-base mt-2">{story.level}</Badge>}
                </div>
              </div>
            </CardHeader>
            
            {renderContentContainer()}

        </Card>
        <div className="flex justify-center">
             <Button 
                onClick={resetView} 
                disabled={isLoading}
                variant="outline"
                className="bg-white/80"
            >
                <RefreshCw className="mr-2" />
                Começar de Novo
            </Button>
        </div>
       </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 py-8 items-center">
       <div className="space-y-2 text-center">
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-white drop-shadow-lg">Prática de Leitura</h1>
        <p className="text-white/90 drop-shadow-md">Leia uma nova história e clique em qualquer palavra para ver a tradução.</p>
      </div>
      
      <div className="w-full flex justify-center items-start min-h-[40rem]">
        {isLoading ? (
            <div className="flex flex-col items-center gap-4 text-white/90">
                 <Loader2 className="w-12 h-12 animate-spin" />
                 <p>Gerando uma nova história para você...</p>
            </div>
        ) : (story || customText) ? renderStoryContainer() : renderInitialState()}
      </div>
    </div>
  );
}
