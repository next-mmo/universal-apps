import { useNavigate } from '@tanstack/react-router';
import {
  FolderGit2Icon,
  CheckCircle2Icon,
  ClockIcon,
  PlusIcon,
  ShieldIcon,
  FileSpreadsheetIcon,
  ZapIcon,
} from 'lucide-react';
import { PageContainer } from '@package/pro/page-container';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@package/ui/card';
import { Button } from '@package/ui/button';
import { Badge } from '@package/ui/badge';
import { Avatar, AvatarFallback } from '@package/ui/avatar';
import { useAuth } from '../../store/auth';
import { useCurrentTenant } from '../../store/tenant';

export default function WorkplacePage() {
  const { currentUser } = useAuth();
  const currentTenant = useCurrentTenant();
  const navigate = useNavigate();

  const activeProjects = [
    {
      id: 'proj_1',
      title: 'Tauri Universal Core v3',
      description: 'Source-owned cross-platform UI engine with native Tailwind v4 tokens.',
      group: 'Frontend Architecture',
      progress: 88,
      status: 'On Track',
      updated: '14m ago',
    },
    {
      id: 'proj_2',
      title: 'Auth0 to Supabase Auth Migration',
      description: 'Zero-downtime JWT rotation with dual-provider token verification bridge.',
      group: 'Security & Auth',
      progress: 65,
      status: 'Reviewing',
      updated: '1h ago',
    },
    {
      id: 'proj_3',
      title: 'Edge Telemetry Pipeline',
      description: 'Low-latency log aggregation for distributed edge clusters via ClickHouse.',
      group: 'Infrastructure',
      progress: 92,
      status: 'Deploying',
      updated: '3h ago',
    },
    {
      id: 'proj_4',
      title: 'Global Ingress Multi-Region',
      description: 'Anycast DNS routing with Envoy sidecar proxies across 8 regions.',
      group: 'Network Ops',
      progress: 42,
      status: 'In Progress',
      updated: '5h ago',
    },
    {
      id: 'proj_5',
      title: 'Developer Portal Documentation',
      description: 'Fumadocs interactive code block sandbox and LLM context extraction tools.',
      group: 'Developer Experience',
      progress: 78,
      status: 'On Track',
      updated: '1d ago',
    },
    {
      id: 'proj_6',
      title: 'Payment Reconciliation Gateway',
      description: 'Automated Stripe and Adyen invoice matching and ledger reconciliation.',
      group: 'FinOps',
      progress: 95,
      status: 'Complete',
      updated: '2d ago',
    },
  ];

  const recentActivities = [
    {
      user: 'Marcus Chen',
      action: 'promoted deployment to',
      target: 'Production [US-East]',
      time: '22 minutes ago',
    },
    {
      user: 'Elena Rostova',
      action: 'generated monthly telemetry report in',
      target: 'Business Intelligence',
      time: '1 hour ago',
    },
    {
      user: 'Seraphina Vance',
      action: 'updated RBAC policy matrix for',
      target: 'Enterprise Tenants',
      time: '3 hours ago',
    },
    {
      user: 'Automated Bot',
      action: 'synchronized 142 records with',
      target: 'Primary Read Replica',
      time: '5 hours ago',
    },
  ];

  return (
    <PageContainer
      title="Workplace Overview"
      description={`Welcome back, ${currentUser.name}. Here is an overview of ongoing initiatives in ${currentTenant.name}.`}
      breadcrumbs={['Universal Pro', 'Dashboards', 'Workplace']}
      extra={
        <Button
          size="sm"
          onClick={() => navigate({ to: '/form/step-form' })}
          className="h-8 gap-1.5 text-xs shadow-xs"
        >
          <PlusIcon className="size-3.5" />
          <span>New Initiative</span>
        </Button>
      }
    >
      {/* Header Greeting Banner */}
      <Card className="border-border/70 shadow-xs bg-gradient-to-r from-card via-card to-primary/5">
        <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 border-2 border-primary/20 shadow-xs">
              <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                Good day, {currentUser.name}! 🚀
              </h2>
              <p className="text-xs text-muted-foreground">
                {currentUser.title} · {currentUser.department}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Badge variant="outline" className="text-[10px] px-2 py-0 border-primary/40 text-primary">
                  {currentTenant.tier} Tier
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  Active in <span className="font-semibold text-foreground">{currentTenant.region}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8 self-stretch md:self-auto border-t md:border-t-0 md:border-l border-border/70 pt-4 md:pt-0 md:pl-8 justify-around md:justify-end">
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Active Projects</div>
              <div className="text-xl font-bold text-foreground">12</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Pending Tasks</div>
              <div className="text-xl font-bold text-primary">4 / 16</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-muted-foreground">Team Rank</div>
              <div className="text-xl font-bold text-foreground">#2</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Projects & Activities */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Active Projects Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FolderGit2Icon className="size-4 text-primary" />
              <span>Ongoing Projects</span>
            </h3>
            <span className="text-xs text-muted-foreground">Showing 6 active streams</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeProjects.map((proj) => (
              <Card key={proj.id} className="border-border/70 hover:border-border transition-colors shadow-2xs">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xs font-bold text-foreground line-clamp-1">
                      {proj.title}
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 font-medium">
                      {proj.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-[11px] line-clamp-2 leading-relaxed mt-1">
                    {proj.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>Progress</span>
                      <span className="font-semibold text-foreground">{proj.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                    <span className="font-medium text-primary/80">{proj.group}</span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="size-2.5" />
                      {proj.updated}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Quick Actions & Team Activity Feed */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="border-border/70 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-xs">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: '/list/table-list' })}
                className="h-9 justify-start gap-2 text-xs border-border/70"
              >
                <FileSpreadsheetIcon className="size-3.5 text-blue-500" />
                <span>Manage Users</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: '/form/step-form' })}
                className="h-9 justify-start gap-2 text-xs border-border/70"
              >
                <ZapIcon className="size-3.5 text-amber-500" />
                <span>Deploy Wizard</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: '/profile/advanced' })}
                className="h-9 justify-start gap-2 text-xs border-border/70"
              >
                <CheckCircle2Icon className="size-3.5 text-emerald-500" />
                <span>Entity Profile</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate({ to: '/system/audit-log' })}
                className="h-9 justify-start gap-2 text-xs border-border/70"
              >
                <ShieldIcon className="size-3.5 text-purple-500" />
                <span>Audit Logs</span>
              </Button>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="border-border/70 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold">Team Activity Stream</CardTitle>
              <CardDescription className="text-[11px]">Real-time operational event trail.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="divide-y divide-border/60">
                {recentActivities.map((act, i) => (
                  <div key={i} className="py-2.5 text-xs space-y-0.5">
                    <p className="text-foreground leading-relaxed">
                      <span className="font-semibold text-primary">{act.user}</span>{' '}
                      <span className="text-muted-foreground">{act.action}</span>{' '}
                      <span className="font-medium text-foreground">{act.target}</span>
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <ClockIcon className="size-3" />
                      <span>{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
