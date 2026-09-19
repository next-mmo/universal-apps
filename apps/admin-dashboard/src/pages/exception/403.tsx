import { useNavigate } from '@tanstack/react-router';
import { ShieldXIcon, ArrowLeftIcon, ShieldCheckIcon } from 'lucide-react';
import { Button } from '@package/ui/button';
import { useAuth, setRole } from '../../store/auth';

export default function ForbiddenPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="size-20 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
        <ShieldXIcon className="size-10" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground">403</h1>
      <h2 className="text-lg font-bold text-foreground mt-2">Access Denied / Unauthorized</h2>
      <p className="text-xs text-muted-foreground max-w-md mt-2 leading-relaxed">
        Sorry, your current persona (<span className="font-semibold text-foreground">{currentUser.name}</span>, role: <code className="px-1.5 py-0.5 rounded bg-muted text-primary font-mono">{currentUser.role}</code>) lacks authorization to access this administrative surface.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ to: '/dashboard/analysis' })}
          className="gap-2 text-xs"
        >
          <ArrowLeftIcon className="size-3.5" />
          <span>Back to Analysis</span>
        </Button>
        <Button
          size="sm"
          onClick={() => {
            setRole('admin');
            navigate({ to: '/dashboard/analysis' });
          }}
          className="gap-2 text-xs font-semibold shadow-xs"
        >
          <ShieldCheckIcon className="size-3.5" />
          <span>Elevate to Admin Role</span>
        </Button>
      </div>
    </div>
  );
}
