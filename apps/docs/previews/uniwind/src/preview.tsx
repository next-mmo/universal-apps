import { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@package/ui-native';

export function Preview() {
  const [title, setTitle] = useState('Ship the browser docs');
  const [saved, setSaved] = useState(false);

  return (
    <View className='min-h-screen bg-background p-4'>
      <Card className='mx-auto w-full max-w-lg'>
        <CardHeader>
          <CardTitle>New task</CardTitle>
          <CardDescription>Create a task with React Native Web and UniWind.</CardDescription>
        </CardHeader>
        <CardContent className='gap-3'>
          <Input accessibilityLabel='Task title' value={title} onChangeText={setTitle} placeholder='Task title' />
          <View className='flex-row items-center justify-between gap-3'>
            <Text accessibilityLiveRegion='polite' className='flex-1 text-sm text-muted-foreground'>
              {saved ? `Added: ${title || 'Untitled task'}` : 'Ready to add'}
            </Text>
            <Button onPress={() => setSaved(true)}>Add task</Button>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}
