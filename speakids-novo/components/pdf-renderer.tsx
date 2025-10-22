'use client';

import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { ClickableText } from './clickable-text';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import { cn } from '@/lib/utils';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export function PdfRenderer({ file }: { file: File }) {
  const { toast } = useToast();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRendering, setIsRendering] = useState(true);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onDocumentLoadError = (error: Error) => {
    toast({
      variant: 'destructive',
      title: 'Failed to load PDF',
      description: error.message,
    });
  };

  const onRenderSuccess = () => {
    setIsRendering(false);
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setIsRendering(true);
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (numPages && currentPage < numPages) {
      setIsRendering(true);
      setCurrentPage(currentPage + 1);
    }
  };

  const customTextRenderer = useCallback((textLayer: any) => {
    if (!textLayer || !textLayer.textItems) {
      return null;
    }
  
    const textItems = textLayer.textItems as TextItem[];

    return (
        <ClickableText>
            <div className="react-pdf__Page__textContent">
                {textItems.map((item, index) => {
                    const style: React.CSSProperties = {
                        left: `${item.transform[4]}px`,
                        top: `${item.transform[5]}px`,
                        height: `${item.height}px`,
                        width: `${item.width}px`,
                        fontFamily: item.fontName,
                        transform: `scaleX(${item.transform[0]})`,
                        transformOrigin: 'left top',
                        position: 'absolute',
                        whiteSpace: 'pre',
                        pointerEvents: 'all'
                    };
                    return (
                        <span key={index} style={style}>
                            {item.str}
                        </span>
                    );
                })}
            </div>
        </ClickableText>
    );
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-full max-w-4xl">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex justify-center items-center h-96">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
          }
        >
           <div className={cn("relative", isRendering && "opacity-50")}>
              {isRendering && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
              )}
              <Page
                key={`page_${currentPage}`}
                pageNumber={currentPage}
                customTextRenderer={customTextRenderer}
                renderAnnotationLayer={true}
                onRenderSuccess={onRenderSuccess}
              />
          </div>
        </Document>
      </div>

      {numPages && (
        <div className="flex items-center justify-center gap-4 p-4 rounded-lg bg-background/50 backdrop-blur-sm">
          <Button variant="outline" onClick={goToPrevPage} disabled={currentPage <= 1 || isRendering}>
            <ArrowLeft className="mr-2" />
            Anterior
          </Button>
          <p className="text-sm text-muted-foreground font-semibold">
            Página {currentPage} de {numPages}
          </p>
          <Button variant="outline" onClick={goToNextPage} disabled={currentPage >= numPages || isRendering}>
            Próxima
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
