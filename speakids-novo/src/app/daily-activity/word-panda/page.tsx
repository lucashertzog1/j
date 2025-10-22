
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { completeActivity, fetchDailyWord } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lightbulb, Loader2, RefreshCw } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


type TileStatus = 'correct' | 'present' | 'absent' | 'empty';

const Keyboard = ({ onKeyPress, letterStatuses }: { onKeyPress: (key: string) => void; letterStatuses: Record<string, TileStatus> }) => {
    const rows = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
        ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
    ];

    const getStatusClass = (letter: string) => {
        switch (letterStatuses[letter.toUpperCase()]) {
            case 'correct': return 'bg-green-500 text-white';
            case 'present': return 'bg-yellow-500 text-white';
            case 'absent': return 'bg-gray-500 text-white opacity-60';
            default: return 'bg-muted hover:bg-accent text-foreground';
        }
    };

    return (
        <div id="keyboard" className="space-y-1.5">
            {rows.map((row, i) => (
                <div key={i} className="flex justify-center gap-1.5">
                    {row.map(key => (
                        <Button
                            key={key}
                            onClick={() => onKeyPress(key)}
                            className={cn('h-12 font-bold uppercase px-3', getStatusClass(key), key.length > 1 ? 'flex-1' : 'w-9')}
                            variant="default"
                            size={key.length > 1 ? 'default' : 'icon'}
                        >
                            {key === 'BACK' ? 'APAGAR' : key}
                        </Button>
                    ))}
                </div>
            ))}
        </div>
    );
};

