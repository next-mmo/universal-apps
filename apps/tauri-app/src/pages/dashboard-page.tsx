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
import { useState } from 'react';
import {
  AnimatedTabs,
  AnimatedTabsList,
  AnimatedTabsTrigger,
} from '@package/ui/animated-tabs';
import { Combobox } from '@package/ui/combobox';
import { DatePicker } from '@package/ui/date-picker';
import { toast } from '@package/ui/toast';
import { ProDescriptions, ProDescriptionsItem } from '@package/pro/descriptions';
import { ProFilterToolbar } from '@package/pro/filter-toolbar';
import { ProFormDrawer } from '@package/pro/form-drawer';
import { ProStepForm } from '@package/pro/step-form';
import type { ProFormGroup } from '@package/pro-core/form';

const onboardingSteps = [
  {
    title: 'Workspace',
    description: 'Project fundamentals',
    schema: [
      {
        fields: [
          { name: 'projectName', label: 'Project Name', type: 'text' as const, required: true, placeholder: 'e.g. Acme Cloud' },
          { name: 'organization', label: 'Organization', type: 'text' as const, placeholder: 'e.g. Acme Corp' },
        ],
      },
    ],
  },
  {
    title: 'Deployment',
    description: 'Target environments',
    schema: [
      {
        fields: [
          {
            name: 'environment',
            label: 'Default Environment',
            type: 'select' as const,
            options: [
              { label: 'Production (Edge)', value: 'prod' },
              { label: 'Staging', value: 'staging' },
              { label: 'Development', value: 'dev' },
            ],
          },
          { name: 'notifyOnDeploy', label: 'Email notifications on deploy', type: 'switch' as const },
        ],
      },
    ],
  },
];

const filterFields = [
  { name: 'search', label: 'Keyword', type: 'text' as const, placeholder: 'Search audits...' },
  {
    name: 'status',
    label: 'Status',
    type: 'select' as const,
    options: [
      { label: 'All', value: 'all' },
      { label: 'Active', value: 'active' },
      { label: 'Completed', value: 'completed' },
      { label: 'Archived', value: 'archived' },
    ],
  },
  { name: 'date', label: 'Audit Date', type: 'date' as const },
];

const quickTaskSchema: ProFormGroup[] = [
  {
    title: 'Quick Task',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true, placeholder: 'e.g. Deploy release v1.0' },
      {
        name: 'priority',
        label: 'Priority',
        type: 'select',
        options: [
          { label: 'Low', value: 'low' },
          { label: 'Medium', value: 'medium' },
          { label: 'High', value: 'high' },
        ],
      },
    ],
  },
];

export default function DashboardPage() {
  const todos = useTodos();
  const rows = todos.data ?? [];
  const done = rows.filter((row) => row.status.label === 'Done').length;
  const [selectedTech, setSelectedTech] = useState('react');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => new Date());

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
          componentsTotal: 31,
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

      {/* Phase 2 Competitive Parity Showcase */}
      <Card className='mt-4'>
        <CardHeader>
          <CardTitle>Phase 2 Competitive Parity</CardTitle>
          <CardDescription>
            Live demonstration of Sonner-like Toast, Combobox, DatePicker, and Ant Design Pro FormDrawer with zero extra npm dependencies.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-wrap items-center gap-4'>
          {/* Toast Triggers */}
          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              variant='outline'
              onClick={() => toast.success('Task completed successfully!', { description: 'All checks passed.' })}
            >
              Toast Success
            </Button>
            <Button
              size='sm'
              variant='outline'
              onClick={() => toast.error('Failed to sync changes', { description: 'Network offline or timeout.' })}
            >
              Toast Error
            </Button>
          </div>

          {/* Combobox */}
          <div className='w-48'>
            <Combobox
              options={[
                { label: 'React / Tauri', value: 'react' },
                { label: 'React Native Web', value: 'rn-web' },
                { label: 'Vue 3 Adapter', value: 'vue' },
                { label: 'Svelte 5 Adapter', value: 'svelte' },
              ]}
              value={selectedTech}
              onValueChange={setSelectedTech}
              placeholder='Select tech...'
            />
          </div>

          {/* Date Picker */}
          <div className='w-48'>
            <DatePicker
              value={selectedDate}
              onValueChange={setSelectedDate}
              placeholder='Pick milestone date...'
            />
          </div>

          {/* ProFormDrawer */}
          <ProFormDrawer
            trigger={<Button size='sm'>Open Form Drawer</Button>}
            title='New Quick Task'
            description='Slide-over form drawer powered by universal ProForm.'
            schema={quickTaskSchema}
            defaultValues={{ title: '', priority: 'medium' }}
            onSubmit={async (values) => {
              toast.success(`Created task: ${String(values.title || 'Untitled')}`);
              return true;
            }}
          />
        </CardContent>
      </Card>

      {/* Phase 3 Enterprise Pro Showcase */}
      <Card className='mt-4'>
        <CardHeader>
          <CardTitle>Phase 3 Enterprise Pro: FilterToolbar & StepForm Wizard</CardTitle>
          <CardDescription>
            Ant Design Pro QueryFilter and StepsForm parity with zero runtime styling overhead and per-step validation.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-6'>
          {/* Filter Toolbar Demo */}
          <div className='flex flex-col gap-2'>
            <div className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
              QueryFilter Toolbar
            </div>
            <ProFilterToolbar
              fields={filterFields}
              onFilter={(filters) => {
                toast.info('Applied filter query', {
                  description: JSON.stringify(filters),
                });
              }}
              onReset={() => {
                toast.info('Filters reset to defaults');
              }}
            />
          </div>

          {/* Multi-Step Wizard Form Demo */}
          <div className='flex flex-col gap-2'>
            <div className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
              StepsForm Wizard
            </div>
            <ProStepForm
              steps={onboardingSteps}
              defaultValues={{
                projectName: 'Acme Mobile App',
                organization: 'Acme Global',
                environment: 'prod',
                notifyOnDeploy: true,
              }}
              onSubmit={async (values) => {
                toast.success('Workspace created via StepForm!', {
                  description: `Project: ${String(values.projectName)} (${String(values.environment)})`,
                });
              }}
            />
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
