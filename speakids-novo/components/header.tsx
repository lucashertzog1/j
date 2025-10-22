
'use client';

import { useState, useEffect } from 'react';
import { PandaLogo } from './panda-logo';
import { Button } from './ui/button';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const noBackButtonPaths = ['/', '/dashboard'];
  const showBackButton = isMounted && !noBackButtonPaths.includes(pathname);

  const isDarkBg = ['/', '/dashboard'].includes(pathname);

  const buttonClass = cn(
    "transition-colors duration-300",
    isDarkBg ? "text-white hover:bg-white/10 hover:text-white" : "text-slate-700 hover:bg-slate-200/80 hover:text-slate-800"
  );

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="container flex h-20 items-center">
        <div className="flex items-center gap-4">
           {showBackButton && (
              <Button variant="ghost" size="icon" onClick={() => router.back()} className={buttonClass}>
                  <ArrowLeft />
                  <span className="sr-only">Voltar</span>
              </Button>
          )}
          <PandaLogo />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* Auth buttons removed */}
        </div>
      </div>
    </header>
  );
}

    