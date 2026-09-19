import { Link } from '@tanstack/react-router';

import { useTodos } from '../lib/todo-queries';
import { PageContainer } from '@package/pro/page-container';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@package/ui/card';
import { Badge } from '@package/ui/badge';
import { Button } from '@package/ui/button';
import { Skeleton } from '@package/ui/skeleton';
import { Avatar, AvatarFallback } from '@package/ui/avatar';
import { Toggle } from '@package/ui/toggle';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@package/ui/drawer';
import {
  AnimatedTabs,
  AnimatedTabsList,
  AnimatedTabsTrigger,
} from '@package/ui/animated-tabs';
import { ProDescriptions, ProDescriptionsItem } from '@package/pro/descriptions';

export default function DashboardPage() {
  const todos = useTodos();
  const rows = todos.data ?? [];
  const done = rows.filter((row) => row.status.label === 'Done').length;

  return (
    <PageContainer
      title='Dashboard'
      description='Live overview backed by TanStack Query over the universal bridge.'
      breadcrumbs={['App', 'Home', 'Dashboard']}
      extra={
        <Button asChild size='sm'>
          <Link to='/todos'>Open Todos</Link>
        </Button>
      }
    >
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
        {todos.isPending ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className='h-32 rounded-xl' />)
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardDescription>Total tasks</CardDescription>
                <CardTitle className='text-3xl'>{rows.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant='secondary'>all time</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Completed</CardDescription>
                <CardTitle className='text-3xl'>{done}</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant='success'>
                  {rows.length === 0 ? '0%' : `${Math.round((done / rows.length) * 100)}%`}
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Open</CardDescription>
                <CardTitle className='text-3xl'>{rows.length - done}</CardTitle>
              </CardHeader>
              <CardAction>
                <Button asChild variant='ghost' size='sm'>
                  <Link to='/forms'>Quick add →</Link>
                </Button>
              </CardAction>
              <CardContent>
                <Badge variant='warning'>in progress</Badge>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <ProDescriptions
        title='System Overview'
        bordered
        column={3}
        data={{
          platform: 'Tauri 2 + React 19',
          styling: 'Tailwind CSS v4 (Tokens)',
          reactNativeParity: true,
          componentsTotal: 22,
          offlineCapable: true,
          buildTool: 'Vite 7',
        }}
      >
        <ProDescriptionsItem label='Platform' dataIndex='platform' />
        <ProDescriptionsItem label='Styling Engine' dataIndex='styling' />
        <ProDescriptionsItem label='Native Parity' dataIndex='reactNativeParity' valueType='boolean' />
        <ProDescriptionsItem label='Components Total' dataIndex='componentsTotal' valueType='badge' />
        <ProDescriptionsItem label='Offline Capable' dataIndex='offlineCapable' valueType='boolean' />
        <ProDescriptionsItem label='Build Engine' dataIndex='buildTool' valueType='code' />
      </ProDescriptions>

      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Design System Controls</CardTitle>
              <CardDescription>
                Live preview of Avatar, Toggle, and Bottom Sheet Drawer primitives.
              </CardDescription>
            </div>
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2'>
                <Avatar size='sm'>
                  <AvatarFallback>TU</AvatarFallback>
                </Avatar>
                <Avatar size='default'>
                  <AvatarFallback>AG</AvatarFallback>
                </Avatar>
              </div>

              <Toggle variant='outline' defaultPressed>
                Live
              </Toggle>

              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant='outline' size='sm'>Open Drawer</Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>System Drawer</DrawerTitle>
                    <DrawerDescription>
                      Radix-backed slide-over sheet with hardware-accelerated transitions.
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className='py-4 text-sm text-muted-foreground'>
                    This drawer provides a slide-up inspection panel on Web, Desktop, and Mobile.
                  </div>
                  <DrawerFooter>
                    <DrawerClose asChild>
                      <Button variant='outline'>Close</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Fluid Animated Tabs Showcase */}
      <Card className='mt-4'>
        <CardHeader>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
            <div>
              <CardTitle>Fluid Animated Tabs</CardTitle>
              <CardDescription>
                Smooth sliding pill indicator rendered via GPU-accelerated CSS transitions with zero external runtime cost.
              </CardDescription>
            </div>
            <AnimatedTabs defaultValue='metrics'>
              <AnimatedTabsList>
                <AnimatedTabsTrigger value='metrics'>Metrics</AnimatedTabsTrigger>
                <AnimatedTabsTrigger value='logs'>Logs</AnimatedTabsTrigger>
                <AnimatedTabsTrigger value='settings'>Settings</AnimatedTabsTrigger>
              </AnimatedTabsList>
            </AnimatedTabs>
          </div>
        </CardHeader>
      </Card>
    </PageContainer>
  );
}
