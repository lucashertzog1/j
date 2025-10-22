
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { completeActivity, speakText } from '@/app/actions';
import { RefreshCw, Loader2, Trophy, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { generateMemoryGameCards } from '@/ai/flows/memory-game-flow';

interface GameCard {
  id: number;
  type: 'word' | 'image';
  content: string; // either word or imageUrl
  pairId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryGamePage() {
  const { toast } = useToast();
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'won'>('loading');
  const [isChecking, setIsChecking] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
  };
  
  const handlePlaySound = useCallback(async (text: string) => {
    if (!text) return;
    try {
      const { audioData, error } = await speakText(text);
      if (error) {
        toast({ variant: 'destructive', title: 'Erro de Áudio', description: error });
      } else if (audioData && audioRef.current) {
        audioRef.current.src = audioData;
        audioRef.current.play().catch(e => console.error("Falha na reprodução do áudio:", e));
      }
    } catch (e) {
      console.error(e);
    }
  }, [toast]);

  const startNewGame = useCallback(async () => {
    setGameState('loading');
    setFlippedCards([]);
    try {
      const { cards: fetchedCards } = await generateMemoryGameCards();
      
      const gameCards: GameCard[] = [];
      fetchedCards.forEach((card, index) => {
        const pairId = card.word;
        gameCards.push({ id: index * 2, type: 'word', content: card.word, pairId, isFlipped: false, isMatched: false });
        gameCards.push({ id: index * 2 + 1, type: 'image', content: card.imageUrl, pairId, isFlipped: false, isMatched: false });
      });
      
      setCards(shuffleArray(gameCards));
      setGameState('playing');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar um novo jogo.' });
      setGameState('playing'); // Fallback to avoid being stuck in loading
    }
  }, [toast]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const handleCardClick = (cardId: number) => {
    if (isChecking || flippedCards.length === 2 || cards.find(c => c.id === cardId)?.isFlipped) {
      return;
    }

    const newCards = cards.map(c => c.id === cardId ? { ...c, isFlipped: true } : c);
    setCards(newCards);
    setFlippedCards(prev => [...prev, cardId]);
  };
  
  const checkMatch = useCallback(async () => {
      if (flippedCards.length !== 2) return;
      
      setIsChecking(true);

      const [firstCard, secondCard] = cards.filter(c => flippedCards.includes(c.id));

      if (firstCard.pairId === secondCard.pairId) {
        // It's a match
        setCards(prevCards => prevCards.map(c => flippedCards.includes(c.id) ? { ...c, isMatched: true } : c));
        setFlippedCards([]);
        handlePlaySound('Match!');
      } else {
        // Not a match
        await new Promise(resolve => setTimeout(resolve, 1200));
        setCards(prevCards => prevCards.map(c => flippedCards.includes(c.id) ? { ...c, isFlipped: false } : c));
        setFlippedCards([]);
      }

      setIsChecking(false);

  }, [flippedCards, cards, handlePlaySound])

  useEffect(() => {
    if (flippedCards.length === 2) {
      checkMatch();
    }
  }, [flippedCards, checkMatch]);

  const allMatched = useMemo(() => cards.length > 0 && cards.every(c => c.isMatched), [cards]);

  useEffect(() => {
    const completeGame = async () => {
        if (allMatched) {
            setGameState('won');
            await completeActivity();
        }
    }
    completeGame();
  }, [allMatched]);

  if (gameState === 'loading') {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="py-8 flex flex-col items-center gap-8">
      <div className="text-center w-full max-w-3xl relative">
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-white drop-shadow-lg">Jogo da Memória</h1>
        <p className="text-white/90 drop-shadow-md">Encontre os pares de palavras e imagens!</p>
        <div className="absolute top-0 right-0">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">Ajuda</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                  <AlertDialogTitle>Como Jogar</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2 text-left">
                      <div>1. Clique em uma carta para virá-la.</div>
                      <div>2. Clique em uma segunda carta para tentar encontrar o par.</div>
                      <div>3. Se a palavra e a imagem corresponderem, você encontrou um par!</div>
                      <div>4. Encontre todos os pares para vencer o jogo.</div>
                  </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogAction>Entendi!</AlertDialogAction>
              </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      {gameState === 'won' ? (
          <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-2 border-white/50 text-center p-8 flex flex-col items-center gap-4">
            <Trophy className="w-20 h-20 text-yellow-400" />
            <h2 className="text-2xl font-bold">Você Venceu!</h2>
            <p className="text-muted-foreground">Você tem uma ótima memória!</p>
            <Button size="lg" onClick={startNewGame}>
                <RefreshCw className="mr-2"/>
                Jogar Novamente
            </Button>
          </Card>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {cards.map(card => (
                <div key={card.id} className="w-24 h-24 sm:w-32 sm:h-32 perspective-1000" onClick={() => handleCardClick(card.id)}>
                    <div className={cn(
                        "relative w-full h-full preserve-3d transition-transform duration-700",
                        card.isFlipped ? "rotate-y-180" : ""
                    )}>
                        {/* Card Back */}
                        <div className="absolute w-full h-full backface-hidden bg-primary rounded-lg flex items-center justify-center cursor-pointer shadow-lg hover:shadow-2xl transition-shadow">
                            <Brain className="w-1/2 h-1/2 text-white/50" />
                        </div>
                        {/* Card Front */}
                        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-card border-2 border-primary/50 rounded-lg flex items-center justify-center p-2 shadow-lg">
                           {card.type === 'word' ? (
                               <span className="text-lg sm:text-xl font-bold text-center">{card.content}</span>
                           ) : (
                               <Image src={card.content} alt="Memory Card Image" width={128} height={128} className="object-cover rounded-md w-full h-full" />
                           )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}
      
      <audio ref={audioRef} className="hidden" />
      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
      `}</style>
    </div>
  );
}

    