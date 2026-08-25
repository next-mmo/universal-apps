import { Link } from '@tanstack/react-router';

import { useTodos } from '../lib/todo-queries';
import { PageContainer } from '@package/pro/src/layout/page-container';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@package/ui/src/components/ui/card';
import { Badge } from '@package/ui/src/components/ui/badge';
import { Button } from '@package/ui/src/components/ui/button';
import { Skeleton } from '@package/ui/src/components/ui/skeleton';

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

      <Card>
        <CardHeader>
          <CardTitle>Component library</CardTitle>
          <CardDescription>
            Every block here is shadcn primitives + TanStack engines only — Table, Query, Form,
            Router — layered over a framework-free core for future Vue/Svelte adapters.
          </CardDescription>
        </CardHeader>
      </Card>
    </PageContainer>
  );
}
