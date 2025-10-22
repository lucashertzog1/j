
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Trophy, Medal, Star } from 'lucide-react';
import { getRanking } from '@/app/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

type RankedUser = {
  id: string;
  displayName: string;
  pandaPoints: number;
};

export default function RankingPage() {
  const { user, isLoading: isUserLoading } = useAuth();
  const [ranking, setRanking] = useState<RankedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      setIsLoading(true);
      const { ranking: fetchedRanking, error } = await getRanking();
      if (error) {
        console.error(error);
      } else {
        setRanking(fetchedRanking);
      }
      setIsLoading(false);
    };

    fetchRanking();
  }, []);

  const getRankColor = (rank: number) => {
    if (rank === 0) return 'text-amber-400';
    if (rank === 1) return 'text-slate-400';
    if (rank === 2) return 'text-amber-600';
    return 'text-muted-foreground';
  };
  
  const getRankIcon = (rank: number) => {
      if (rank === 0) return <Trophy className="w-5 h-5" />;
      if (rank < 3) return <Medal className="w-5 h-5" />;
      return <Star className="w-5 h-5"/>
  }

  return (
    <div className="py-8 flex flex-col items-center gap-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-white drop-shadow-lg">Placar de Líderes</h1>
        <p className="text-white/90 drop-shadow-md">Veja quem está no topo do ranking esta semana!</p>
      </div>

      <Card className="w-full max-w-2xl bg-white/80 backdrop-blur-sm border-2 border-white/50">
        <CardHeader>
          <CardTitle>Melhores Alunos</CardTitle>
          <CardDescription>Ranking baseado nos Panda Points ganhos.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading || isUserLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          ) : (
            <ul className="space-y-4">
              {ranking.map((rankedUser, index) => (
                <li
                  key={rankedUser.id}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg",
                    user?.uid === rankedUser.id ? "bg-primary/10 border-2 border-primary" : "bg-secondary"
                  )}
                >
                  <div className={cn("text-xl font-bold w-8 text-center", getRankColor(index))}>
                    {index + 1}
                  </div>
                  <Avatar>
                    {/* Placeholder for user avatar image */}
                    <AvatarFallback>{rankedUser.displayName?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-bold">{rankedUser.displayName}</p>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-amber-500">
                    {getRankIcon(index)}
                    <span>{rankedUser.pandaPoints}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
