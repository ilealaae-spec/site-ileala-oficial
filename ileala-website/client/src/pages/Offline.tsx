import { useLanguage } from "@/contexts/LanguageContext";
import { WifiOff, Home, RotateCcw } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Offline() {
  const { language } = useLanguage();

  return (
    <div className="flex items-center justify-center min-h-screen p-8 bg-background">
      <div className="flex flex-col items-center w-full max-w-md text-center">
        <WifiOff className="w-16 h-16 text-muted-foreground mb-6" />
        
        <h1 className="text-3xl font-bold mb-4">
          {language === 'en' ? 'You\'re Offline' : 'Você Está Offline'}
        </h1>
        
        <p className="text-muted-foreground mb-8">
          {language === 'en' 
            ? 'It looks like you\'ve lost your internet connection. Please check your connection and try again.'
            : 'Parece que você perdeu sua conexão com a internet. Por favor, verifique sua conexão e tente novamente.'}
        </p>

        <div className="flex gap-4">
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            {language === 'en' ? 'Retry' : 'Tentar Novamente'}
          </Button>
          
          <Link href="/">
            <Button className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              {language === 'en' ? 'Go Home' : 'Ir para Início'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}


