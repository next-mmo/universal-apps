import { useState } from 'react';
import {
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  UsersIcon,
  CreditCardIcon,
  ActivityIcon,
  CalendarIcon,
  DownloadIcon,
  ArrowUpRightIcon,
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
import { Tabs, TabsList, TabsTrigger } from '@package/ui/tabs';
import { toast } from '@package/ui/toast';

export default function AnalysisPage() {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'year'>('month');

  const handleExport = () => {
    toast.success('Analytics report exported as CSV');
  };

  const kpis = [
    {
      title: 'Total Revenue',
      value: '$126,560',
      change: '+14.2%',
      trend: 'up',
      subtitle: 'Daily average $4,218',
      icon: DollarSignIcon,
      sparkline: [30, 42, 38, 55, 62, 58, 70, 75, 82],
    },
    {
      title: 'Active Visits',
      value: '88,420',
      change: '+8.1%',
      trend: 'up',
      subtitle: 'Peak concurrency 1,420',
      icon: UsersIcon,
      sparkline: [20, 25, 40, 35, 48, 52, 60, 58, 64],
    },
    {
      title: 'Completed Payments',
      value: '6,492',
      change: '-2.4%',
      trend: 'down',
      subtitle: 'Conversion rate 7.34%',
      icon: CreditCardIcon,
      sparkline: [60, 55, 58, 50, 48, 52, 49, 45, 46],
    },
    {
      title: 'Operational Health',
      value: '99.98%',
      change: '+0.05%',
      trend: 'up',
      subtitle: 'Average latency 42ms',
      icon: ActivityIcon,
      sparkline: [98, 99, 99, 98, 100, 99, 100, 100, 100],
    },
  ];

  const salesRankings = [
    { rank: 1, name: 'Enterprise Cloud Suite v4', sales: '$48,290', growth: '+28%' },
    { rank: 2, name: 'Edge Gateway Appliance', sales: '$32,150', growth: '+19%' },
    { rank: 3, name: 'Observability Telemetry Add-on', sales: '$21,400', growth: '+14%' },
    { rank: 4, name: 'Managed Redis Cluster', sales: '$14,920', growth: '+8%' },
    { rank: 5, name: 'Multi-Region Ingress License', sales: '$9,800', growth: '+4%' },
  ];

  const channelStats = [
    { name: 'Direct B2B Contracts', share: '48%', color: 'bg-primary' },
    { name: 'Self-Serve SaaS Portal', share: '32%', color: 'bg-emerald-500' },
    { name: 'Cloud Marketplace Referrals', share: '14%', color: 'bg-amber-500' },
    { name: 'Partner Integration APIs', share: '6%', color: 'bg-blue-500' },
  ];

  return (
    <PageContainer
      title="Analysis Dashboard"
      description="Ant Design Pro-inspired executive performance indicators and conversion telemetry."
      breadcrumbs={['Universal Pro', 'Dashboards', 'Analysis']}
      extra={
        <div className="flex items-center gap-2">
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <TabsList className="h-8">
              <TabsTrigger value="today" className="text-xs px-2.5">Today</TabsTrigger>
              <TabsTrigger value="week" className="text-xs px-2.5">Week</TabsTrigger>
              <TabsTrigger value="month" className="text-xs px-2.5">Month</TabsTrigger>
              <TabsTrigger value="year" className="text-xs px-2.5">Year</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button size="sm" variant="outline" onClick={handleExport} className="h-8 gap-1.5 text-xs">
            <DownloadIcon className="size-3.5" />
            <span>Export</span>
          </Button>
        </div>
      }
    >
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const isUp = kpi.trend === 'up';
          return (
            <Card key={kpi.title} className="relative overflow-hidden border-border/70 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <div className="size-7 rounded-md bg-muted/60 flex items-center justify-center text-muted-foreground">
                  <Icon className="size-3.5" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold tracking-tight text-foreground">{kpi.value}</span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0.5 gap-0.5 font-semibold ${
                      isUp
                        ? 'border-emerald-500/30 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30'
                        : 'border-destructive/30 text-destructive bg-destructive/5'
                    }`}
                  >
                    {isUp ? <TrendingUpIcon className="size-2.5" /> : <TrendingDownIcon className="size-2.5" />}
                    {kpi.change}
                  </Badge>
                </div>

                {/* Lightweight Pure SVG Mini-Sparkline */}
                <div className="h-8 w-full flex items-end gap-1 pt-1">
                  {kpi.sparkline.map((val, i) => (
                    <div
                      key={i}
                      style={{ height: `${val}%` }}
                      className={`flex-1 rounded-xs transition-all duration-300 ${
                        isUp ? 'bg-primary/30 hover:bg-primary' : 'bg-destructive/30 hover:bg-destructive'
                      }`}
                    />
                  ))}
                </div>

                <div className="border-t border-border/50 pt-2 text-[11px] text-muted-foreground flex items-center justify-between">
                  <span>{kpi.subtitle}</span>
                  <ArrowUpRightIcon className="size-3 text-muted-foreground/60" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Analysis Section: Sales Leaderboard & Channel Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Sales Trends & Leaderboard */}
        <Card className="lg:col-span-2 border-border/70 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Top Performing Products</CardTitle>
              <CardDescription className="text-xs">
                Volume metrics and period-over-period expansion rate.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              Live Feed
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="divide-y divide-border/60">
              {salesRankings.map((item) => (
                <div key={item.rank} className="flex items-center justify-between py-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${
                        item.rank <= 3
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {item.rank}
                    </span>
                    <span className="font-medium text-foreground">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-foreground">{item.sales}</span>
                    <span className="w-14 text-right text-emerald-600 font-semibold">{item.growth}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right 1 Col: Revenue Channels */}
        <Card className="border-border/70 shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Distribution Channels</CardTitle>
            <CardDescription className="text-xs">
              Revenue distribution across enterprise acquisition vectors.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {channelStats.map((ch) => (
                <div key={ch.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{ch.name}</span>
                    <span className="font-semibold text-foreground">{ch.share}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${ch.color}`}
                      style={{ width: ch.share }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-border/70 bg-muted/30 p-3 mt-4 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <CalendarIcon className="size-3.5 text-primary" />
                <span>Operational Milestone</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Direct B2B contracts exceed the quarterly target by 18.4%. Next billing cycle synchronizes on the 1st of the month.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
