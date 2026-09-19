import { useRef, useState, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  SearchIcon,
  DownloadIcon,
  ClockIcon,
  LockIcon,
} from 'lucide-react';
import { PageContainer } from '@package/pro/page-container';
import { Card } from '@package/ui/card';
import { Button } from '@package/ui/button';
import { Input } from '@package/ui/input';
import { Badge } from '@package/ui/badge';
import { toast } from '@package/ui/toast';
import { useAccess } from '../../access';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  operator: string;
  action: string;
  target: string;
  ipAddress: string;
  severity: 'info' | 'warning' | 'critical';
  status: '200 OK' | '403 Denied' | '500 Error';
}

// Generate 1,000 realistic audit log entries for TanStack Virtual demonstration
const GENERATED_LOGS: AuditLogEntry[] = Array.from({ length: 1000 }, (_, i) => {
  const operators = ['Seraphina Vance', 'Marcus Chen', 'Elena Rostova', 'Automated Agent', 'Kube-System'];
  const actions = [
    'UPDATE_RBAC_POLICY',
    'REVOKE_API_KEY',
    'PROMOTE_DEPLOYMENT',
    'EXPORT_CUSTOMER_RECORDS',
    'DELETE_SERVICE_INGRESS',
    'SCALE_NODE_GROUP',
    'ACCESS_TENANT_VAULT',
  ];
  const targets = ['us-east-cluster', 'auth-service', 'finops-ledger', 'redis-replica', 'customer-table'];
  const ips = ['192.0.2.45', '198.51.100.12', '203.0.113.88', '10.0.4.12', '127.0.0.1'];
  const severities: ('info' | 'warning' | 'critical')[] = ['info', 'info', 'warning', 'critical', 'info'];
  const statuses: ('200 OK' | '403 Denied' | '500 Error')[] = ['200 OK', '200 OK', '200 OK', '403 Denied'];

  return {
    id: `audit_log_${1000 - i}`,
    timestamp: new Date(Date.now() - i * 180000).toISOString().replace('T', ' ').slice(0, 19),
    operator: operators[i % operators.length],
    action: actions[i % actions.length],
    target: targets[i % targets.length],
    ipAddress: ips[i % ips.length],
    severity: severities[i % severities.length],
    status: statuses[i % statuses.length],
  };
});

export default function AuditLogPage() {
  const { isAdmin } = useAccess();
  const [search, setSearch] = useState('');
  const parentRef = useRef<HTMLDivElement>(null);

  const filteredLogs = useMemo(() => {
    if (!search) return GENERATED_LOGS;
    const q = search.toLowerCase();
    return GENERATED_LOGS.filter(
      (l) =>
        l.operator.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.target.toLowerCase().includes(q) ||
        l.ipAddress.includes(q)
    );
  }, [search]);

  // TanStack Virtualizer instance
  const rowVirtualizer = useVirtualizer({
    count: filteredLogs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 10,
  });

  if (!isAdmin) {
    return (
      <PageContainer title="Audit Trail" breadcrumbs={['Universal Pro', 'System', 'Audit Trail']}>
        <Card className="border-destructive/30 bg-destructive/5 text-center p-12 max-w-lg mx-auto">
          <div className="size-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
            <LockIcon className="size-8" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Access Restricted</h2>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            The Audit Trail contains sensitive governance and security events. Your current role does not possess the <code className="bg-muted px-1.5 py-0.5 rounded font-mono">system:audit</code> permission.
          </p>
          <p className="text-xs text-primary font-semibold mt-3">
            Tip: Switch your role to "Admin" in the top header role simulator to view this page.
          </p>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="System Audit Trail"
      description="Ant Design Pro-inspired security audit stream virtualized with TanStack Virtual (rendering 1,000+ records at 60 FPS)."
      breadcrumbs={['Universal Pro', 'System & Governance', 'Audit Trail']}
      extra={
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.success(`Exported ${filteredLogs.length} audit records`)}
          className="h-8 gap-1.5 text-xs"
        >
          <DownloadIcon className="size-3.5" />
          <span>Export Logs</span>
        </Button>
      }
    >
      <Card className="border-border/70 shadow-xs">
        {/* Search & Stats Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-border/70 bg-muted/20">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <SearchIcon className="size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by operator, action, IP, or target…"
              className="h-8 text-xs"
            />
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>Showing <strong>{filteredLogs.length}</strong> events</span>
            <Badge variant="outline" className="text-[10px] px-2 py-0 border-primary/40 text-primary">
              Virtual Scroll Active
            </Badge>
          </div>
        </div>

        {/* Virtualized Table Container */}
        <div
          ref={parentRef}
          className="h-[520px] overflow-auto select-none"
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const item = filteredLogs[virtualRow.index];
              return (
                <div
                  key={item.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="flex items-center justify-between px-4 border-b border-border/50 text-xs hover:bg-muted/30 transition-colors font-mono"
                >
                  <div className="flex items-center gap-3 w-48 truncate">
                    <ClockIcon className="size-3 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground text-[11px]">{item.timestamp}</span>
                  </div>

                  <div className="w-36 font-semibold text-foreground truncate font-sans">
                    {item.operator}
                  </div>

                  <div className="w-52">
                    <span className="px-1.5 py-0.5 rounded bg-muted text-[11px] text-foreground font-semibold">
                      {item.action}
                    </span>
                  </div>

                  <div className="w-36 text-muted-foreground truncate">
                    {item.target}
                  </div>

                  <div className="w-28 text-[11px] text-muted-foreground">
                    {item.ipAddress}
                  </div>

                  <div className="w-24 text-right">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${
                        item.severity === 'critical'
                          ? 'border-destructive text-destructive bg-destructive/5'
                          : item.severity === 'warning'
                          ? 'border-amber-500 text-amber-600 bg-amber-50/40'
                          : 'border-border text-muted-foreground'
                      }`}
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </PageContainer>
  );
}
