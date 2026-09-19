import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Uniwind, useUniwind } from 'uniwind';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  Input,
  InputLabel,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Skeleton,
  Switch,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Calendar,
  Combobox,
  DatePicker,
  toast,
  Toaster,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './lib/universal/ui-native';
import {
  InteractiveDrawer,
  InteractiveDrawerClose,
  InteractiveDrawerDescription,
  InteractiveDrawerFooter,
  InteractiveDrawerHeader,
  InteractiveDrawerTitle,
} from './lib/universal/ui-native/components/ui/drawer-interactive';

import './index.css';

export default function App() {
  const { theme } = useUniwind();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [checked, setChecked] = useState(true);
  const [switchVal, setSwitchVal] = useState(true);
  const [radioVal, setRadioVal] = useState('one');
  const [selectedFramework, setSelectedFramework] = useState('native');
  const [activeTab, setActiveTab] = useState('overview');
  const [inputValue, setInputValue] = useState('');
  const [textareaValue, setTextareaValue] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [interactiveDrawerOpen, setInteractiveDrawerOpen] = useState(false);
  const [togglePressed, setTogglePressed] = useState(true);
  const [toggleGroupVal, setToggleGroupVal] = useState('center');
  const [comboboxVal, setComboboxVal] = useState('react');
  const [dateVal, setDateVal] = useState<Date | undefined>(() => new Date());

  return (
    <View className='flex-1 bg-background'>
      <ScrollView className='flex-1'>
        <View className='px-6 pt-12 pb-16'>
        {/* Header */}
        <View className='flex-row items-center justify-between pb-6'>
          <View>
            <Text className='font-sans text-2xl font-bold text-foreground'>uniwind-bare</Text>
            <Text className='font-sans text-sm text-muted-foreground'>Universal Apps Component Showcase</Text>
          </View>
          <Button variant='outline' size='sm' onPress={() => Uniwind.setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </Button>
        </View>

        <Separator className='my-4' />

        {/* Buttons Section */}
        <View className='py-4'>
          <Text className='mb-3 font-sans text-lg font-semibold text-foreground'>Buttons</Text>
          <View className='flex-row flex-wrap gap-2'>
            <Button variant='default'>Default</Button>
            <Button variant='secondary'>Secondary</Button>
            <Button variant='destructive'>Destructive</Button>
            <Button variant='outline'>Outline</Button>
            <Button variant='ghost'>Ghost</Button>
            <Button variant='link'>Link</Button>
          </View>
          <View className='mt-2 flex-row flex-wrap gap-2'>
            <Button size='sm'>Small</Button>
            <Button size='default'>Default</Button>
            <Button size='lg'>Large</Button>
            <Button disabled>Disabled</Button>
          </View>
        </View>

        <Separator className='my-4' />

        {/* Badges Section */}
        <View className='py-4'>
          <Text className='mb-3 font-sans text-lg font-semibold text-foreground'>Badges</Text>
          <View className='flex-row flex-wrap gap-2'>
            <Badge variant='default'>Default</Badge>
            <Badge variant='secondary'>Secondary</Badge>
            <Badge variant='destructive'>Destructive</Badge>
            <Badge variant='outline'>Outline</Badge>
            <Badge variant='success'>Success</Badge>
            <Badge variant='warning'>Warning</Badge>
          </View>
        </View>

        <Separator className='my-4' />

        {/* Card Section */}
        <View className='py-4'>
          <Text className='mb-3 font-sans text-lg font-semibold text-foreground'>Card</Text>
          <Card>
            <CardHeader>
              <View className='flex-row items-center justify-between'>
                <CardTitle>Universal App Card</CardTitle>
                <CardAction>
                  <Badge variant='secondary'>Active</Badge>
                </CardAction>
              </View>
              <CardDescription>Styled with Uniwind and cross-platform design tokens.</CardDescription>
            </CardHeader>
            <CardContent>
              <Text className='font-sans text-sm text-foreground'>
                This card contains header, title, description, content, action, and footer slots.
              </Text>
            </CardContent>
            <CardFooter>
              <Button size='sm' variant='outline'>Learn More</Button>
            </CardFooter>
          </Card>
        </View>

        <Separator className='my-4' />

        {/* Form Controls Section */}
        <View className='py-4'>
          <Text className='mb-3 font-sans text-lg font-semibold text-foreground'>Form Controls</Text>
          <View className='gap-4'>
            <View className='gap-1.5'>
              <InputLabel>Full Name</InputLabel>
              <Input
                placeholder='Enter your name...'
                value={inputValue}
                onChangeText={setInputValue}
              />
            </View>

            <View className='gap-1.5'>
              <InputLabel>Notes</InputLabel>
              <Textarea
                placeholder='Enter additional details...'
                value={textareaValue}
                onChangeText={setTextareaValue}
              />
            </View>

            <View className='flex-row items-center gap-3'>
              <Checkbox checked={checked} onCheckedChange={setChecked} />
              <Text className='font-sans text-sm text-foreground'>Accept terms and conditions</Text>
            </View>

            <View className='flex-row items-center justify-between'>
              <Text className='font-sans text-sm text-foreground'>Push Notifications</Text>
              <Switch checked={switchVal} onCheckedChange={setSwitchVal} />
            </View>
          </View>
        </View>

        <Separator className='my-4' />

        {/* Avatars & Toggles Section */}
        <View className='py-4'>
          <Text className='mb-3 font-sans text-lg font-semibold text-foreground'>Avatars & Toggles</Text>
          <View className='gap-4'>
            {/* Avatars row */}
            <View className='flex-row items-center gap-3'>
              <Avatar size='sm'>
                <AvatarFallback>SM</AvatarFallback>
              </Avatar>
              <Avatar size='default'>
                <AvatarFallback>MD</AvatarFallback>
              </Avatar>
              <Avatar size='lg'>
                <AvatarFallback>LG</AvatarFallback>
              </Avatar>
              <Avatar size='default' shape='square'>
                <AvatarFallback>SQ</AvatarFallback>
              </Avatar>
            </View>

            {/* Toggle & ToggleGroup */}
            <View className='flex-row flex-wrap items-center gap-3'>
              <Toggle
                pressed={togglePressed}
                onPressedChange={setTogglePressed}
                variant='outline'
              >
                Pin Item
              </Toggle>

              <ToggleGroup
                type='single'
                value={toggleGroupVal}
                onValueChange={(val) => val && setToggleGroupVal(val)}
                variant='outline'
              >
                <ToggleGroupItem value='left'>Left</ToggleGroupItem>
                <ToggleGroupItem value='center'>Center</ToggleGroupItem>
                <ToggleGroupItem value='right'>Right</ToggleGroupItem>
              </ToggleGroup>
            </View>
          </View>
        </View>

        <Separator className='my-4' />

        {/* Overlays & Menus */}
        <View className='py-4'>
          <Text className='mb-3 font-sans text-lg font-semibold text-foreground'>Overlays & Menus</Text>
          <View className='flex-row flex-wrap gap-3'>
            {/* Dialog */}
            <Button variant='default' onPress={() => setDialogOpen(true)}>
              Open Dialog
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Action</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to proceed with this configuration?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose>
                    <Button variant='outline' size='sm'>Cancel</Button>
                  </DialogClose>
                  <Button size='sm' onPress={() => setDialogOpen(false)}>Confirm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Bottom Sheet Drawer */}
            <Button variant='secondary' onPress={() => setDrawerOpen(true)}>
              Open Drawer
            </Button>
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Bottom Sheet Drawer</DrawerTitle>
                  <DrawerDescription>
                    Native slide-up modal with drag handle and backdrop dismiss.
                  </DrawerDescription>
                </DrawerHeader>
                <View className='py-2'>
                  <Text className='font-sans text-sm text-muted-foreground'>
                    This bottom sheet provides a native mobile experience for filters, actions, and details.
                  </Text>
                </View>
                <DrawerFooter>
                  <DrawerClose>
                    <Button variant='outline' size='sm'>Dismiss</Button>
                  </DrawerClose>
                  <Button size='sm' onPress={() => setDrawerOpen(false)}>Apply</Button>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>

            {/* Interactive Sheet (Reanimated) */}
            <Button variant='outline' onPress={() => setInteractiveDrawerOpen(true)}>
              Interactive Sheet (120 FPS)
            </Button>
            <InteractiveDrawer open={interactiveDrawerOpen} onOpenChange={setInteractiveDrawerOpen}>
              <InteractiveDrawerHeader>
                <InteractiveDrawerTitle>Interactive Gesture Sheet</InteractiveDrawerTitle>
                <InteractiveDrawerDescription>
                  120 FPS worklets on native UI thread with drag tracking, rubber-banding, and velocity flick dismiss.
                </InteractiveDrawerDescription>
              </InteractiveDrawerHeader>
              <View className='py-2'>
                <Text className='font-sans text-sm text-muted-foreground'>
                  Drag this sheet down with your finger. It springs back to open or dismisses when flicked.
                </Text>
              </View>
              <InteractiveDrawerFooter>
                <InteractiveDrawerClose>
                  <Button variant='outline' size='sm'>Close</Button>
                </InteractiveDrawerClose>
              </InteractiveDrawerFooter>
            </InteractiveDrawer>

            {/* Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant='outline'>Actions Menu ⌄</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onSelect={() => console.log('Edit')}>Edit</DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => console.log('Duplicate')}>Duplicate</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked={checked} onCheckedChange={setChecked}>
                  Enable Feature
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant='destructive' onSelect={() => console.log('Delete')}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Select */}
            <Select value={selectedFramework} onValueChange={setSelectedFramework}>
              <SelectTrigger>
                <SelectValue placeholder='Select platform' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='react'>React DOM</SelectItem>
                <SelectItem value='native'>React Native</SelectItem>
                <SelectItem value='vue'>Vue 3</SelectItem>
                <SelectItem value='svelte'>Svelte 5</SelectItem>
              </SelectContent>
            </Select>

            {/* Popover */}
            <Popover>
              <PopoverTrigger>
                <Button variant='secondary'>Info Popover</Button>
              </PopoverTrigger>
              <PopoverContent>
                <Text className='font-sans text-sm font-semibold text-foreground'>Popover Content</Text>
                <Text className='mt-1 font-sans text-xs text-muted-foreground'>
                  Floating content anchored to trigger without full screen modal capture.
                </Text>
              </PopoverContent>
            </Popover>

            {/* Tooltip */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Button variant='ghost' size='sm'>Hover Tooltip</Button>
                </TooltipTrigger>
                <TooltipContent>
                  <Text className='text-xs text-popover-foreground'>Helpful contextual guidance</Text>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </View>
        </View>

        <Separator className='my-4' />

        {/* Navigation & Panels (Accordion & Tabs) */}
        <View className='py-4'>
          <Text className='mb-3 font-sans text-lg font-semibold text-foreground'>Accordion & Tabs</Text>

          {/* Accordion */}
          <Accordion type='single'>
            <AccordionItem value='item-1'>
              <AccordionTrigger>What is Universal Apps?</AccordionTrigger>
              <AccordionContent>
                <Text className='font-sans text-sm text-muted-foreground'>
                  A framework for building cross-platform apps with shared UI tokens and native runtime adapters.
                </Text>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value='item-2'>
              <AccordionTrigger>How does Uniwind work?</AccordionTrigger>
              <AccordionContent>
                <Text className='font-sans text-sm text-muted-foreground'>
                  Uniwind compiles Tailwind CSS v4 stylesheets into React Native style structures at bundle time.
                </Text>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Tabs */}
          <View className='mt-4'>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value='overview'>Overview</TabsTrigger>
                <TabsTrigger value='specs'>Specs</TabsTrigger>
                <TabsTrigger value='runtime'>Runtime</TabsTrigger>
              </TabsList>
              <TabsContent value='overview'>
                <Text className='p-3 font-sans text-sm text-foreground'>Overview panel content displayed here.</Text>
              </TabsContent>
              <TabsContent value='specs'>
                <Text className='p-3 font-sans text-sm text-foreground'>Technical specifications panel content.</Text>
              </TabsContent>
              <TabsContent value='runtime'>
                <Text className='p-3 font-sans text-sm text-foreground'>React Native Bare runtime details.</Text>
              </TabsContent>
            </Tabs>
          </View>
        </View>

        <Separator className='my-4' />

        {/* Table & Skeleton */}
        <View className='py-4'>
          <Text className='mb-3 font-sans text-lg font-semibold text-foreground'>Table & Skeleton</Text>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><Text className='font-sans text-sm text-foreground'>Button</Text></TableCell>
                <TableCell><Text className='font-sans text-sm text-muted-foreground'>Bare RN</Text></TableCell>
                <TableCell><Badge variant='success'>Ready</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell><Text className='font-sans text-sm text-foreground'>Dialog</Text></TableCell>
                <TableCell><Text className='font-sans text-sm text-muted-foreground'>Bare RN</Text></TableCell>
                <TableCell><Badge variant='success'>Ready</Badge></TableCell>
              </TableRow>
            </TableBody>
            <TableCaption>All 18 primitives verified on bare React Native runtime.</TableCaption>
          </Table>

          <View className='mt-4 gap-2'>
            <Text className='font-sans text-xs text-muted-foreground'>Animated Skeleton Placeholders:</Text>
            <Skeleton className='h-4 w-3/4 rounded' />
            <Skeleton className='h-4 w-1/2 rounded' />
          </View>
        </View>

        {/* Phase 2: Toast, Combobox, DatePicker */}
        <Separator className='my-4' />
        <View className='py-4'>
          <Text className='mb-3 font-sans text-lg font-semibold text-foreground'>
            Phase 2: Toast, Combobox & DatePicker
          </Text>

          <View className='flex-row flex-wrap gap-2 mb-4'>
            <Button
              variant='outline'
              size='sm'
              onPress={() => toast.success('Saved to local store!', { description: 'Synchronized across runtimes.' })}
            >
              Toast Success
            </Button>
            <Button
              variant='outline'
              size='sm'
              onPress={() => toast.error('Connection timeout', { description: 'Retrying in 5 seconds.' })}
            >
              Toast Error
            </Button>
          </View>

          <View className='mb-4 gap-2'>
            <Text className='font-sans text-xs font-semibold text-muted-foreground'>Combobox Dropdown:</Text>
            <Combobox
              options={[
                { label: 'React Native', value: 'rn' },
                { label: 'Tauri Web', value: 'tauri' },
                { label: 'Uniwind Engine', value: 'uniwind' },
              ]}
              value={comboboxVal}
              onValueChange={setComboboxVal}
              placeholder='Select framework...'
            />
          </View>

          <View className='mb-4 gap-2'>
            <Text className='font-sans text-xs font-semibold text-muted-foreground'>Date Picker Popover:</Text>
            <DatePicker
              value={dateVal}
              onValueChange={setDateVal}
              placeholder='Select event date...'
            />
          </View>
        </View>
      </View>
    </ScrollView>
    <Toaster />
  </View>
  );
}
