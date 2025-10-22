import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';

interface ProgressTrackerProps {
  completed: number;
  total: number;
}

export function ProgressTracker({ completed, total }: ProgressTrackerProps) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <Card className="bg-secondary border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Seu Progresso</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <CheckCircle className="w-5 h-5" />
          <p>
            <span className="font-bold">{completed}</span> de{' '}
            <span className="font-bold">{total}</span> lições concluídas
          </p>
        </div>
        <Progress value={percentage} aria-label={`${Math.round(percentage)}% completo`} />
      </CardContent>
    </Card>
  );
}