const WordPandaPage = () => {
    const [solution, setSolution] = useState('');
    const [hint, setHint] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [guesses, setGuesses] = useState<string[]>(Array(6).fill(''));
    const [currentGuessIndex, setCurrentGuessIndex] = useState(0);
    const [currentGuess, setCurrentGuess] = useState('');
    const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
    const { toast } = useToast();
    

    const getTileStatus = useCallback((guess: string, index: number, sol: string): TileStatus => {
        const char = guess[index]?.toUpperCase();
        if (!sol || !char) return 'empty';
        const solutionUpper = sol.toUpperCase();
        if (solutionUpper[index] === char) return 'correct';
        if (solutionUpper.includes(char)) return 'present';
        return 'absent';
    }, []);

    const getTileClass = useCallback((guess: string, index: number, sol: string, isSubmitted: boolean): string => {
        if (!isSubmitted) {
            return 'border-black';
        }
        
        const status = getTileStatus(guess, index, sol);

        switch (status) {
            case 'correct': return 'bg-green-500 text-white border-green-500 rotate-y-180';
            case 'present': return 'bg-yellow-500 text-white border-yellow-500 rotate-y-180';
            case 'absent': return 'bg-gray-500 text-white border-gray-500 rotate-y-180';
            default: return 'border-black';
        }
    }, [getTileStatus]);
    
    const loadNewWord = useCallback(async () => {
        setIsLoading(true);
        setGuesses(Array(6).fill(''));
        setCurrentGuess('');
        setCurrentGuessIndex(0);
        setGameState('playing');
        
        let validWordFound = false;
        let retries = 0;
        while (!validWordFound && retries < 5) {
            try {
                const { word, hint: newHint } = await fetchDailyWord();
                if (word && word.length === 5 && /^[A-Z]+$/.test(word.toUpperCase())) {
                    setSolution(word.toUpperCase());
                    setHint(newHint);
                    validWordFound = true;
                } else {
                    console.warn("IA gerou uma palavra inválida, tentando novamente...", word);
                    retries++;
                }
            } catch (error) {
                console.error("Falha ao buscar nova palavra:", error);
                retries++;
            }
        }

        if (!validWordFound) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível carregar uma nova palavra. Usando uma palavra de reserva.' });
            setSolution('PANDA');
            setHint('Um urso preto e branco da China.');
        }

        setIsLoading(false);
    }, [toast]);
    
    useEffect(() => {
        loadNewWord();
    }, [loadNewWord]);
    
    const letterStatuses = useMemo(() => {
        const statuses: Record<string, TileStatus> = {};
        guesses.forEach((guess, i) => {
            if (i < currentGuessIndex) {
                 for (let j = 0; j < guess.length; j++) {
                    const char = guess[j].toUpperCase();
                    const status = getTileStatus(guess, j, solution);
                    if (!statuses[char] || statuses[char] !== 'correct') {
                        statuses[char] = status;
                    }
                }
            }
        });
        return statuses;
    }, [guesses, currentGuessIndex, solution, getTileStatus]);


    const handleKeyPress = useCallback(async (key: string) => {
        if (gameState !== 'playing' || isLoading) return;

        if (key === 'ENTER') {
            if (currentGuess.length !== 5) {
                toast({ variant: 'destructive', description: 'Letras insuficientes!' });
                return;
            }
            
            const newGuesses = [...guesses];
            newGuesses[currentGuessIndex] = currentGuess.toUpperCase();
            setGuesses(newGuesses);
            
            const newCurrentGuessIndex = currentGuessIndex + 1;
            
            if (currentGuess.toUpperCase() === solution) {
                setGameState('won');
                toast({ title: "Você venceu!", description: "Ótimo trabalho!", className: "bg-green-200" });
                await completeActivity();
            } else if (newCurrentGuessIndex === 6) {
                setGameState('lost');
                toast({ variant: 'destructive', title: "Fim de Jogo", description: `A palavra era: ${solution}` });
            }
            
            setCurrentGuessIndex(newCurrentGuessIndex);
            setCurrentGuess('');
            return;
        }

        if (key === 'BACK' || key === 'APAGAR') {
            setCurrentGuess(currentGuess.slice(0, -1));
            return;
        }

        if (currentGuess.length < 5 && /^[A-Z]$/.test(key)) {
            setCurrentGuess(currentGuess + key);
        }
    }, [gameState, currentGuess, toast, guesses, currentGuessIndex, solution, isLoading]);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) return;
            let key = e.key.toUpperCase();
            if (key === 'BACKSPACE') key = 'BACK';
            if(key === 'ENTER' || key === 'BACK' || (key.length === 1 && key >= 'A' && key <= 'Z')) {
               handleKeyPress(key);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyPress]);


    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="py-8 flex flex-col items-center gap-8 relative">
            <div className="text-center w-full relative">
                <h1 className="text-3xl md:text-4xl font-bold font-headline text-white drop-shadow-lg">Word Panda</h1>
                <p className="text-white/90 drop-shadow-md">Adivinhe a palavra secreta de 5 letras do dia.</p>
                <div className="absolute top-0 right-4">
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">Ajuda</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Como Jogar Word Panda</AlertDialogTitle>
                            <AlertDialogDescription className="space-y-2 text-left">
                                <div>1. Seu objetivo é adivinhar a palavra secreta de 5 letras em 6 tentativas.</div>
                                <div>2. Use o teclado na tela ou o seu teclado físico para digitar uma palavra.</div>
                                <div>3. Após cada tentativa, as cores das letras mudarão para mostrar o quão perto você está:</div>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li><span className="font-bold text-green-600">Verde:</span> A letra está na palavra e na posição correta.</li>
                                    <li><span className="font-bold text-yellow-600">Amarelo:</span> A letra está na palavra, mas na posição errada.</li>
                                    <li><span className="font-bold text-gray-500">Cinza:</span> A letra não está na palavra.</li>
                                </ul>
                                <div>4. Use a dica se precisar de ajuda!</div>
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogAction>Entendi!</AlertDialogAction>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
            
            <Card id="hint-card" className="bg-white/80 backdrop-blur-sm border-2 border-white/50">
                <CardHeader>
                     <AlertTitle className="flex items-center gap-2"><Lightbulb className="h-4 w-4" /> Dica</AlertTitle>
                </CardHeader>
                <CardContent>
                    <AlertDescription>{hint}</AlertDescription>
                </CardContent>
            </Card>

             <div id="game-grid" className="grid grid-cols-5 gap-1.5">
                {guesses.map((guess, i) =>
                    Array.from({ length: 5 }).map((_, j) => (
                        <div key={`${i}-${j}`} className="perspective-1000">
                           <div className={cn(
                                'w-16 h-16 border-2 flex items-center justify-center text-3xl font-bold uppercase transition-transform duration-700 preserve-3d',
                                getTileClass(guess, j, solution, i < currentGuessIndex)
                            )}>
                               <div className="absolute backface-hidden flex items-center justify-center">
                                 {i === currentGuessIndex ? (currentGuess[j] || '').toUpperCase() : ''}
                               </div>
                                <div className="absolute rotate-y-180 backface-hidden flex items-center justify-center">
                                 {guess[j]}
                               </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

             {gameState === 'playing' ? (
                <div className="max-w-md w-full">
                    <Keyboard onKeyPress={handleKeyPress} letterStatuses={letterStatuses} />
                </div>
             ) : (
                 <div className="text-center space-y-4 p-4 rounded-lg bg-white/80">
                     <h2 className="text-2xl font-bold">
                         {gameState === 'won' ? "Você acertou!" : "Fim de Jogo"}
                     </h2>
                     <p>A palavra era: <strong className="text-primary">{solution}</strong></p>
                     <Button onClick={loadNewWord} size="lg">
                         <RefreshCw className="mr-2" /> Jogar Novamente
                     </Button>
                 </div>
             )}

             <style jsx>{`
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .backface-hidden { backface-visibility: hidden; }
            `}</style>
        </div>
    );
};

export default WordPandaPage;

    