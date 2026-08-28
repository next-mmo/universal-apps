import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Uniwind, useUniwind } from 'uniwind';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  InputLabel,
  Separator,
  Switch,
} from '@package/ui-native';

import './index.css';

export function Playground() {
  return <PlaygroundScreen />;
}

function PlaygroundScreen() {
  const { theme } = useUniwind();
  const [pinned, setPinned] = useState(false);
  const [name, setName] = useState('');

  return (
    <ScrollView className='flex-1 bg-background'>
      <View className='flex-row items-center justify-between px-6 pt-8 pb-2'>
        <Text className='font-sans text-[22px] font-bold text-foreground'>ui-native playground</Text>
        <Button variant='outline' onPress={() => Uniwind.setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </Button>
      </View>

      <Section title='Buttons'>
        <View className='flex-row flex-wrap items-center gap-2'>
          <Button>Default</Button>
          <Button variant='secondary'>Secondary</Button>
          <Button variant='destructive'>Delete</Button>
          <Button variant='outline'>Outline</Button>
          <Button variant='ghost'>Ghost</Button>
          <Button variant='link'>Link</Button>
        </View>
        <View className='flex-row flex-wrap items-center gap-2'>
          <Button size='sm' variant='secondary'>Small</Button>
          <Button size='lg' variant='secondary'>Large</Button>
          <Button size='icon' variant='outline' onPress={() => setPinned(!pinned)}>★</Button>
        </View>
      </Section>

      <Section title='Badges'>
        <View className='flex-row flex-wrap items-center gap-2'>
          <Badge>Default</Badge>
          <Badge variant='secondary'>Secondary</Badge>
          <Badge variant='destructive'>Destructive</Badge>
          <Badge variant='outline'>Outline</Badge>
          <Badge variant='success'>Done</Badge>
          <Badge variant='warning'>In progress</Badge>
        </View>
      </Section>

      <Section title='Card + form controls'>
        <Card>
          <CardHeader>
            <CardTitle>New task</CardTitle>
            <CardDescription>Schema would come from @package/pro-core.</CardDescription>
          </CardHeader>
          <CardContent className='gap-3'>
            <InputLabel>Task</InputLabel>
            <Input value={name} onChangeText={setName} placeholder='What needs doing?' />
            <View className='flex-row items-center gap-2.5'>
              <Switch checked={pinned} onCheckedChange={setPinned} />
              <Text className='font-sans text-sm text-foreground'>Pin to top</Text>
            </View>
          </CardContent>
          <CardFooter>
            <Button onPress={() => setName('')}>Create</Button>
          </CardFooter>
        </Card>
      </Section>

      <Section title='Separator'>
        <Text className='font-sans text-sm text-foreground'>Above the divider</Text>
        <Separator />
        <Text className='font-sans text-sm text-foreground'>Below the divider</Text>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className='mt-6 px-6'>
      <Text className='mb-2 font-sans text-[11px] font-semibold uppercase tracking-wider text-muted-foreground'>
        {title}
      </Text>
      <View className='gap-3'>{children}</View>
    </View>
  );
}
