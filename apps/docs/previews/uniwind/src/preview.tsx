import { useState, type ComponentType } from 'react';
import { Text, View } from 'react-native';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@package/ui-native';

import { AccordionDemo } from './demos/accordion';
import { BadgeDemo } from './demos/badge';
import { ButtonDemo } from './demos/button';
import { CardDemo } from './demos/card';
import { CheckboxDemo } from './demos/checkbox';
import { DialogDemo } from './demos/dialog';
import { DropdownMenuDemo } from './demos/dropdown-menu';
import { InputDemo } from './demos/input';
import { LabelDemo } from './demos/label';
import { PopoverDemo } from './demos/popover';
import { SelectDemo } from './demos/select';
import { SeparatorDemo } from './demos/separator';
import { SkeletonDemo } from './demos/skeleton';
import { SwitchDemo } from './demos/switch';
import { TableDemo } from './demos/table';
import { TabsDemo } from './demos/tabs';
import { TextareaDemo } from './demos/textarea';
import { TooltipDemo } from './demos/tooltip';

/**
 * Per-component demos selected by the docs panel via `?component=<id>`.
 * Without that parameter (a direct visit to /previews/uniwind/) the original
 * task-card example renders as the standalone demo.
 */
const demos: Record<string, ComponentType> = {
  accordion: AccordionDemo,
  badge: BadgeDemo,
  button: ButtonDemo,
  card: CardDemo,
  checkbox: CheckboxDemo,
  dialog: DialogDemo,
  'dropdown-menu': DropdownMenuDemo,
  input: InputDemo,
  label: LabelDemo,
  popover: PopoverDemo,
  select: SelectDemo,
  separator: SeparatorDemo,
  skeleton: SkeletonDemo,
  switch: SwitchDemo,
  table: TableDemo,
  tabs: TabsDemo,
  textarea: TextareaDemo,
  tooltip: TooltipDemo,
};

function TaskPreview() {
  const [title, setTitle] = useState('Ship the browser docs');
  const [saved, setSaved] = useState(false);

  return (
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
  );
}

export function Preview() {
  const componentId = new URLSearchParams(window.location.search).get('component') ?? '';
  const Demo = demos[componentId] ?? TaskPreview;

  return (
    <View className='min-h-screen bg-background p-4'>
      <Demo />
    </View>
  );
}
