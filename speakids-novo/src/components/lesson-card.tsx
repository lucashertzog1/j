import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface LessonCardProps {
  title: string;
  icon: LucideIcon;
  progress: number;
}

export function LessonCard({ title, icon: Icon, progress }: LessonCardProps) {
  const isCompleted = progress === 100;
  const isStarted = progress > 0 && progress < 100;

  return (
    <Card className="flex flex-col text-center items-center justify-between p-4 gap-4 hover:shadow-md transition-shadow">
      <div className="p-4 bg-secondary rounded-full">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <h3 className="font-bold text-lg">{title}</h3>
      <div className="w-full space-y-2">
        <Progress value={progress} className="h-2" />
        <p className="text-xs text-muted-foreground">{Math.round(progress)}%</p>
      </div>
      <Button className="w-full" disabled={isCompleted}>
        {isCompleted ? 'Concluído' : isStarted ? 'Continuar' : 'Começar'}
      </Button>
    </Card>
  );
}
