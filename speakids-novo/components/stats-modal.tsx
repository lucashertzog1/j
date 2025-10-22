
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Trophy } from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StatsModal({ isOpen, onOpenChange }: StatsModalProps) {

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-headline">Meu Progresso</DialogTitle>
          <DialogDescription className="text-center">
            Esta é uma funcionalidade em desenvolvimento. Em breve, seu progresso aparecerá aqui!
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 flex flex-col items-center justify-center text-center p-8 rounded-lg bg-secondary/50">
            <Trophy className="w-12 h-12 text-primary mb-4" />
            <p className="font-bold">Em breve!</p>
            <p className="text-sm text-muted-foreground">Estamos trabalhando para trazer uma ótima visualização do seu progresso.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

    