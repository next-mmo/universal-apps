import { Tabs, TabsContent, TabsList, TabsTrigger } from '@package/ui/tabs';

/** Live tabs demo shared by the Tabs docs page and the framework preview. */
export function TabsDemo() {
  return (
    <Tabs defaultValue='preview' className='max-w-sm'>
      <TabsList>
        <TabsTrigger value='preview'>Preview</TabsTrigger>
        <TabsTrigger value='code'>Code</TabsTrigger>
      </TabsList>
      <TabsContent value='preview' className='text-sm text-muted-foreground'>
        The rendered output lives here.
      </TabsContent>
      <TabsContent value='code' className='text-sm text-muted-foreground'>
        The source lives here.
      </TabsContent>
    </Tabs>
  );
}
