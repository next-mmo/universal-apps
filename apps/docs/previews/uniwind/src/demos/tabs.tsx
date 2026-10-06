import { Text } from 'react-native';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@package/ui-native';

export function TabsDemo() {
  return (
    <Tabs defaultValue='preview' className='w-full max-w-sm'>
      <TabsList>
        <TabsTrigger value='preview'>Preview</TabsTrigger>
        <TabsTrigger value='code'>Code</TabsTrigger>
      </TabsList>
      <TabsContent value='preview'>
        <Text className='font-sans text-sm text-muted-foreground'>The rendered output lives here.</Text>
      </TabsContent>
      <TabsContent value='code'>
        <Text className='font-sans text-sm text-muted-foreground'>The source lives here.</Text>
      </TabsContent>
    </Tabs>
  );
}
