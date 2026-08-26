/**
 * Live rendered demos embedded into the Components docs pages.
 * Each demo is intentionally uncontrolled and stateless so it renders
 * identically on every page load.
 */
import {
  Badge,
} from '@package/ui/src/components/ui/badge';
import { Button } from '@package/ui/src/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@package/ui/src/components/ui/card';
import { Checkbox } from '@package/ui/src/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@package/ui/src/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@package/ui/src/components/ui/dropdown-menu';
import { Input } from '@package/ui/src/components/ui/input';
import { Label } from '@package/ui/src/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@package/ui/src/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@package/ui/src/components/ui/select';
import { Separator } from '@package/ui/src/components/ui/separator';
import { Skeleton } from '@package/ui/src/components/ui/skeleton';
import { Switch } from '@package/ui/src/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@package/ui/src/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@package/ui/src/components/ui/tabs';
import { Textarea } from '@package/ui/src/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@package/ui/src/components/ui/tooltip';
import { InfoIcon, MoreHorizontalIcon, PlusIcon } from 'lucide-react';

const row = 'flex flex-wrap items-center gap-3';

export function BadgeDemo() {
  return (
    <div className={row}>
      <Badge>Default</Badge>
      <Badge variant='secondary'>Secondary</Badge>
      <Badge variant='destructive'>Destructive</Badge>
      <Badge variant='outline'>Outline</Badge>
    </div>
  );
}

export function ButtonDemo() {
  return (
    <div className='flex flex-col gap-3'>
      <div className={row}>
        <Button>Default</Button>
        <Button variant='secondary'>Secondary</Button>
        <Button variant='destructive'>Destructive</Button>
        <Button variant='outline'>Outline</Button>
        <Button variant='ghost'>Ghost</Button>
        <Button variant='link'>Link</Button>
      </div>
      <div className={row}>
        <Button size='sm' variant='secondary'>Small</Button>
        <Button variant='secondary'>Default</Button>
        <Button size='lg' variant='secondary'>Large</Button>
        <Button size='icon' variant='outline' aria-label='Add'><PlusIcon /></Button>
      </div>
    </div>
  );
}

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

export function CheckboxDemo() {
  return (
    <div className={row}>
      <Checkbox id='demo-pin' defaultChecked />
      <Label htmlFor='demo-pin'>Pin to top</Label>
      <Checkbox id='demo-disabled' disabled />
      <Label htmlFor='demo-disabled' className='text-muted-foreground'>Disabled</Label>
    </div>
  );
}

export function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline'>Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete task?</DialogTitle>
          <DialogDescription>This action cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='outline' size='sm'>Cancel</Button>
          <Button variant='destructive' size='sm'>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DropdownMenuDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' size='icon' aria-label='Row actions'><MoreHorizontalIcon /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start'>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onSelect={() => undefined}>Mark done</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => undefined}>Duplicate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant='destructive' onSelect={() => undefined}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function InputDemo() {
  return (
    <div className='grid max-w-xs gap-2'>
      <Label htmlFor='demo-task-input'>Task</Label>
      <Input id='demo-task-input' placeholder='What needs doing?' />
    </div>
  );
}

export function LabelDemo() {
  return (
    <div className='grid max-w-xs gap-2'>
      <Label htmlFor='demo-label-priority'>Priority</Label>
      <Input id='demo-label-priority' defaultValue='Normal' />
    </div>
  );
}

export function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline'>Open popover</Button>
      </PopoverTrigger>
      <PopoverContent align='start' className='w-64 text-sm'>
        <p className='font-medium'>Popover title</p>
        <p className='text-muted-foreground'>Any content can live here — forms, filters, hints.</p>
      </PopoverContent>
    </Popover>
  );
}

export function SelectDemo() {
  return (
    <Select defaultValue='normal'>
      <SelectTrigger className='w-44'>
        <SelectValue placeholder='Priority' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='low'>Low</SelectItem>
        <SelectItem value='normal'>Normal</SelectItem>
        <SelectItem value='high'>High</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function SeparatorDemo() {
  return (
    <div className='max-w-sm'>
      <p className='text-sm'>Content above the divider.</p>
      <Separator className='my-4' />
      <p className='text-sm'>Content below the divider.</p>
    </div>
  );
}

export function SkeletonDemo() {
  return (
    <div className='flex max-w-sm items-center gap-4'>
      <Skeleton className='size-12 rounded-full' />
      <div className='grid flex-1 gap-2'>
        <Skeleton className='h-4 w-3/4' />
        <Skeleton className='h-4 w-1/2' />
      </div>
    </div>
  );
}

export function SwitchDemo() {
  return (
    <div className={row}>
      <Switch id='demo-pin-switch' defaultChecked />
      <Label htmlFor='demo-pin-switch'>Surface this task at the top</Label>
    </div>
  );
}

export function TableDemo() {
  const tasks = [
    { text: 'Write docs', status: 'In progress' },
    { text: 'Ship release', status: 'Open' },
  ];
  return (
    <Table className='max-w-sm'>
      <TableHeader>
        <TableRow>
          <TableHead>Task</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.text}>
            <TableCell>{task.text}</TableCell>
            <TableCell>{task.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

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

export function TextareaDemo() {
  return (
    <div className='grid max-w-xs gap-2'>
      <Label htmlFor='demo-notes'>Notes</Label>
      <Textarea id='demo-notes' placeholder='Optional details…' rows={3} />
    </div>
  );
}

export function TooltipDemo() {
  return (
    <div className={row}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant='ghost' size='icon' aria-label='Info'><InfoIcon /></Button>
        </TooltipTrigger>
        <TooltipContent>More information</TooltipContent>
      </Tooltip>
      <span className='text-muted-foreground text-sm'>Hover the icon button.</span>
    </div>
  );
}
