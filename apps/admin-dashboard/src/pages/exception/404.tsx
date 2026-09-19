import { useNavigate } from '@tanstack/react-router';
import { FileQuestionIcon, ArrowLeftIcon } from 'lucide-react';
import { Button } from '@package/ui/button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="size-20 rounded-full bg-muted text-muted-foreground flex items-center justify-center mb-4">
        <FileQuestionIcon className="size-10" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground">404</h1>
      <h2 className="text-lg font-bold text-foreground mt-2">Page Not Found</h2>
      <p className="text-xs text-muted-foreground max-w-md mt-2 leading-relaxed">
        The requested resource path does not exist in this workspace or may have moved.
      </p>

      <div className="mt-6">
        <Button
          size="sm"
          onClick={() => navigate({ to: '/dashboard/analysis' })}
          className="gap-2 text-xs font-semibold shadow-xs"
        >
          <ArrowLeftIcon className="size-3.5" />
          <span>Return to Dashboard</span>
        </Button>
      </div>
    </div>
  );
}
