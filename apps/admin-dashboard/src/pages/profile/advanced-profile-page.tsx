import { useState } from 'react';
import {
  CheckCircle2Icon,
  ServerIcon,
  ClockIcon,
  RotateCcwIcon,
  LayersIcon,
} from 'lucide-react';
import { PageContainer } from '@package/pro/page-container';
import { ProDescriptions, type ProDescriptionsItemConfig } from '@package/pro/descriptions';
import { Card, CardHeader, CardTitle, CardContent } from '@package/ui/card';
import { Button } from '@package/ui/button';
import { Badge } from '@package/ui/badge';
import { toast } from '@package/ui/toast';

export default function AdvancedProfilePage() {
  const [status, setStatus] = useState<'Healthy' | 'Maintenance' | 'Deploying'>('Healthy');

  const clusterData = {
    clusterId: 'cls_8849204',
    name: 'us-east-core-ingress',
    environment: 'Production',
    region: 'us-east-1 (N. Virginia)',
    orchestrator: 'Kubernetes v1.31.2',
    ingressDomain: 'gateway.cloud.acme.corp',
    ipAddress: '198.51.100.24',
    tlsCertStatus: 'Valid (Let\'s Encrypt Wildcard)',
    autoScale: 'Enabled (3 - 12 nodes)',
    leadArchitect: 'Seraphina Vance',
    lastDeployTime: '2026-09-18 14:22 UTC',
    mtlsEnforced: true,
  };

  const descriptionItems: ProDescriptionsItemConfig[] = [
    { label: 'Cluster Identifier', dataIndex: 'clusterId', valueType: 'code' },
    { label: 'Cluster Name', dataIndex: 'name', valueType: 'text' },
    { label: 'Environment', dataIndex: 'environment', valueType: 'badge' },
    { label: 'Target Region', dataIndex: 'region', valueType: 'text' },
    { label: 'Control Plane', dataIndex: 'orchestrator', valueType: 'text' },
    { label: 'Primary Ingress Host', dataIndex: 'ingressDomain', valueType: 'text' },
    { label: 'Anycast IPv4', dataIndex: 'ipAddress', valueType: 'code' },
    { label: 'mTLS Enforcement', dataIndex: 'mtlsEnforced', valueType: 'boolean' },
    { label: 'Auto-Scaling Range', dataIndex: 'autoScale', valueType: 'text' },
    { label: 'Owner / Architect', dataIndex: 'leadArchitect', valueType: 'text' },
    { label: 'Last Synchronized', dataIndex: 'lastDeployTime', valueType: 'text', span: 2 },
  ];

  const nodePool = [
    { name: 'worker-node-01', type: 'c6i.2xlarge', status: 'Ready', cpu: '48%', mem: '62%', zone: 'us-east-1a' },
    { name: 'worker-node-02', type: 'c6i.2xlarge', status: 'Ready', cpu: '54%', mem: '71%', zone: 'us-east-1b' },
    { name: 'worker-node-03', type: 'c6i.2xlarge', status: 'Ready', cpu: '39%', mem: '58%', zone: 'us-east-1c' },
    { name: 'worker-node-04', type: 'm6i.4xlarge', status: 'Ready', cpu: '68%', mem: '84%', zone: 'us-east-1a' },
  ];

  const auditHistory = [
    { title: 'Rolling update completed to image v4.8.2', author: 'Marcus Chen', time: '14 minutes ago' },
    { title: 'TLS certificate renewed automatically via Cert-Manager', author: 'System Operator', time: '6 hours ago' },
    { title: 'Node auto-scaler expanded pool from 3 to 4 nodes', author: 'Cluster Autoscaler', time: '1 day ago' },
    { title: 'Security policy audit: CIS Kubernetes Benchmark 100% compliant', author: 'Elena Rostova', time: '3 days ago' },
  ];

  return (
    <PageContainer
      title="Advanced Cluster Profile"
      description="Ant Design Pro-style ProDescriptions view displaying structured entity topology, health, and sub-resource telemetry."
      breadcrumbs={['Universal Pro', 'Profiles', 'Advanced Profile']}
      extra={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setStatus('Deploying');
              setTimeout(() => {
                setStatus('Healthy');
                toast.success('Cluster configuration synchronized');
              }, 1200);
            }}
            className="h-8 gap-1.5 text-xs"
          >
            <RotateCcwIcon className="size-3.5" />
            <span>Sync State</span>
          </Button>
          <Button
            size="sm"
            onClick={() => toast.success('Triggered rolling zero-downtime restart')}
            className="h-8 gap-1.5 text-xs shadow-xs"
          >
            <LayersIcon className="size-3.5" />
            <span>Rolling Restart</span>
          </Button>
        </div>
      }
    >
      {/* Overview Status Banner */}
      <Card className="border-border/70 shadow-xs">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <ServerIcon className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">{clusterData.name}</h3>
                <Badge
                  variant="outline"
                  className={`text-[11px] px-2 py-0.5 font-semibold ${
                    status === 'Healthy'
                      ? 'border-emerald-500/40 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                      : 'border-amber-500/40 text-amber-600 bg-amber-50/50'
                  }`}
                >
                  <CheckCircle2Icon className="size-3 mr-1" />
                  {status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                {clusterData.clusterId} · {clusterData.region}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <div className="text-right">
              <div className="text-muted-foreground text-[11px]">Control Plane Health</div>
              <div className="font-semibold text-emerald-600">100% Operational</div>
            </div>
            <div className="text-right">
              <div className="text-muted-foreground text-[11px]">Ingress RPS</div>
              <div className="font-bold text-foreground">4,820 req/s</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ProDescriptions Component */}
      <Card className="border-border/70 shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border/70 bg-muted/20 pb-3">
          <CardTitle className="text-sm font-semibold">Cluster Topology & Configuration</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ProDescriptions
            column={3}
            bordered
            data={clusterData}
            items={descriptionItems}
          />
        </CardContent>
      </Card>

      {/* Node Pool Table & Audit Timeline */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Attached Node Pool */}
        <Card className="lg:col-span-2 border-border/70 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Attached Worker Nodes ({nodePool.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/30 text-muted-foreground font-semibold border-y border-border/70">
                <tr>
                  <th className="px-4 py-2.5">Node Name</th>
                  <th className="px-4 py-2.5">Instance Type</th>
                  <th className="px-4 py-2.5">Availability Zone</th>
                  <th className="px-4 py-2.5">CPU Load</th>
                  <th className="px-4 py-2.5">Memory</th>
                  <th className="px-4 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {nodePool.map((n) => (
                  <tr key={n.name} className="hover:bg-muted/20">
                    <td className="px-4 py-2.5 font-semibold text-foreground">{n.name}</td>
                    <td className="px-4 py-2.5 text-muted-foreground font-mono">{n.type}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{n.zone}</td>
                    <td className="px-4 py-2.5 font-medium text-foreground">{n.cpu}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{n.mem}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 text-[10px] px-1.5 py-0">
                        {n.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Right 1 Col: Audit Timeline */}
        <Card className="border-border/70 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Audit Event Log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="divide-y divide-border/60">
              {auditHistory.map((item, i) => (
                <div key={i} className="py-2.5 text-xs space-y-1">
                  <p className="font-medium text-foreground leading-relaxed">{item.title}</p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{item.author}</span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="size-3" />
                      {item.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
