
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Flame } from "lucide-react";

export function StreakCard({ days }: { days: number }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-2 border-white/50 text-center flex flex-col justify-center">
        <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-bold text-slate-700 flex items-center justify-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Sequência
            </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
            <p className="text-4xl font-extrabold text-primary">{days}</p>
        </CardContent>
    </Card>
  )
}
