import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input, Label } from '@package/ui-native';

export function CardDemo() {
  return (
    <Card className='mx-auto w-full max-w-sm'>
      <CardHeader>
        <CardTitle>New task</CardTitle>
        <CardDescription>Track something that needs doing.</CardDescription>
      </CardHeader>
      <CardContent className='gap-2'>
        <Label>Task</Label>
        <Input accessibilityLabel='Task' placeholder='What needs doing?' />
      </CardContent>
      <CardFooter className='justify-end'>
        <Button size='sm'>Create</Button>
      </CardFooter>
    </Card>
  );
}
