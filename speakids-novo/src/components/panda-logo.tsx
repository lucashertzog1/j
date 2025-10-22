
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export function PandaLogo() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isDarkBg = ['/', '/dashboard'].includes(pathname);
  
  if (!isMounted) {
    return (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-lg bg-white text-primary"></div>
          <span className="text-xl font-bold font-headline text-slate-800">Speakids</span>
        </div>
    );
  }

  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="flex items-center justify-center size-10 rounded-lg bg-white text-primary">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-7 h-7"
        >
          {/* Simple Panda Face */}
          <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" fill="white" stroke="#333" strokeWidth="1.5" />
          <path d="M8 9a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm8 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" fill="#333" />
          <path d="M9.5 14.5a3.5 3.5 0 115 0" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
           <path d="M18.36 7.64a4 4 0 01-5.66 5.66" fill="black" opacity="0.8" transform="translate(-2, 0)"/>
           <path d="M5.64 7.64a4 4 0 005.66 5.66" fill="black" opacity="0.8" transform="translate(2, 0)"/>
        </svg>
      </div>
      <span className={cn(
        "text-xl font-bold font-headline transition-colors duration-300",
        isDarkBg ? "text-white" : "text-slate-800"
      )}>
        Speakids
      </span>
    </Link>
  );
}
