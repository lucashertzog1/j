
'use client';

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

// SVGs as React components for better optimization and control
const Hills = ({ className }: { className?: string }) => (
  <svg width="1440" height="300" viewBox="0 0 1440 300" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax slice" className={cn("w-full h-auto", className)}>
    <path d="M-13 300H1453V103.5C1322.5 145.5 1154.67 118.167 1061.5 49.5C968.333 -19.1667 819.5 9.49999 676.5 49.5C533.5 89.5001 437 114.667 314 115C191 115.333 39 89.5001 -13 49.5V300Z" />
  </svg>
);

const Cloud1 = () => (
    <svg width="180" height="100" viewBox="0 0 180 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-90">
      <path d="M144.9 32C139.2 13.68 120.96 0 100.8 0C82.56 0 66.96 10.32 59.04 25.44C56.64 24.48 53.76 23.84 50.64 23.84C38.64 23.84 29.04 33.44 29.04 45.44C29.04 46.08 29.04 46.72 29.28 47.36C12.48 49.76 0 63.84 0 79.52C0 96.48 14.4 110 32.16 110H144.96C163.44 110 180 95.52 180 76.48C180 57.28 163.92 41.44 144.9 32Z" transform="scale(0.8)" fill="white"/>
    </svg>
);

const Cloud2 = () => (
    <svg width="120" height="70" viewBox="0 0 120 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
        <path d="M102.4 25.6C98.432 10.944 84.8 0 68.48 0C55.68 0 44.544 7.296 38.656 18.048C36.864 17.28 34.816 16.768 32.64 16.768C24.832 16.768 18.432 23.168 18.432 30.976C18.432 31.488 18.432 32 18.56 32.384C7.808 34.304 0 43.648 0 54.656C0 67.2 10.24 77.44 22.784 77.44H102.4c14.208 0 25.6-11.392 25.6-25.6C128 37.76 116.608 25.6 102.4 25.6Z" transform="scale(0.9)" fill="white"/>
    </svg>
);

export function AppBackground({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Determine the background style based on the current path
  const isLandingPage = pathname === '/';
  
  if (!isMounted) {
     return (
       <div className="relative min-h-screen w-full transition-colors duration-500 bg-background">
        {children}
       </div>
     )
  }

  return (
    <div className={cn(
        "relative min-h-screen w-full transition-colors duration-500",
        isLandingPage ? 'bg-[#5D94E4]' : 'bg-[#42A5F5]'
    )}>
      {children}
      <div
        className={cn(
          "absolute inset-0 z-0",
          "overflow-hidden select-none pointer-events-none"
        )}
      >
        <div 
            className="absolute bottom-0 left-0 right-0 w-full h-auto"
        >
          <Hills className={cn(
            isLandingPage ? 'fill-[#4268B1]' : 'fill-[#424986]'
          )} />
        </div>
        <div 
            className="absolute top-[10%] left-[5%] md:left-[10%] w-32 md:w-48 h-auto animate-float"
        >
           <Cloud1 />
        </div>
         <div 
            className="absolute top-[18%] right-[8%] md:right-[15%] w-24 md:w-32 h-auto animate-float animation-delay-1000"
        >
           <Cloud2 />
        </div>
      </div>
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
            animation: float 8s ease-in-out infinite;
        }
        .animation-delay-1000 {
            animation-delay: -3s;
        }
      `}</style>
    </div>
  );
}
