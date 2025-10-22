
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Puzzle, TextQuote } from 'lucide-react';
import Link from 'next/link';

const dailyGames = [
  {
    id: 'word-panda',
    title: 'Word Panda',
    description: 'Adivinhe a palavra secreta. Um novo desafio todos os dias!',
    href: '/daily-activity/word-panda',
    icon: Puzzle,
  },
  {
    id: 'sentence-scramble',
    title: 'Frase Embaralhada',
    description: 'Coloque as palavras na ordem correta para formar uma frase.',
    href: '/daily-activity/sentence-scramble',
    icon: TextQuote,
  },
];

export default function DailyActivityPage() {
  return (
    <div className="flex flex-col gap-8 py-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-white drop-shadow-lg">Atividades Diárias</h1>
        <p className="text-white/90 drop-shadow-md">Novos desafios para testar suas habilidades todos os dias!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
        {dailyGames.map((game) => (
            <Link 
              href={game.href} 
              key={game.title} 
              className="group"
            >
              <Card className="h-full hover:shadow-xl hover:-translate-y-1.5 transition-transform duration-300 flex flex-col text-left bg-white/80 backdrop-blur-sm border-2 border-white/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                      <div className="p-3 bg-secondary rounded-full">
                        <game.icon className="w-7 h-7 text-primary" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform"/>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <CardTitle className="mb-2">{game.title}</CardTitle>
                  <CardDescription className="flex-1">{game.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          )
        )}
      </div>
    </div>
  );
}
