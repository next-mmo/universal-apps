import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Uniwind, useUniwind } from 'uniwind';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  Input,
  InputLabel,
  Label,
  Popover,
  Select,
  SelectItem,
  SelectValue,
  Separator,
  Skeleton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Tooltip,
} from '@package/ui-native';

import './index.css';

export function Playground() {
  return <PlaygroundScreen />;
}

function PlaygroundScreen() {
  const { theme } = useUniwind();
  const [pinned, setPinned] = useState(false);
  const [name, setName] = useState('');
  const [checked, setChecked] = useState(false);
  const [todoDone, setTodoDone] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [menuPinned, setMenuPinned] = useState(false);
  const [platform, setPlatform] = useState('react');
  const [tab, setTab] = useState('account');
  const [notes, setNotes] = useState('');

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

      <Section title='Checkbox + Label'>
        <View className='flex-row items-center gap-2.5'>
          <Checkbox checked={checked} onCheckedChange={setChecked} />
          <Label className='text-sm'>Accept terms and conditions</Label>
        </View>
        <View className='flex-row items-center gap-2.5'>
          <Checkbox checked={todoDone} onCheckedChange={setTodoDone} />
          <Label className='text-sm'>Ship the ui-native port</Label>
        </View>
      </Section>

      <Section title='Skeleton'>
        <View className='gap-2'>
          <Skeleton className='h-4 w-2/3' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-1/2' />
        </View>
      </Section>

      <Section title='Textarea'>
        <Textarea
          value={notes}
          onChangeText={setNotes}
          placeholder='Add notes…'
          className='min-h-16'
        />
      </Section>

      <Section title='Table'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Port ui-native</TableCell>
              <TableCell><Badge variant='success'>Done</Badge></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Wire the pro blocks</TableCell>
              <TableCell><Badge variant='warning'>In progress</Badge></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Section>

      <Section title='Accordion'>
        <Accordion defaultValue='item-1'>
          <AccordionItem value='item-1'>
            <AccordionTrigger value='item-1'>What is Uniwind?</AccordionTrigger>
            <AccordionContent value='item-1'>
              <Text className='font-sans text-sm text-muted-foreground'>
                A Tailwind v4 compiler for React Native — the same classes compile to RN styles.
              </Text>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='item-2'>
            <AccordionTrigger value='item-2'>Is it Metro-only?</AccordionTrigger>
            <AccordionContent value='item-2'>
              <Text className='font-sans text-sm text-muted-foreground'>
                No — this playground runs it through Vite with react-native-web.
              </Text>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Section>

      <Section title='Tabs'>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value='account'>Account</TabsTrigger>
            <TabsTrigger value='password'>Password</TabsTrigger>
          </TabsList>
          <TabsContent value='account'>
            <Text className='font-sans text-sm text-muted-foreground'>
              Account settings would go here.
            </Text>
          </TabsContent>
          <TabsContent value='password'>
            <Text className='font-sans text-sm text-muted-foreground'>
              Password settings would go here.
            </Text>
          </TabsContent>
        </Tabs>
      </Section>

      <Section title='Select'>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectValue>{platform === 'react' ? 'React' : platform === 'vue' ? 'Vue' : 'Svelte'}</SelectValue>
          <SelectItem value='react'>React</SelectItem>
          <SelectItem value='vue'>Vue</SelectItem>
          <SelectItem value='svelte'>Svelte</SelectItem>
        </Select>
      </Section>

      <Section title='Dialog'>
        <Button variant='outline' onPress={() => setDialogOpen(true)}>
          Open dialog
        </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogHeader>
            <DialogTitle>Delete task</DialogTitle>
            <DialogDescription>
              This cannot be undone. The task will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onPress={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant='destructive' onPress={() => setDialogOpen(false)}>Delete</Button>
          </DialogFooter>
        </Dialog>
      </Section>

      <Section title='Dropdown menu'>
        <DropdownMenu
          trigger={<Button variant='outline'>Actions ⌄</Button>}
        >
          <DropdownMenuLabel>Task</DropdownMenuLabel>
          <DropdownMenuItem>Rename</DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked={menuPinned} onCheckedChange={setMenuPinned}>
            Pinned
          </DropdownMenuCheckboxItem>
          <DropdownMenuItem variant='destructive'>Delete</DropdownMenuItem>
        </DropdownMenu>
      </Section>

      <Section title='Popover + Tooltip'>
        <View className='flex-row flex-wrap items-center gap-2'>
          <Popover
            trigger={<Button variant='outline'>Open popover</Button>}
          >
            <Text className='font-sans text-sm text-foreground'>
              Arbitrary content goes here — filters, forms, anything.
            </Text>
          </Popover>
          <Tooltip content='Press and hold to see this tip'>
            <Button variant='outline'>Hover me</Button>
          </Tooltip>
        </View>
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
