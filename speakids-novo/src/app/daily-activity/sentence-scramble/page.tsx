
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { completeActivity, fetchDailySentence } from '@/app/actions';
import { RefreshCw, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


// Function to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

export default function SentenceScramblePage() {
  const { toast } = useToast();
  const [solution, setSolution] = useState('');
  const [scrambledWords, setScrambledWords] = useState<string[]>([]);
  const [constructedSentence, setConstructedSentence] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const startNewGame = useCallback(async () => {
    setIsLoading(true);
    setConstructedSentence([]);
    setIsCorrect(null);
    try {
        const level = 'A1'; // Default to A1 as cefrLevel is no longer on the user object
        const { sentence } = await fetchDailySentence(level);
        setSolution(sentence);
        
        let words = sentence.split(' ');
        let shuffled = shuffleArray(words);
        // Ensure the shuffled version is not the same as the solution
        while(shuffled.join(' ') === sentence) {
            shuffled = shuffleArray(words);
        }
        
        setScrambledWords(shuffled);
    } catch (error) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar uma nova frase.' });
        setSolution('The quick brown fox jumps over the lazy dog.'); // Fallback
        setScrambledWords(shuffleArray('The quick brown fox jumps over the lazy dog.'.split(' ')));
    } finally {
        setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const handleWordClick = (word: string, index: number) => {
    if (isCorrect !== null) return;
    setConstructedSentence(prev => [...prev, word]);
    setScrambledWords(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleConstructedClick = (word: string, index: number) => {
    if (isCorrect !== null) return;
    setScrambledWords(prev => [...prev, word]);
    setConstructedSentence(prev => prev.filter((_, i) => i !== index));
  };

  const checkSolution = async () => {
    const finalAnswer = constructedSentence.join(' ');
    if (finalAnswer.toLowerCase().replace(/[.']/g, '') === solution.toLowerCase().replace(/[.']/g, '')) {
      setIsCorrect(true);
      toast({ title: 'Correto!', description: 'Mandou bem!', className: 'bg-green-200' });
      await completeActivity();
    } else {
      setIsCorrect(false);
      toast({ variant: 'destructive', description: 'Não está certo. Tente de novo!' });
      setTimeout(() => setIsCorrect(null), 1500);
    }
  };

   if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="py-8 flex flex-col items-center gap-8">
      <div className="text-center w-full max-w-2xl relative">
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-white drop-shadow-lg">Frase Embaralhada</h1>
        <p className="text-white/90 drop-shadow-md">Desembaralhe as palavras para formar la frase correta.</p>
        <div className="absolute top-0 right-0">
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">Ajuda</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Como Jogar Frase Embaralhada</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2 text-left">
                    <div>1. Seu objetivo é colocar as palavras na ordem correta para formar uma frase gramaticalmente correta.</div>
                    <div>2. Clique nos botões de palavras na parte de baixo para adicioná-las à área da frase.</div>
                    <div>3. Se cometer um erro, clique em uma palavra na área da frase para mandá-la de volta ao banco de palavras.</div>
                    <div>4. Quando achar que a frase está correta, clique em "Verificar Resposta".</div>
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogAction>Entendi!</AlertDialogAction>
            </AlertDialogContent>
        </AlertDialog>
        </div>
      </div>

      <Card className="w-full max-w-2xl bg-white/80 backdrop-blur-sm border-2 border-white/50 relative">
        <CardHeader>
          <CardTitle>Construa a Frase</CardTitle>
          <CardDescription>Clique nas palavras na ordem correta.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div 
            id="sentence-area"
            className={cn(
              "w-full min-h-[6rem] p-4 rounded-lg border-2 flex flex-wrap items-center justify-center gap-2",
              isCorrect === true ? 'border-green-500 bg-green-100 dark:bg-green-100/10' : 
              isCorrect === false ? 'border-red-500 bg-red-100 dark:bg-red-100/10' : 'border-dashed'
            )}
          >
            {constructedSentence.map((word, index) => (
                <Button key={index} variant="secondary" className="text-lg cursor-pointer" onClick={() => handleConstructedClick(word, index)}>
                    {word}
                </Button>
            ))}
             {constructedSentence.length === 0 && (
                <p className="text-muted-foreground">Sua frase aparecerá aqui</p>
             )}
          </div>

          <div id="word-bank" className="w-full min-h-[6rem] p-4 flex flex-wrap items-center justify-center gap-2">
            {scrambledWords.map((word, index) => (
                <Button key={index} variant="outline" className="text-lg" onClick={() => handleWordClick(word, index)}>
                    {word}
                </Button>
            ))}
          </div>

          {isCorrect === null ? (
            <Button id="check-button" size="lg" disabled={scrambledWords.length > 0} onClick={checkSolution}>
                <Check className="mr-2"/>
                Verificar Resposta
            </Button>
          ) : (
            <div className="text-center space-y-4">
                <p className={cn("text-2xl font-bold", isCorrect ? 'text-green-600' : 'text-red-600')}>
                    {isCorrect ? "Excelente!" : "Não foi dessa vez!"}
                </p>
                 <Button onClick={startNewGame} size="lg">
                    <RefreshCw className="mr-2"/>
                    Jogar Novamente
                </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    