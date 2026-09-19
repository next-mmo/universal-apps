import { useState } from 'react';
import {
  BellIcon,
  CheckCheckIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  MessageSquareIcon,
  ClockIcon,
} from 'lucide-react';
import { Button } from '@package/ui/button';
import { Badge } from '@package/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@package/ui/popover';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@package/ui/tabs';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'alert' | 'task' | 'mention';
  read: boolean;
  priority?: 'critical' | 'normal';
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'High CPU Spike on Cluster eu-west-1',
    description: 'Node worker-08 reported 94% CPU load for >5m.',
    time: '4 minutes ago',
    type: 'alert',
    read: false,
    priority: 'critical',
  },
  {
    id: 'notif_2',
    title: 'Database Failover Drill Scheduled',
    description: 'Primary replica failover test set for 02:00 UTC.',
    time: '2 hours ago',
    type: 'alert',
    read: false,
  },
  {
    id: 'notif_3',
    title: 'Pending Transfer Request #4829',
    description: 'Requires approval from VP of Platform.',
    time: '35 minutes ago',
    type: 'task',
    read: false,
    priority: 'critical',
  },
  {
    id: 'notif_4',
    title: 'New API Key Issue Approval',
    description: 'Service team "payment-gateway" requested prod scope.',
    time: '3 hours ago',
    type: 'task',
    read: true,
  },
  {
    id: 'notif_5',
    title: 'Marcus Chen mentioned you',
    description: '"@Seraphina Vance can you review this deployment step?"',
    time: '1 hour ago',
    type: 'mention',
    read: false,
  },
];

export function NotificationPopover() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const renderList = (items: NotificationItem[]) => {
    if (items.length === 0) {
      return (
        <div className="py-8 text-center text-xs text-muted-foreground">
          No notifications in this category.
        </div>
      );
    }

    return (
      <div className="divide-y divide-border/50 max-h-72 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className={`p-3 text-xs transition-colors hover:bg-muted/50 ${
              !item.read ? 'bg-primary/5' : ''
            }`}
          >
            <div className="flex items-start gap-2.5">
              {item.type === 'alert' && (
                <AlertTriangleIcon
                  className={`size-4 mt-0.5 shrink-0 ${
                    item.priority === 'critical' ? 'text-destructive' : 'text-amber-500'
                  }`}
                />
              )}
              {item.type === 'task' && (
                <CheckCircle2Icon className="size-4 mt-0.5 shrink-0 text-blue-500" />
              )}
              {item.type === 'mention' && (
                <MessageSquareIcon className="size-4 mt-0.5 shrink-0 text-purple-500" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-foreground truncate">{item.title}</span>
                  {!item.read && (
                    <span className="size-1.5 rounded-full bg-primary shrink-0" />
                  )}
                </div>
                <p className="text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground font-medium">
                  <ClockIcon className="size-3" />
                  <span>{item.time}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative size-9 p-0 rounded-full">
          <BellIcon className="size-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 shadow-xl border border-border/80">
        <div className="p-3 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllRead}
              className="h-6 text-[11px] px-2 text-muted-foreground hover:text-foreground"
            >
              <CheckCheckIcon className="size-3 mr-1" />
              Mark read
            </Button>
          </div>
        </div>

        <Tabs defaultValue="alerts" className="w-full">
          <TabsList className="w-full grid grid-cols-3 rounded-none border-b border-border/60 bg-muted/30 h-8">
            <TabsTrigger value="alerts" className="text-[11px]">
              Alerts ({notifications.filter((n) => n.type === 'alert').length})
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-[11px]">
              Tasks ({notifications.filter((n) => n.type === 'task').length})
            </TabsTrigger>
            <TabsTrigger value="mentions" className="text-[11px]">
              Mentions ({notifications.filter((n) => n.type === 'mention').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="m-0 focus-visible:outline-none">
            {renderList(notifications.filter((n) => n.type === 'alert'))}
          </TabsContent>
          <TabsContent value="tasks" className="m-0 focus-visible:outline-none">
            {renderList(notifications.filter((n) => n.type === 'task'))}
          </TabsContent>
          <TabsContent value="mentions" className="m-0 focus-visible:outline-none">
            {renderList(notifications.filter((n) => n.type === 'mention'))}
          </TabsContent>
        </Tabs>

        {notifications.length > 0 && (
          <div className="p-2 border-t border-border/60 text-center bg-muted/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="w-full h-7 text-[11px] text-muted-foreground hover:text-destructive"
            >
              Clear all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
