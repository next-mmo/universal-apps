import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { LayersIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@package/ui/card';
import { Button } from '@package/ui/button';
import { Input } from '@package/ui/input';
import { Label } from '@package/ui/label';
import { Badge } from '@package/ui/badge';
import { toast } from '@package/ui/toast';
import { login, MOCK_USERS, type UserRole } from '../../store/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('seraphina.vance@acme.corp');
  const [password, setPassword] = useState('••••••••••••');
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setTimeout(() => {
      login('admin');
      toast.success('Authenticated as Seraphina Vance (Admin)');
      navigate({ to: '/dashboard/analysis' });
    }, 400);
  };

  const handleQuickPersona = (role: UserRole) => {
    login(role);
    toast.success(`Logged in as ${MOCK_USERS[role].name} (${role})`);
    navigate({ to: '/dashboard/analysis' });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="size-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mx-auto shadow-sm">
            <LayersIcon className="size-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Universal Pro Portal
          </h1>
          <p className="text-xs text-muted-foreground">
            Ant Design Pro + TanStack Architecture Enterprise Console
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border/70 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Sign In to Workspace</CardTitle>
            <CardDescription className="text-xs">
              Enter your enterprise credentials or select a quick persona demo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-3 text-xs">
              <div className="space-y-1">
                <Label className="text-xs">Enterprise Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <Label className="text-xs">Password</Label>
                  <a href="#reset" className="text-[11px] text-primary hover:underline">
                    Forgot?
                  </a>
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={pending}
                className="w-full h-9 text-xs font-semibold shadow-xs mt-2"
              >
                {pending ? 'Authenticating…' : 'Sign In'}
              </Button>
            </form>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/70" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-card px-2 text-muted-foreground font-semibold tracking-wider">
                  Quick Demo Personas
                </span>
              </div>
            </div>

            {/* Quick Personas for Live Testing */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickPersona('admin')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border/70 hover:bg-muted text-left transition-colors text-xs"
              >
                <div>
                  <div className="font-semibold text-foreground">Seraphina Vance</div>
                  <div className="text-[10px] text-muted-foreground">VP Platform · Full Admin Access</div>
                </div>
                <Badge variant="default" className="text-[10px] h-4">Admin</Badge>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPersona('editor')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border/70 hover:bg-muted text-left transition-colors text-xs"
              >
                <div>
                  <div className="font-semibold text-foreground">Marcus Chen</div>
                  <div className="text-[10px] text-muted-foreground">Product Ops · CRUD & Exports</div>
                </div>
                <Badge variant="outline" className="text-[10px] h-4">Editor</Badge>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPersona('user')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border/70 hover:bg-muted text-left transition-colors text-xs"
              >
                <div>
                  <div className="font-semibold text-foreground">Elena Rostova</div>
                  <div className="text-[10px] text-muted-foreground">Data Analyst · Read Only (403 on Audit)</div>
                </div>
                <Badge variant="secondary" className="text-[10px] h-4">Viewer</Badge>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
