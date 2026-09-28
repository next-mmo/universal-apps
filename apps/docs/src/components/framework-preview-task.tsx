import { useState } from 'react';

import { Button } from '@package/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@package/ui/card';
import { Input } from '@package/ui/input';

/**
 * The React DOM example shown by the "Live framework preview" panel.
 *
 * The panel displays this file's real source with a `?raw` import, so the code a
 * reader copies is always the code that renders. Keep it self-contained for that
 * reason: no props, no imports from the panel itself.
 */
export function FrameworkPreviewTask() {
  const [title, setTitle] = useState('Ship the browser docs');
  const [saved, setSaved] = useState(false);

  return (
    <Card className='mx-auto max-w-lg'>
      <CardHeader>
        <CardTitle>New task</CardTitle>
        <CardDescription>Create a task with the shared React DOM components.</CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-3'>
        <Input
          aria-label='Task title'
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder='Task title'
        />
        <div className='flex items-center justify-between gap-3'>
          <span role='status' className='text-sm text-muted-foreground'>
            {saved ? `Added: ${title || 'Untitled task'}` : 'Ready to add'}
          </span>
          <Button onClick={() => setSaved(true)}>Add task</Button>
        </div>
      </CardContent>
    </Card>
  );
}
