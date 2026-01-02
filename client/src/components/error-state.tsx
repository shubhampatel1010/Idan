import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }: ErrorStateProps) {
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground mb-4">{message}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline" className="gap-2" data-testid="button-retry">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
