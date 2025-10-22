
'use client';
import * as React from 'react';
import { useState, useCallback, useRef, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Loader2, Check, X, RefreshCw, Wand2, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { completeActivity, speakText } from '@/app/actions';
import { cn } from '@/lib/utils';
import type { ChallengeGeneratorInput } from '@/ai/flows/challenge-generator-flow';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { generateChallenge } from '@/ai/flows/challenge-generator-flow';

type GameState = 'idle' | 'loading' | 'playing' | 'correct' | 'lost';
type Difficulty = ChallengeGeneratorInput['difficulty'];

export default function ChallengeGeneratorPage() {
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>('idle');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [correctWord, setCorrectWord] = useState<string>('');
  const [userGuess, setUserGuess] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [isSoundPending, setIsSoundPending] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [attempts, setAttempts] = useState(0);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [hintsUsed, setHintsUsed] = useState(0);

  const blurLevel = useMemo(() => Math.max(0, 24 - attempts * 8), [attempts]);

  const startNewChallenge = useCallback(async (selectedDifficulty: Difficulty) => {
    if (!selectedDifficulty) return;
    setDifficulty(selectedDifficulty);
    setGameState('loading');
    setUserGuess('');
    setAttempts(0);
    setRevealedIndices(new Set());
    setHintsUsed(0);
    try {
      const challenge = await generateChallenge({ difficulty: selectedDifficulty });
      setImageUrl(challenge.imageUrl);
      setCorrectWord(challenge.word);
      setGameState('playing');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Falha ao carregar desafio', description: error.message });
      setGameState('idle');
    }
  }, [toast]);

  const handlePlaySound = useCallback(async (text: string) => {
    if (!text || isSoundPending) return;
    setIsSoundPending(true);
    try {
      const { audioData, error } = await speakText(text);
      if (error) {
        toast({ variant: 'destructive', title: 'Erro de Áudio', description: error });
      } else if (audioData && audioRef.current) {
        audioRef.current.src = audioData;
        audioRef.current.play().catch(e => console.error("Falha na reprodução do áudio:", e));
      }
    } finally {
      setIsSoundPending(false);
    }
  }, [toast, isSoundPending]);

  const handleGuessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userGuess.trim()) return;

    const isCorrect = userGuess.trim().toLowerCase() === correctWord.toLowerCase();

    if (isCorrect) {
      setGameState('correct');
      await completeActivity();
      handlePlaySound('Correct, great job!');
    } else {
      setAttempts(prev => prev + 1);
      toast({ variant: 'destructive', title: "Não foi dessa vez!", description: "A imagem está um pouco mais nítida agora."});
      if (attempts >= 2) { // 3 total attempts (0, 1, 2)
        setGameState('lost');
        handlePlaySound('Not quite, try another one!');
        toast({ variant: 'destructive', title: "Essa foi difícil!", description: `A palavra correta era: "${correctWord}"` });
      }
    }
  };

  const handleHint = async () => {
      const unrevealed = Array.from(Array(correctWord.length).keys())
                              .filter(i => !revealedIndices.has(i) && correctWord[i] !== ' ');
      
      if(unrevealed.length === 0) return;

      setHintsUsed(prev => prev + 1);
      
      const revealCount = Math.max(1, Math.floor(unrevealed.length * 0.25));
      
      const indicesToReveal = new Set(revealedIndices);
      for(let i = 0; i < revealCount; i++) {
          if(unrevealed.length === 0) break;
          const randomIndex = Math.floor(Math.random() * unrevealed.length);
          const selectedIndex = unrevealed.splice(randomIndex, 1)[0];
          indicesToReveal.add(selectedIndex);
      }
      setRevealedIndices(indicesToReveal);
      toast({ title: 'Dica Desbloqueada!', description: `Algumas letras foram reveladas.`});
  }


  const renderInitialState = () => (
    <div className="text-center space-y-6 animate-in fade-in-50">
        <div className="flex justify-center">
            <Wand2 className="w-16 h-16 text-primary" />
        </div>
      <CardTitle>Desafio da Imagem</CardTitle>
      <CardDescription>Escolha uma dificuldade para começar um novo desafio!</CardDescription>
      <div className='p-4 flex flex-col sm:flex-row gap-4 justify-center'>
        <Button onClick={() => startNewChallenge('Easy')} size="lg">Fácil</Button>
        <Button onClick={() => startNewChallenge('Medium')} size="lg" variant="outline">Médio</Button>
        <Button onClick={() => startNewChallenge('Hard')} size="lg" variant="destructive">Difícil</Button>
      </div>
    </div>
  );

  const renderGameTerminalState = () => (
     <div className={cn(
        "text-center space-y-4 p-4 rounded-lg w-full animate-in fade-in-50",
        gameState === 'correct' ? "bg-green-100 dark:bg-green-900/50" : "bg-red-100 dark:bg-red-900/50"
      )}>
        <h2 className={cn(
          "text-2xl font-bold",
          gameState === 'correct' ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
        )}>
          {gameState === 'correct' ? <Check className="mx-auto w-12 h-12" /> : <X className="mx-auto w-12 h-12" />}
          {gameState === 'correct' ? "Você acertou!" : "Boa tentativa!"}
        </h2>
        <p className="text-lg">A palavra era <strong className="capitalize">{correctWord}</strong>.</p>
        <Button onClick={() => difficulty && startNewChallenge(difficulty)} size="lg" variant="outline" className="bg-white/50">
           <RefreshCw className="mr-2"/>
           Jogar Novamente
        </Button>
      </div>
  )

  const renderPlayingState = () => (
    <>
        <div id="image-container" className="w-full aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
        {imageUrl && (
            <Image 
                src={imageUrl} 
                alt="Imagem gerada por IA para jogo de adivinhação" 
                width={500} 
                height={500} 
                className="transition-all duration-500 ease-in-out object-cover w-full h-full"
                style={{ filter: `blur(${blurLevel}px)`}}
            />
        )}
        </div>
        <div id="hint-letters" className="flex items-center justify-center flex-wrap gap-1.5 h-10">
            {correctWord.split('').map((char, index) => (
                <div key={index} className="flex items-center justify-center size-8 bg-muted rounded">
                    <span className="text-xl font-bold">
                      {char === ' ' ? '\u00A0' : revealedIndices.has(index) ? char.toUpperCase() : '_'}
                    </span>
                </div>
            ))}
        </div>
        <form onSubmit={handleGuessSubmit} className="w-full flex flex-col items-center gap-4">
        <Input
            id="guess-input"
            type="text"
            value={userGuess}
            onChange={(e) => setUserGuess(e.target.value)}
            placeholder="Qual é a palavra?"
            className="text-center text-lg h-12"
            disabled={gameState !== 'playing'}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
        />
        <div className="flex gap-2">
            <Button id="submit-button" type="submit" size="lg" disabled={!userGuess}>
                <Check className="mr-2"/>
                Enviar Palpite
            </Button>
             <Button id="hint-button" type="button" size="lg" variant="outline" onClick={handleHint} disabled={revealedIndices.size >= correctWord.replace(/ /g, '').length}>
                <Lightbulb className="mr-2"/>
                Dica
            </Button>
        </div>
        </form>
    </>
  )

  const renderContent = () => {
    switch(gameState) {
      case 'loading':
        return <Loader2 className="w-12 h-12 text-primary animate-spin" />;
      case 'playing':
        return renderPlayingState();
      case 'correct':
      case 'lost':
        return renderGameTerminalState();
      case 'idle':
      default:
        return renderInitialState();
    }
  }

  return (
    <div className="py-8 flex flex-col items-center gap-4">
      <div className="text-center w-full max-w-lg relative">
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-white drop-shadow-lg">Desafio da Imagem</h1>
        <p className="text-white/90 drop-shadow-md">Adivinhe a palavra da imagem borrada!</p>
        <div className="absolute top-0 right-0">
          <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">Ajuda</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Como Jogar o Desafio da Imagem</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2 text-left">
                    <div>1. Uma imagem gerada por IA aparecerá borrada.</div>
                    <div>2. Seu objetivo é adivinhar o que é a imagem. Você tem 3 tentativas.</div>
                    <div>3. A cada palpite errado, a imagem ficará um pouco mais nítida, te dando uma dica melhor.</div>
                    <div>4. Se precisar, use o botão "Dica" para revelar algumas letras da palavra correta. Mas cuidado, usar dicas pode custar pontos!</div>
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogAction>Entendi!</AlertDialogAction>
            </AlertDialogContent>
        </AlertDialog>
        </div>
      </div>

      <Card className="w-full max-w-lg min-h-[600px] flex items-center justify-center bg-white/80 backdrop-blur-sm border-2 border-white/50 relative">
        <CardContent className="flex flex-col items-center gap-6 w-full p-6">
          {renderContent()}
        </CardContent>
      </Card>
      
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}

    