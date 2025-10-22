
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Star } from "lucide-react";

export function PandaPointsCard({ points }: { points: number }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-2 border-white/50 text-center flex flex-col justify-center">
        <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-bold text-slate-700 flex items-center justify-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                Panda Points
            </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
            <p className="text-4xl font-extrabold text-primary">{points}</p>
        </CardContent>
    </Card>
  )
}
