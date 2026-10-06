import { Button } from '@package/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@package/ui/card';
import { Input } from '@package/ui/input';
import { Label } from '@package/ui/label';

/** Live card demo shared by the Card docs page and the framework preview. */
export function CardDemo() {
  return (
    <Card className='max-w-sm'>
      <CardHeader>
        <CardTitle>New task</CardTitle>
        <CardDescription>Track something that needs doing.</CardDescription>
      </CardHeader>
      <CardContent className='grid gap-2'>
        <Label htmlFor='card-demo-task'>Task</Label>
        <Input id='card-demo-task' placeholder='What needs doing?' />
      </CardContent>
      <CardFooter className='justify-end'>
        <Button size='sm'>Create</Button>
      </CardFooter>
    </Card>
  );
}
